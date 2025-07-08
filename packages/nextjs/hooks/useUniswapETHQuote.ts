import externalContracts from "../contracts/externalContracts";
import { ChainId, Token } from "@uniswap/sdk-core";
import { useSimulateContract } from "wagmi";
import { chainId, usdcAddress } from "~~/utils/supersocks";

export const ETH_TOKEN = new Token(ChainId.OPTIMISM, "0x0000000000000000000000000000000000000000", 18, "ETH", "Ether");
export const USDC_TOKEN = new Token(ChainId.OPTIMISM, usdcAddress, 6, "USDC", "USDC");

/**
 * Custom hook to get ETH quote for USDC amount using Uniswap V4 Quoter
 * @param usdcAmount The USDC amount to get ETH quote for (in smallest units)
 * @param slippage Slippage tolerance as basis points (default: 50 = 0.5%)
 * @returns Object containing ethPrice, isLoading, and error
 */
export function useUniswapETHQuote(usdcAmount: bigint, slippage: bigint = 50n) {
  // Get ETH quote for the total USDC amount
  const QuoteConfig = {
    poolKey: {
      currency0: ETH_TOKEN.address,
      currency1: USDC_TOKEN.address,
      fee: 500,
      tickSpacing: 10,
      hooks: "0x0000000000000000000000000000000000000000",
    },
    zeroForOne: true,
    exactAmount: usdcAmount,
    hookData: "0x00",
  };

  const {
    data: quoteResult,
    isLoading,
    error,
  } = useSimulateContract({
    address: externalContracts[31337].QUOTER.address,
    abi: externalContracts[31337].QUOTER.abi,
    functionName: "quoteExactOutputSingle",
    args: [QuoteConfig],
    query: {
      enabled: usdcAmount > 0n,
    },
    chainId: chainId,
  });

  const quote = quoteResult?.result[0];
  const ethPrice = quote ? (quote * (slippage + 100n)) / 100n : 0n;

  return {
    ethPrice,
    isLoading,
    error,
    quote: quote || 0n,
  };
}
