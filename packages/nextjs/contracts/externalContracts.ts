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
} as const;

export default externalContracts satisfies GenericContractsDeclaration;