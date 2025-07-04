// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Test, console2} from "forge-std/Test.sol";
import {SuperSocks} from "../contracts/SuperSocks.sol";
import {Metadata} from "../contracts/Metadata.sol";
import {FreeRc20} from "../contracts/Freerc20.sol";
import {PatternLib} from "../contracts/PatternLib.sol";

contract SuperSocksTest is Test {
    SuperSocks public superSocks;
    Metadata public metadata;
    FreeRc20 public usdc;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);
    
    uint256[] public sockIds = [513, 2569, 4625]; // these are sock IDs which pass the verification
    uint256[] public amounts = [1, 2, 1]; // these are the amounts of each sock to mint
    
    event SockCreated(uint256 indexed sockId, address indexed creator);
    event CreatorPaid(uint256 indexed sockId, address indexed creator, uint256 amount);
    event PlatformFeePaid(uint256 amount);
    event MinterPaid(address indexed minter, uint256 amount);
    event SocksPaid(address indexed sockRecipient, uint256 total, uint256 creatorFee, uint256 platformFee);
    event UserWithdrawal(address indexed minter, uint256 amount);
    event OwnerWithdrawal(uint256 amount);

    function setUp() public {
        // Deploy contracts
        vm.startPrank(owner);
        metadata = new Metadata();
        usdc = new FreeRc20();
        superSocks = new SuperSocks(address(metadata), address(usdc), SuperSocks.Config({
            usdcPrice: 1000000,
            slippage: 100,
            creatorFee: 1000,
            platformFee: 1000,
            isLive: true
        }));
        
        // Initialize metadata with patterns (similar to InitializeMetadata.s.sol)
        _initializeMetadata();
        
        vm.stopPrank();
        
        // Give users some USDC
        usdc.mint(user1, 1000000); // 1 USDC
        usdc.mint(user2, 5000000); // 2 USDC
        usdc.mint(user3, 5000000); // 5 USDC
    }
    
    function _initializeMetadata() internal {
        // Main patterns (index 0) - keeping original order
        string[] memory mainPatterns = new string[](3);
        mainPatterns[0] = PatternLib.designSmile;
        mainPatterns[1] = PatternLib.designHeart;
        mainPatterns[2] = PatternLib.designFrown;
        metadata.addStyles(0, mainPatterns);
        
        // Heel patterns (index 1) - keeping original order
        string[] memory heelPatterns = new string[](2);
        heelPatterns[0] = PatternLib.heel;
        heelPatterns[1] = PatternLib.heelBig;
        metadata.addStyles(1, heelPatterns);
        
        // Toe patterns (index 2) - keeping original order
        string[] memory toePatterns = new string[](2);
        toePatterns[0] = PatternLib.toe;
        toePatterns[1] = PatternLib.toeBig;
        metadata.addStyles(2, toePatterns);
        
        // Top patterns (index 3) - keeping original order
        string[] memory topPatterns = new string[](7);
        topPatterns[0] = PatternLib.topOne;
        topPatterns[1] = PatternLib.topTwo;
        topPatterns[2] = PatternLib.topStripeNoOffset;
        topPatterns[3] = PatternLib.topStripeThin;
        topPatterns[4] = PatternLib.topBig;
        topPatterns[5] = PatternLib.topVerticalStripes;
        topPatterns[6] = PatternLib.topVerticalWithHorizontal;
        metadata.addStyles(3, topPatterns);
    }

    /// @dev Helper function to create single sock arrays
    function _createSingleSockArrays(uint256 sockId) internal pure returns (uint256[] memory singleSockIds, uint256[] memory singleAmounts) {
        singleSockIds = new uint256[](1);
        singleAmounts = new uint256[](1);
        singleSockIds[0] = sockId;
        singleAmounts[0] = 1;
    }

    /// @dev Helper function to mint a single sock
    function _mintSingleSock(address user, uint256 sockId, uint256 usdcAmount) internal {
        vm.startPrank(user);
        usdc.approve(address(superSocks), usdcAmount);
        (uint256[] memory singleSockIds, uint256[] memory singleAmounts) = _createSingleSockArrays(sockId);
        superSocks.mint(user, singleSockIds, singleAmounts, usdcAmount);
        vm.stopPrank();
    }

    /// @dev Helper function to create test config
    /// @param usdcPrice Price per sock in USDC smallest units
    /// @param slippage Slippage tolerance in basis points (100 = 1%)
    /// @param creatorFee Creator fee in basis points (1000 = 10%)
    /// @param platformFee Platform fee in basis points (1000 = 10%)
    /// @param isLive Whether minting is live
    function _createTestConfig(uint256 usdcPrice, uint256 slippage, uint256 creatorFee, uint256 platformFee, bool isLive) internal pure returns (SuperSocks.Config memory) {
        return SuperSocks.Config({
            usdcPrice: usdcPrice,
            slippage: slippage,
            creatorFee: creatorFee,
            platformFee: platformFee,
            isLive: isLive
        });
    }

    function test_Constructor() public view {
        assertEq(superSocks.owner(), owner);
        assertEq(address(superSocks.usdc()), address(usdc));
        assertEq(address(superSocks.metadata()), address(metadata));
        
        (uint256 usdcPrice, uint256 slippage, uint256 creatorFee, uint256 platformFee, bool isLive) = superSocks.config();
        assertEq(usdcPrice, 1000000);
        assertEq(slippage, 100);        // 1% = 100 basis points
        assertEq(creatorFee, 1000);     // 10% = 1000 basis points
        assertEq(platformFee, 1000);    // 10% = 1000 basis points
        assertEq(isLive, true);
    }

    function test_MintSingleSock() public {
        (uint256[] memory singleSockIds, uint256[] memory singleAmounts) = _createSingleSockArrays(sockIds[0]);
        
        vm.startPrank(user1);
        usdc.approve(address(superSocks), 1000000);
        
        vm.expectEmit(true, true, false, true);
        emit SockCreated(singleSockIds[0], user1);
        
        vm.expectEmit(true, true, true, true);
        emit CreatorPaid(singleSockIds[0], user1, 100000); // 10% of 1 USDC
        
        vm.expectEmit(true, false, false, true);
        emit PlatformFeePaid(100000); // 10% of 1 USDC
        
        vm.expectEmit(true, true, false, true);
        emit MinterPaid(user1, 800000); // 80% remaining
        
        vm.expectEmit(true, true, true, true);
        emit SocksPaid(user1, 1000000, 100000, 100000);
        
        superSocks.mint(user1, singleSockIds, singleAmounts, 1000000);
        vm.stopPrank();
        
        // Check balances
        assertEq(superSocks.creatorBalance(user1), 100000);
        assertEq(superSocks.minterBalance(user1), 800000);
        assertEq(superSocks.platformBalance(), 100000);
        assertEq(superSocks.creator(sockIds[0]), user1);
        assertEq(superSocks.balanceOf(user1, sockIds[0]), 1);
    }

    function test_MintMultipleSocks() public {
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        (uint256 usdcPrice, , , , ) = superSocks.config();
        uint256 requiredUsdc = usdcPrice * totalAmount;
        
        vm.startPrank(user2);
        usdc.approve(address(superSocks), requiredUsdc);
        
        vm.expectEmit(true, true, false, true);
        emit SockCreated(sockIds[0], user2);
        vm.expectEmit(true, true, false, true);
        emit SockCreated(sockIds[1], user2);
        
        superSocks.mint(user2, sockIds, amounts, requiredUsdc);
        vm.stopPrank();
        
        // Check balances
        assertEq(superSocks.creatorBalance(user2), 400000); // 10% of 2 USDC
        assertEq(superSocks.minterBalance(user2), 3200000); // 80% of 2 USDC
        assertEq(superSocks.platformBalance(), 400000); // 10% of 2 USDC
        
        // Check token balances
        assertEq(superSocks.balanceOf(user2, sockIds[0]), 1);
        assertEq(superSocks.balanceOf(user2, sockIds[1]), 2);
        assertEq(superSocks.balanceOf(user2, sockIds[2]), 1);
    }

    function test_MintExistingSock() public {
        // First mint by user1
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        // Second mint of same sock by user2
        _mintSingleSock(user2, sockIds[0], 1000000);
        
        // Creator should still be user1, but user2 gets creator fee for their mint
        assertEq(superSocks.creator(sockIds[0]), user1);
        assertEq(superSocks.creatorBalance(user1), 200000); // From creator fee
        assertEq(superSocks.creatorBalance(user2), 0); // No creator fee for user2
        assertEq(superSocks.minterBalance(user2), 800000); // Minter fee left over
    }

    function test_InsufficientUSDC() public {
        vm.startPrank(user1);
        usdc.approve(address(superSocks), 500000); // Less than required
        
        (uint256[] memory singleSockIds, uint256[] memory singleAmounts) = _createSingleSockArrays(sockIds[0]);
        
        vm.expectRevert(SuperSocks.InsufficientUSDC.selector);
        superSocks.mint(user1, singleSockIds, singleAmounts, 500000);
        vm.stopPrank();
    }

    function test_NotLive() public {
        vm.startPrank(owner);
        SuperSocks.Config memory newConfig = _createTestConfig(1000000, 100, 1000, 1000, false);
        superSocks.setConfig(newConfig);
        vm.stopPrank();
        
        vm.startPrank(user1);
        usdc.approve(address(superSocks), 1000000);
        
        uint256[] memory singleSockId = new uint256[](1);
        uint256[] memory singleAmount = new uint256[](1);
        singleSockId[0] = sockIds[0];
        singleAmount[0] = 1;
        
        vm.expectRevert(SuperSocks.NotLive.selector);
        superSocks.mint(user1, singleSockId, singleAmount, 1000000);
        vm.stopPrank();
    }

    function test_UserWithdraw() public {
        // First mint to create balances
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        uint256 balanceBefore = usdc.balanceOf(user1);
        
        vm.expectEmit(true, false, false, true);
        emit UserWithdrawal(user1, 900000); // creator + minter balance
        
        superSocks.userWithdraw(user1);
        
        uint256 balanceAfter = usdc.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, 900000);
        assertEq(superSocks.creatorBalance(user1), 0);
        assertEq(superSocks.minterBalance(user1), 0);
    }

    function test_UserWithdrawNoBalance() public {
        vm.expectRevert(SuperSocks.NoUSDCToWithdraw.selector);
        superSocks.userWithdraw(user1);
    }

    function test_UserBalance() public {
        // First mint to create balances
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        assertEq(superSocks.userBalance(user1), 900000); // creator + minter balance
        assertEq(superSocks.userBalance(user2), 0); // no balance
    }

    function test_OwnerWithdraw() public {
        // First mint to create platform balance
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        uint256 balanceBefore = usdc.balanceOf(owner);
        
        vm.startPrank(owner);
        vm.expectEmit(true, true, false, true);
        emit OwnerWithdrawal(100000); // platform balance
        
        superSocks.withdraw();
        vm.stopPrank();
        
        uint256 balanceAfter = usdc.balanceOf(owner);
        assertEq(balanceAfter - balanceBefore, 100000);
    }

    function test_Sweep() public {
        // Set cutoff date
        vm.startPrank(owner);
        superSocks.setCutoffDate();
        vm.stopPrank();
        
        // First mint to create balances
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        // Try to sweep before cutoff
        vm.startPrank(owner);
        superSocks.sweep(); // Should not withdraw anything
        vm.stopPrank();
        
        // Fast forward past cutoff
        vm.warp(block.timestamp + 31 days);
        
        uint256 balanceBefore = usdc.balanceOf(owner);
        
        vm.startPrank(owner);
        vm.expectEmit(true, true, false, true);
        emit OwnerWithdrawal(1000000); // total balance
        
        superSocks.sweep();
        vm.stopPrank();
        
        uint256 balanceAfter = usdc.balanceOf(owner);
        assertEq(balanceAfter - balanceBefore, 1000000);
    }

    function test_SetConfig() public {
        vm.startPrank(owner);
        SuperSocks.Config memory newConfig = _createTestConfig(2000000, 500, 1500, 500, true);
        superSocks.setConfig(newConfig);
        vm.stopPrank();
        
        (uint256 usdcPrice, uint256 slippage, uint256 creatorFee, uint256 platformFee, bool isLive) = superSocks.config();
        assertEq(usdcPrice, 2000000);
        assertEq(slippage, 500);     // 5% = 500 basis points
        assertEq(creatorFee, 1500);  // 15% = 1500 basis points
        assertEq(platformFee, 500);  // 5% = 500 basis points
        assertEq(isLive, true);
    }

    function test_SetMetadata() public {
        Metadata newMetadata = new Metadata();
        
        vm.startPrank(owner);
        superSocks.setMetadata(address(newMetadata));
        vm.stopPrank();
        
        assertEq(address(superSocks.metadata()), address(newMetadata));
    }

    function test_TokenURI() public {
        // First mint to create a token
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        string memory uri = superSocks.uri(sockIds[0]);
        assertTrue(bytes(uri).length > 0);
    }

    function test_OnlyOwnerFunctions() public {
        vm.startPrank(user1);
        
        // Try to set config
        SuperSocks.Config memory newConfig = _createTestConfig(2000000, 500, 1500, 500, true);
        vm.expectRevert();
        superSocks.setConfig(newConfig);
        
        // Try to set metadata
        vm.expectRevert();
        superSocks.setMetadata(address(0));
        
        // Try to withdraw
        vm.expectRevert();
        superSocks.withdraw();
        
        // Try to sweep
        vm.expectRevert();
        superSocks.sweep();
        
        // Try to set cutoff date
        vm.expectRevert();
        superSocks.setCutoffDate();
        
        vm.stopPrank();
    }

    function test_FeeCalculationAccuracy() public {
        uint256 initialAmount = 1000000;
        _mintSingleSock(user1, sockIds[0], initialAmount);
        
        // Verify fee calculations are accurate
        // Total: 1,000,000 (1 USDC)
        // Creator fee: 10% = 100,000
        // Platform fee: 10% = 100,000  
        // Minter gets: 80% = 800,000
        assertEq(superSocks.creatorBalance(user1), 100000);
        assertEq(superSocks.platformBalance(), 100000);
        assertEq(superSocks.minterBalance(user1), 800000);
        
        // Total should equal original amount
        assertEq(superSocks.creatorBalance(user1) + superSocks.platformBalance() + superSocks.minterBalance(user1), initialAmount);
    }

    function test_MultipleUsersWithdraw() public {
        // User1 mints
        _mintSingleSock(user1, sockIds[0], 1000000);
        
        // User2 mints
        _mintSingleSock(user2, sockIds[0], 1000000);
        
        // Both users withdraw
        superSocks.userWithdraw(user1);
        superSocks.userWithdraw(user2);
        
        // Check balances are zero
        assertEq(superSocks.creatorBalance(user1), 0);
        assertEq(superSocks.minterBalance(user1), 0);
        assertEq(superSocks.creatorBalance(user2), 0);
        assertEq(superSocks.minterBalance(user2), 0);
    }

    function test_ConfigValidation() public {
        vm.startPrank(owner);
        
        // Test creator fee too high
        SuperSocks.Config memory highCreatorFee = _createTestConfig(1000000, 100, 10000, 1000, true);
        vm.expectRevert("Creator and platform fee must be less than 100%");
        superSocks.setConfig(highCreatorFee);
        
        // Test platform fee too high
        SuperSocks.Config memory highPlatformFee = _createTestConfig(1000000, 100, 1000, 10000, true);
        vm.expectRevert("Creator and platform fee must be less than 100%");
        superSocks.setConfig(highPlatformFee);
        
        // Test slippage too high
        SuperSocks.Config memory highSlippage = _createTestConfig(1000000, 6000, 1000, 1000, true);
        vm.expectRevert("Slippage too high");
        superSocks.setConfig(highSlippage);
        
        // Test valid config
        SuperSocks.Config memory validConfig = _createTestConfig(1000000, 100, 1000, 1000, true);
        superSocks.setConfig(validConfig); // Should not revert
        
        vm.stopPrank();
    }
} 