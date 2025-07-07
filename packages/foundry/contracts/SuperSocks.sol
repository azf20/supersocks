//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "solady/auth/Ownable.sol";
import "solady/tokens/ERC1155.sol";
import "solady/tokens/ERC20.sol";
import "./Metadata.sol";

/**
 * @title SuperSocks
 * @author azf20
 * @notice A smart contract that allows minting SuperSocks with USDC payments
 * @dev This contract manages sock minting, fee distribution, and withdrawals
 * 
 * Features:
 * - Mint socks with USDC payments
 * - Configurable fees for creators and platform
 * - Slippage tolerance to allow for crosschain payments
 * - Automatic fee distribution to creators and minters
 * - Withdrawal functionality for all parties
 */
contract SuperSocks is Ownable, ERC1155 {
    // Custom errors
    error NoUSDCToWithdraw();
    error InvalidTokenId();
    error InsufficientUSDC();
    error NotLive();
    error ZeroAmount();

    event UserWithdrawal(address indexed minter, uint256 amount);
    event OwnerWithdrawal(uint256 amount);
    event SockCreated(uint256 indexed sockId, address indexed creator);
    event CreatorPaid(uint256 indexed sockId, address indexed creator, uint256 amount);
    event MinterPaid(address indexed minter, uint256 amount);
    event SocksPaid(address indexed sockRecipient, uint256 total, uint256 creatorFee, uint256 platformFee);
    event MetadataSet(address indexed metadata);
    event ConfigSet(Config config);
    event PlatformFeePaid(uint256 amount);
    event CutoffDateSet(uint256 cutoffDate);

    /**
     * @notice Configuration struct for contract parameters
     * @param usdcPrice Price per sock in USDC smallest units (e.g., 1000000 = 1 USDC)
     * @param slippage Slippage tolerance in basis points (1 = 0.01%, 100 = 1%)
     * @param creatorFee Creator fee in basis points (1000 = 10%)
     * @param platformFee Platform fee in basis points (1000 = 10%)
     * @param isLive Whether minting is currently live
     */
    struct Config {
        uint256 usdcPrice;      /// @dev Price per sock in USDC smallest units
        uint256 slippage;       /// @dev Slippage tolerance in basis points (1 = 0.01%)
        uint256 creatorFee;     /// @dev Creator fee in basis points (1000 = 10%)
        uint256 platformFee;    /// @dev Platform fee in basis points (1000 = 10%)
        bool isLive;           /// @dev Whether minting is live
    }

    address public immutable usdc;
    Metadata public metadata;
    Config public config;

    uint256 public cutoffDate;

    mapping(uint256 => address) public creator;
    mapping(address => uint256) public creatorBalance;
    mapping(address => uint256) public minterBalance;
    uint256 public platformBalance;

    uint256 public totalSupply;

    /**
     * @notice Get the total USDC balance for a user (creator + minter balances)
     * @param user The address to check balance for
     * @return Total USDC balance for the user
     */
    function userBalance(address user) public view returns (uint256) {
        return creatorBalance[user] + minterBalance[user];
    }

    /**
     * @notice Returns the token collection name
     * @return The name of the token collection
     */
    function name() public pure returns (string memory) {
        return "SuperSocks";
    }

    /**
     * @notice Returns the token collection symbol
     * @return The symbol of the token collection
     */
    function symbol() public pure returns (string memory) {
        return "SOCKS";
    }

    /**
     * @notice Returns the Uniform Resource Identifier (URI) for a given token ID
     * @param id The token ID to get the URI for
     * @return The token URI containing metadata
     */
    function uri(uint256 id) public view override returns (string memory) {
        return metadata.tokenURI(id);
    }

    /**
     * @notice Returns the contract URI for marketplace metadata
     * @return The contract URI as a data URI
     */
    function contractURI() public pure returns (string memory) {
        string memory json = '{"name": "SuperSocks","description":"Onchain customizable socks."}';
        return string.concat("data:application/json;utf8,", json);
    }

    /**
     * @notice Updates the metadata contract address
     * @param _metadata The new metadata contract address
     * @dev Only callable by the contract owner
     */
    function setMetadata(address _metadata) public onlyOwner {
        metadata = Metadata(_metadata);
        emit MetadataSet(_metadata);
    }

    /**
     * @notice Updates the contract configuration
     * @param _config The new configuration struct
     * @dev Only callable by the contract owner
     * @dev Validates that fees don't exceed 100% and slippage is reasonable
     */
    function setConfig(Config memory _config) public onlyOwner {
        require(_config.usdcPrice > 0, "USDC price must be greater than 0");
        require(_config.creatorFee + _config.platformFee <= 10000, "Creator and platform fee must be less than 100%");
        require(_config.slippage <= 1000, "Slippage too high"); // Max 10%
        config = _config;
        emit ConfigSet(_config);
    }

    /**
     * @notice Sets the cutoff date to 30 days from now
     * @dev Only callable by the contract owner
     * @dev Used for fund recovery after cutoff period
     */
    function setCutoffDate() public onlyOwner {
        cutoffDate = block.timestamp + 30 days;
        emit CutoffDateSet(cutoffDate);
    }
    
    /**
     * @notice Constructor called once on contract deployment
     * @param _metadata The metadata contract address
     * @param _usdc The USDC token contract address
     * @dev Initializes with default configuration and sets up ownership
     */
    constructor(address _metadata, address _usdc, Config memory _config) {
        _initializeOwner(msg.sender);
        setConfig(_config);
        setMetadata(_metadata);
        usdc = _usdc;
    }

    /**
     * @notice Internal function to mint socks and calculate fee distribution
     * @param to The address to mint socks to
     * @param sockIds Array of sock IDs to mint
     * @param amounts Array of amounts for each sock
     * @param valuePerSock The USDC value per sock for fee calculations
     * @return totalCreatorFee Total creator fees distributed
     * @return platformFeeAmount Total platform fees collected
     * @dev Handles the actual minting and fee distribution logic
     * @dev Sets creator for new sock IDs and distributes fees accordingly
     */
    function _mint(address to, uint256[] memory sockIds, uint256[] memory amounts, uint256 valuePerSock) internal returns (uint256 totalCreatorFee, uint256 platformFeeAmount) {
        if (!config.isLive) revert NotLive();

        _batchMint(to, sockIds, amounts, "");

        uint256 totalAmount = 0;
        totalCreatorFee = 0;
        for (uint256 i = 0; i < sockIds.length; i++) {
            if(!metadata.validateTokenId(sockIds[i])) revert InvalidTokenId();
            if (creator[sockIds[i]] == address(0)) {
                creator[sockIds[i]] = to;
                emit SockCreated(sockIds[i], to);
            }
            uint256 creatorFeeAmount = valuePerSock * amounts[i] * config.creatorFee / 10000;
            creatorBalance[creator[sockIds[i]]] += creatorFeeAmount;
            totalCreatorFee += creatorFeeAmount;
            totalAmount += amounts[i];
            emit CreatorPaid(sockIds[i], creator[sockIds[i]], creatorFeeAmount);
        }

        platformFeeAmount = valuePerSock * totalAmount * config.platformFee / 10000;
        platformBalance += platformFeeAmount;
        emit PlatformFeePaid(platformFeeAmount);
        
        uint256 minterFeeAmount = valuePerSock * totalAmount - totalCreatorFee - platformFeeAmount;
        minterBalance[to] += minterFeeAmount;
        emit MinterPaid(to, minterFeeAmount);

        totalSupply += totalAmount;
    }

    /**
     * @notice Mints new socks by paying USDC
     * @param to The address to mint socks to
     * @param sockIds Array of sock IDs to mint
     * @param amounts Array of amounts for each sock
     * @param usdcAmount Amount of USDC to pay (in smallest units, e.g., 1000000 = 1 USDC)
     * @dev Validates sock IDs, checks slippage, transfers USDC, and distributes fees
     * @dev The minter receives the remaining balance after creator and platform fees
     */
    function mint(address to, uint256[] memory sockIds, uint256[] memory amounts, uint256 usdcAmount) public {
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        if (totalAmount == 0) revert ZeroAmount();

        uint256 requiredUsdc = config.usdcPrice * totalAmount * (10000 - config.slippage) / 10000;
        if (usdcAmount < requiredUsdc) revert InsufficientUSDC();

        // Transfer USDC from user to contract
        ERC20(usdc).transferFrom(msg.sender, address(this), usdcAmount);

        uint256 valuePerSock = usdcAmount / totalAmount;

        (uint256 totalCreatorFee, uint256 totalPlatformFee) = _mint(to, sockIds, amounts, valuePerSock);

        emit SocksPaid(to, usdcAmount, totalCreatorFee, totalPlatformFee);
    }

    /**
     * @notice Withdraws accumulated platform USDC fees
     * @dev Only callable by the contract owner
     * @dev Transfers all platform balance to the owner
     */
    function withdraw() public onlyOwner {
        uint256 platformBalanceToWithdraw = platformBalance;
        if (platformBalanceToWithdraw > 0) {
            platformBalance = 0;
            ERC20(usdc).transfer(owner(), platformBalanceToWithdraw);
        }
        emit OwnerWithdrawal(platformBalanceToWithdraw);
    }

    /**
     * @notice Emergency function to sweep all USDC after cutoff date
     * @dev Only callable by the contract owner
     * @dev Can only be called after the cutoff date has passed
     * @dev Transfers all USDC balance to the owner
     */
    function sweep() public onlyOwner {
        if (block.timestamp > cutoffDate) {
            uint256 usdcBalance = ERC20(usdc).balanceOf(address(this));
            ERC20(usdc).transfer(owner(), usdcBalance);
            emit OwnerWithdrawal(usdcBalance);
        }
    }

    /**
     * @notice Allows a user to withdraw their accumulated USDC (creator + minter balances)
     * @param user The address to withdraw for
     * @dev Resets both creator and minter balances to zero
     * @dev Uses checks-effects-interactions pattern to prevent reentrancy
     */
    function userWithdraw(address user) public {
        if (creatorBalance[user] == 0 && minterBalance[user] == 0) revert NoUSDCToWithdraw();
        uint256 amount = creatorBalance[user] + minterBalance[user];
        creatorBalance[user] = 0;
        minterBalance[user] = 0;
        // Update state before external call to prevent reentrancy
        ERC20(usdc).transfer(user, amount);
        emit UserWithdrawal(user, amount);
    }

    /**
     * @notice Batch withdraw function for multiple users
     * @param users Array of user addresses to withdraw for
     * @dev Calls userWithdraw for each user in the array
     */
    function usersWithdraw(address[] memory users) public {
        for (uint256 i = 0; i < users.length; i++) {
            userWithdraw(users[i]);
        }
    }

}
