//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "solady/auth/Ownable.sol";
import "solady/tokens/ERC721.sol";
import "solady/utils/Base64.sol";
import "solady/utils/LibString.sol";
import "solady/tokens/ERC20.sol";
import "./Metadata.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract SuperSocks is Ownable, ERC721 {
    // Custom errors
    error InsufficientETH();
    error InsufficientUSDC();
    error NoTokensToWithdraw();
    error FailedToSendEther();
    error MaxSupplyReached();

    uint256 public ethPrice;
    uint256 public usdcPrice; // Price in USDC (6 decimals)
    address public immutable usdc;
    Metadata public metadata;
    uint16 public counter;

    uint16 public constant MAX_SUPPLY = 7702;
    uint16 public supply;

    // Bit positions for tokenId encoding
    uint256 private constant MINTER_BITS = 160;
    uint256 private constant TOKEN_NUMBER_BITS = 16;
    uint256 private constant CHAIN_ID_BITS = 16;
    uint256 private constant ADDRESS_TYPE_BITS = 16;
    uint256 private constant RESERVED_BITS = 16;
    uint256 private constant FUTURE_BITS = 32;

    // Bit masks
    uint256 private constant MINTER_MASK = type(uint256).max >> (256 - MINTER_BITS);
    uint256 private constant TOKEN_NUMBER_MASK = type(uint256).max >> (256 - TOKEN_NUMBER_BITS);
    uint256 private constant CHAIN_ID_MASK = type(uint256).max >> (256 - CHAIN_ID_BITS);
    uint256 private constant ADDRESS_TYPE_MASK = type(uint256).max >> (256 - ADDRESS_TYPE_BITS);

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _metadata, address _usdc) ERC721() {
        ethPrice = 0.0007702 ether;
        usdcPrice = 5_000_000; // 5 USDC (6 decimals)
        usdc = _usdc;
        metadata = Metadata(_metadata);
    }

    /// @dev Returns the token collection name.
    function name() public pure override returns (string memory) {
        return "SuperSocks";
    }

    /// @dev Returns the token collection symbol.
    function symbol() public pure override returns (string memory) {
        return "SOCKS";
    }

    /// @dev Updates the renderer contract
    function setMetadata(Metadata _metadata) external onlyOwner {
        metadata = _metadata;
    }

    /// @dev Returns the Uniform Resource Identifier (URI) for token `id`.
    function tokenURI(uint256 id) public view override returns (string memory) {
        return metadata.tokenURI(id);
    }

    /// @dev Sets the ETH price for minting
    function setEthPrice(uint256 _price) external onlyOwner {
        ethPrice = _price;
    }

    /// @dev Sets the USDC price for minting
    function setUsdcPrice(uint256 _price) external onlyOwner {
        usdcPrice = _price;
    }

    function getTokenId(uint256 sockId) public view returns (uint256) {
        return uint256(supply) | (sockId);
    }

    /// @dev Mints a new token by paying in ETH
    function mintWithEth(address to, uint256 sockId) public payable {
        if (msg.value < ethPrice) revert InsufficientETH();
        if (supply >= MAX_SUPPLY) revert MaxSupplyReached();

        supply++;
        uint256 tokenId = getTokenId(sockId);

        metadata.validateTokenId(tokenId);
        
        _mint(to, tokenId);
    }

    /// @dev Mints a new token by paying in USDC
    function mintWithUSDC(address to, uint256 sockId) public {
        if (supply >= MAX_SUPPLY) revert MaxSupplyReached();
        
        // Transfer USDC from user to contract
        if (!ERC20(usdc).transferFrom(msg.sender, address(this), usdcPrice)) {
            revert InsufficientUSDC();
        }
        
        uint256 tokenId = getTokenId(sockId);
        
        _mint(to, tokenId);
        supply++;
    }

    /// @dev Withdraws accumulated USDC
    function withdrawUSDC() external onlyOwner {
        uint256 balance = ERC20(usdc).balanceOf(address(this));
        if (balance == 0) revert NoTokensToWithdraw();
        ERC20(usdc).transfer(owner(), balance);
    }

    /// @dev Withdraws accumulated ETH
    function withdraw() public onlyOwner {
        (bool success,) = owner().call{ value: address(this).balance }("");
        if (!success) revert FailedToSendEther();
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable { }
}
