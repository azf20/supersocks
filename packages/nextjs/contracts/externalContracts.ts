import { erc20Abi } from "viem";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";


/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
  31337: {
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      abi: erc20Abi,
    },
    UNIVERSAL_ROUTER: {
      address: "0x851116D9223fabED8E56C0E6b8Ad0c31d98B3507",
      abi: [
        {
          inputs: [
            { internalType: "bytes", name: "commands", type: "bytes" },
            { internalType: "bytes[]", name: "inputs", type: "bytes[]" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
    },
    QUOTER: {
      address: "0x1f3131a13296fb91c90870043742c3cdbff1a8d7",
      abi: [
        {
          inputs: [{ internalType: "contract IPoolManager", name: "_poolManager", type: "address" }],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [{ internalType: "PoolId", name: "poolId", type: "bytes32" }],
          name: "NotEnoughLiquidity",
          type: "error",
        },
        { inputs: [], name: "NotPoolManager", type: "error" },
        { inputs: [], name: "NotSelf", type: "error" },
        { inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }], name: "QuoteSwap", type: "error" },
        { inputs: [], name: "UnexpectedCallSuccess", type: "error" },
        {
          inputs: [{ internalType: "bytes", name: "revertData", type: "bytes" }],
          name: "UnexpectedRevertBytes",
          type: "error",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "Currency", name: "exactCurrency", type: "address" },
                {
                  components: [
                    { internalType: "Currency", name: "intermediateCurrency", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                    { internalType: "bytes", name: "hookData", type: "bytes" },
                  ],
                  internalType: "struct PathKey[]",
                  name: "path",
                  type: "tuple[]",
                },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
              ],
              internalType: "struct IV4Quoter.QuoteExactParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "_quoteExactInput",
          outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  components: [
                    { internalType: "Currency", name: "currency0", type: "address" },
                    { internalType: "Currency", name: "currency1", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                  ],
                  internalType: "struct PoolKey",
                  name: "poolKey",
                  type: "tuple",
                },
                { internalType: "bool", name: "zeroForOne", type: "bool" },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
                { internalType: "bytes", name: "hookData", type: "bytes" },
              ],
              internalType: "struct IV4Quoter.QuoteExactSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "_quoteExactInputSingle",
          outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "Currency", name: "exactCurrency", type: "address" },
                {
                  components: [
                    { internalType: "Currency", name: "intermediateCurrency", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                    { internalType: "bytes", name: "hookData", type: "bytes" },
                  ],
                  internalType: "struct PathKey[]",
                  name: "path",
                  type: "tuple[]",
                },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
              ],
              internalType: "struct IV4Quoter.QuoteExactParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "_quoteExactOutput",
          outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  components: [
                    { internalType: "Currency", name: "currency0", type: "address" },
                    { internalType: "Currency", name: "currency1", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                  ],
                  internalType: "struct PoolKey",
                  name: "poolKey",
                  type: "tuple",
                },
                { internalType: "bool", name: "zeroForOne", type: "bool" },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
                { internalType: "bytes", name: "hookData", type: "bytes" },
              ],
              internalType: "struct IV4Quoter.QuoteExactSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "_quoteExactOutputSingle",
          outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "poolManager",
          outputs: [{ internalType: "contract IPoolManager", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "Currency", name: "exactCurrency", type: "address" },
                {
                  components: [
                    { internalType: "Currency", name: "intermediateCurrency", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                    { internalType: "bytes", name: "hookData", type: "bytes" },
                  ],
                  internalType: "struct PathKey[]",
                  name: "path",
                  type: "tuple[]",
                },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
              ],
              internalType: "struct IV4Quoter.QuoteExactParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "quoteExactInput",
          outputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint256", name: "gasEstimate", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  components: [
                    { internalType: "Currency", name: "currency0", type: "address" },
                    { internalType: "Currency", name: "currency1", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                  ],
                  internalType: "struct PoolKey",
                  name: "poolKey",
                  type: "tuple",
                },
                { internalType: "bool", name: "zeroForOne", type: "bool" },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
                { internalType: "bytes", name: "hookData", type: "bytes" },
              ],
              internalType: "struct IV4Quoter.QuoteExactSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "quoteExactInputSingle",
          outputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint256", name: "gasEstimate", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "Currency", name: "exactCurrency", type: "address" },
                {
                  components: [
                    { internalType: "Currency", name: "intermediateCurrency", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                    { internalType: "bytes", name: "hookData", type: "bytes" },
                  ],
                  internalType: "struct PathKey[]",
                  name: "path",
                  type: "tuple[]",
                },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
              ],
              internalType: "struct IV4Quoter.QuoteExactParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "quoteExactOutput",
          outputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "gasEstimate", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                {
                  components: [
                    { internalType: "Currency", name: "currency0", type: "address" },
                    { internalType: "Currency", name: "currency1", type: "address" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "int24", name: "tickSpacing", type: "int24" },
                    { internalType: "contract IHooks", name: "hooks", type: "address" },
                  ],
                  internalType: "struct PoolKey",
                  name: "poolKey",
                  type: "tuple",
                },
                { internalType: "bool", name: "zeroForOne", type: "bool" },
                { internalType: "uint128", name: "exactAmount", type: "uint128" },
                { internalType: "bytes", name: "hookData", type: "bytes" },
              ],
              internalType: "struct IV4Quoter.QuoteExactSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "quoteExactOutputSingle",
          outputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "gasEstimate", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
          name: "unlockCallback",
          outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
  },
  11155111: {
    USDC: {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      abi: erc20Abi,
    },
  },
  10: {
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      abi: erc20Abi,
    },
    V3_SWAP_ROUTER: {
      address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      abi: [
        {
          inputs: [
            { internalType: "address", name: "_factoryV2", type: "address" },
            { internalType: "address", name: "factoryV3", type: "address" },
            { internalType: "address", name: "_positionManager", type: "address" },
            { internalType: "address", name: "_WETH9", type: "address" },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "WETH9",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          name: "approveMax",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          name: "approveMaxMinusOne",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          name: "approveZeroThenMax",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "token", type: "address" }],
          name: "approveZeroThenMaxMinusOne",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
          name: "callPositionManager",
          outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "bytes[]", name: "paths", type: "bytes[]" },
            { internalType: "uint128[]", name: "amounts", type: "uint128[]" },
            { internalType: "uint24", name: "maximumTickDivergence", type: "uint24" },
            { internalType: "uint32", name: "secondsAgo", type: "uint32" },
          ],
          name: "checkOracleSlippage",
          outputs: [],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "bytes", name: "path", type: "bytes" },
            { internalType: "uint24", name: "maximumTickDivergence", type: "uint24" },
            { internalType: "uint32", name: "secondsAgo", type: "uint32" },
          ],
          name: "checkOracleSlippage",
          outputs: [],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "bytes", name: "path", type: "bytes" },
                { internalType: "address", name: "recipient", type: "address" },
                { internalType: "uint256", name: "amountIn", type: "uint256" },
                { internalType: "uint256", name: "amountOutMinimum", type: "uint256" },
              ],
              internalType: "struct IV3SwapRouter.ExactInputParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "exactInput",
          outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "address", name: "tokenIn", type: "address" },
                { internalType: "address", name: "tokenOut", type: "address" },
                { internalType: "uint24", name: "fee", type: "uint24" },
                { internalType: "address", name: "recipient", type: "address" },
                { internalType: "uint256", name: "amountIn", type: "uint256" },
                { internalType: "uint256", name: "amountOutMinimum", type: "uint256" },
                { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
              ],
              internalType: "struct IV3SwapRouter.ExactInputSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "exactInputSingle",
          outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "bytes", name: "path", type: "bytes" },
                { internalType: "address", name: "recipient", type: "address" },
                { internalType: "uint256", name: "amountOut", type: "uint256" },
                { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
              ],
              internalType: "struct IV3SwapRouter.ExactOutputParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "exactOutput",
          outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "address", name: "tokenIn", type: "address" },
                { internalType: "address", name: "tokenOut", type: "address" },
                { internalType: "uint24", name: "fee", type: "uint24" },
                { internalType: "address", name: "recipient", type: "address" },
                { internalType: "uint256", name: "amountOut", type: "uint256" },
                { internalType: "uint256", name: "amountInMaximum", type: "uint256" },
                { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
              ],
              internalType: "struct IV3SwapRouter.ExactOutputSingleParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "exactOutputSingle",
          outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "factory",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "factoryV2",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "getApprovalType",
          outputs: [{ internalType: "enum IApproveAndCall.ApprovalType", name: "", type: "uint8" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "address", name: "token0", type: "address" },
                { internalType: "address", name: "token1", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
                { internalType: "uint256", name: "amount0Min", type: "uint256" },
                { internalType: "uint256", name: "amount1Min", type: "uint256" },
              ],
              internalType: "struct IApproveAndCall.IncreaseLiquidityParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "increaseLiquidity",
          outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              components: [
                { internalType: "address", name: "token0", type: "address" },
                { internalType: "address", name: "token1", type: "address" },
                { internalType: "uint24", name: "fee", type: "uint24" },
                { internalType: "int24", name: "tickLower", type: "int24" },
                { internalType: "int24", name: "tickUpper", type: "int24" },
                { internalType: "uint256", name: "amount0Min", type: "uint256" },
                { internalType: "uint256", name: "amount1Min", type: "uint256" },
                { internalType: "address", name: "recipient", type: "address" },
              ],
              internalType: "struct IApproveAndCall.MintParams",
              name: "params",
              type: "tuple",
            },
          ],
          name: "mint",
          outputs: [{ internalType: "bytes", name: "result", type: "bytes" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "bytes32", name: "previousBlockhash", type: "bytes32" },
            { internalType: "bytes[]", name: "data", type: "bytes[]" },
          ],
          name: "multicall",
          outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "bytes[]", name: "data", type: "bytes[]" },
          ],
          name: "multicall",
          outputs: [{ internalType: "bytes[]", name: "", type: "bytes[]" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
          name: "multicall",
          outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          name: "positionManager",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
          ],
          name: "pull",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        { inputs: [], name: "refundETH", outputs: [], stateMutability: "payable", type: "function" },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
          ],
          name: "selfPermit",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "nonce", type: "uint256" },
            { internalType: "uint256", name: "expiry", type: "uint256" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
          ],
          name: "selfPermitAllowed",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "nonce", type: "uint256" },
            { internalType: "uint256", name: "expiry", type: "uint256" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
          ],
          name: "selfPermitAllowedIfNecessary",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint8", name: "v", type: "uint8" },
            { internalType: "bytes32", name: "r", type: "bytes32" },
            { internalType: "bytes32", name: "s", type: "bytes32" },
          ],
          name: "selfPermitIfNecessary",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint256", name: "amountOutMin", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
          ],
          name: "swapExactTokensForTokens",
          outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint256", name: "amountInMax", type: "uint256" },
            { internalType: "address[]", name: "path", type: "address[]" },
            { internalType: "address", name: "to", type: "address" },
          ],
          name: "swapTokensForExactTokens",
          outputs: [{ internalType: "uint256", name: "amountIn", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
            { internalType: "address", name: "recipient", type: "address" },
          ],
          name: "sweepToken",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
          ],
          name: "sweepToken",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
            { internalType: "uint256", name: "feeBips", type: "uint256" },
            { internalType: "address", name: "feeRecipient", type: "address" },
          ],
          name: "sweepTokenWithFee",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "feeBips", type: "uint256" },
            { internalType: "address", name: "feeRecipient", type: "address" },
          ],
          name: "sweepTokenWithFee",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "int256", name: "amount0Delta", type: "int256" },
            { internalType: "int256", name: "amount1Delta", type: "int256" },
            { internalType: "bytes", name: "_data", type: "bytes" },
          ],
          name: "uniswapV3SwapCallback",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
            { internalType: "address", name: "recipient", type: "address" },
          ],
          name: "unwrapWETH9",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "amountMinimum", type: "uint256" }],
          name: "unwrapWETH9",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "feeBips", type: "uint256" },
            { internalType: "address", name: "feeRecipient", type: "address" },
          ],
          name: "unwrapWETH9WithFee",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "amountMinimum", type: "uint256" },
            { internalType: "uint256", name: "feeBips", type: "uint256" },
            { internalType: "address", name: "feeRecipient", type: "address" },
          ],
          name: "unwrapWETH9WithFee",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
          name: "wrapETH",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        { stateMutability: "payable", type: "receive" },
      ],
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;