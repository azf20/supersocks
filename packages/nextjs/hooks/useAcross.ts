import { createAcrossClient } from "@across-protocol/app-sdk";
import { useQuery } from "@tanstack/react-query";
import { arbitrum, base, mainnet, optimism, unichain } from "viem/chains";
import { useWalletClient } from "wagmi";

// Create the Across client
const client = createAcrossClient({
  integratorId: "0xdead", // 2-byte hex string
  chains: [mainnet, optimism, arbitrum, base, unichain],
});

type Route = {
  originChainId: number;
  destinationChainId: number;
  inputToken: string;
  outputToken: string;
};

type QuoteParams = {
  route: Route;
  inputAmount: bigint;
};

type ProgressCallback = (progress: any) => void;

export function useAcross() {
  const wallet = useWalletClient();

  // Get quote for a specific route
  const getQuote = async ({ route, inputAmount }: QuoteParams) => {
    try {
      const quote = await client.getQuote({
        route,
        inputAmount,
      });
      return quote;
    } catch (error) {
      console.error("Error getting quote:", error);
      throw error;
    }
  };

  // Execute a quote
  const executeQuote = async (quote: any, onProgress?: ProgressCallback) => {
    if (!wallet.data) {
      throw new Error("Wallet not connected");
    }

    try {
      await client.executeQuote({
        walletClient: wallet.data,
        deposit: quote.deposit,
        onProgress: progress => {
          console.log("Bridge progress:", progress);
          if (onProgress) {
            onProgress(progress);
          }
        },
      });
    } catch (error) {
      console.error("Error executing quote:", error);
      throw error;
    }
  };

  // Hook to get quote with TanStack Query
  const useQuote = (route: Route | null, inputAmount: bigint | null) => {
    return useQuery({
      queryKey: ["across-quote", route, inputAmount?.toString()],
      queryFn: () => {
        if (!route || !inputAmount) {
          throw new Error("Route and input amount are required");
        }
        return getQuote({ route, inputAmount });
      },
      enabled: !!route && !!inputAmount,
      staleTime: 30000, // 30 seconds
    });
  };

  return {
    client,
    getQuote,
    executeQuote,
    useQuote,
    wallet,
  };
}
