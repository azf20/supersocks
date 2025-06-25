// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { UniversalRouter } from "@uniswap/universal-router/contracts/UniversalRouter.sol";
import { Commands } from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { IV4Router } from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import { Actions } from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import { StateLibrary } from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import { IPermit2 } from "@uniswap/permit2/src/interfaces/IPermit2.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Currency } from "@uniswap/v4-core/src/types/Currency.sol";
import { PoolKey } from "@uniswap/v4-core/src/types/PoolKey.sol";
import { IHooks } from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import { SuperSocks } from "./SuperSocks.sol";

contract Swapper {
    using StateLibrary for IPoolManager;

    UniversalRouter public immutable router;
    IPoolManager public immutable poolManager;
    IPermit2 public immutable permit2;
    PoolKey public poolKey;

    SuperSocks public immutable superSocks;

    constructor(address currency1, address payable _superSocks) {
        router = UniversalRouter(payable(0x851116D9223fabED8E56C0E6b8Ad0c31d98B3507));
        poolManager = IPoolManager(0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3);
        permit2 = IPermit2(0x000000000022D473030F116dDEE9F6B43aC78BA3);
        poolKey = PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(currency1),
            fee: 500,
            tickSpacing: 10,
            hooks: IHooks(address(0))
        });
        superSocks = SuperSocks(payable(_superSocks));
    }

    function swapETHForUSDC(
        uint128 amountIn,
        uint128 requiredAmountOut,
        address refundAddress
    ) internal returns (uint256 amountOut) {
        uint256 usdcBalanceBefore = IERC20(Currency.unwrap(poolKey.currency1)).balanceOf(address(this));
        // Encode the Universal Router command
        bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP), uint8(Commands.SWEEP));
        bytes[] memory inputs = new bytes[](2);

        // Encode V4Router actions
        bytes memory actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_OUT_SINGLE),
            uint8(Actions.SETTLE_ALL),
            uint8(Actions.TAKE_ALL)
        );

        // Prepare parameters for each action
        bytes[] memory params = new bytes[](3);
        params[0] = abi.encode(
            IV4Router.ExactOutputSingleParams({
                poolKey: poolKey,
                zeroForOne: true,
                amountInMaximum: amountIn,
                amountOut: requiredAmountOut,
                hookData: bytes("")
            })
        );
        params[1] = abi.encode(poolKey.currency0, amountIn);
        params[2] = abi.encode(poolKey.currency1, requiredAmountOut);

        // Combine actions and params into inputs
        inputs[0] = abi.encode(actions, params);
        inputs[1] = abi.encode(poolKey.currency0, refundAddress);

        // Execute the swap
        uint256 deadline = block.timestamp + 20;

        router.execute{value: amountIn}(commands, inputs, deadline);

        // Verify and return the output amount
        amountOut = IERC20(Currency.unwrap(poolKey.currency1)).balanceOf(address(this)) - usdcBalanceBefore;
        require(amountOut >= requiredAmountOut, "Insufficient output amount");
    }

    /// @dev Mints a new token by paying in ETH (swaps ETH to USDC)
    function mintSocksWithETH(address to, uint256[] memory sockIds, uint256[] memory amounts, uint256 minUsdcAmount, address refundAddress) public payable {
        // Swap ETH for USDC
        uint256 usdcReceived = swapETHForUSDC(uint128(msg.value), uint128(minUsdcAmount), refundAddress);

        IERC20(Currency.unwrap(poolKey.currency1)).approve(address(superSocks), usdcReceived);
        superSocks.mint(to, sockIds, amounts, usdcReceived);

    }
}