import { createAcrossClient } from "@across-protocol/app-sdk";
import { useQuery } from "@tanstack/react-query";
import { encodeFunctionData, erc20Abi } from "viem";
import { arbitrum, base, mainnet, optimism, unichain } from "viem/chains";
import { useWalletClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { chainId } from "~~/utils/supersocks";

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

type ProgressCallback = (progress: any) => void;

// Custom error types
export type AcrossError = {
  type: "AMOUNT_TOO_LOW";
  message: string;
  originalError?: any;
};

// Structured input for the hook
export type UseAcrossInput = {
  // Route selection (optional - for quote fetching)
  route?: Route | null;
  inputAmount?: bigint | null;

  sockIds: bigint[];
  amounts: bigint[];

  // Route discovery (optional - for fetching available routes)
  destinationChainId?: number;
  destinationToken?: string;

  // User context
  userAddress?: string;
};

export function useAcross(input: UseAcrossInput) {
  const wallet = useWalletClient();
  const { route, inputAmount, destinationChainId, destinationToken, userAddress, sockIds, amounts } = input;

  // Fetch available routes
  const {
    data: routes,
    isLoading: isLoadingRoutes,
    isError: isRoutesError,
    error: routesError,
  } = useQuery({
    queryKey: ["across-routes", destinationChainId, destinationToken],
    queryFn: async () => {
      if (!destinationChainId || !destinationToken) {
        throw new Error("Destination chain ID and token are required");
      }

      const routes = await client.getAvailableRoutes({
        destinationChainId,
        destinationToken: destinationToken as `0x${string}`,
      });

      console.log("Available routes from SDK:", routes);

      // Return the SDK routes directly
      return routes;
    },
    enabled: !!destinationChainId && !!destinationToken,
  });

  // Get quote with TanStack Query
  const {
    data: quote,
    isLoading: isLoadingQuote,
    isError: isQuoteError,
    error: quoteError,
    refetch: refetchQuote,
  } = useQuery({
    queryKey: ["across-quote", route, inputAmount?.toString(), userAddress],
    queryFn: async () => {
      if (!route || !inputAmount || !userAddress) {
        console.error(route, inputAmount, userAddress);
        throw new Error("Route, input amount, and user address are required");
      }

      const multicallHandlerOptimism = "0x924a9f036260DdD5808007E1AA95f08eD08aA569";
      const superSocks = deployedContracts[chainId].SuperSocks;

      const generateApproveCallData = (amount: bigint) => {
        return encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [superSocks.address, amount],
        });
      };

      const generateMintCallData = (amount: bigint) => {
        return encodeFunctionData({
          abi: superSocks.abi,
          functionName: "mint",
          args: [userAddress, sockIds, amounts, amount],
        });
      };

      const message = {
        actions: [
          {
            value: 0n,
            target: route.outputToken,
            callData: generateApproveCallData(inputAmount),
            update: (updatedOutputAmount: bigint) => {
              return {
                callData: generateApproveCallData(updatedOutputAmount),
              };
            },
          },
          {
            value: 0n,
            target: superSocks.address,
            callData: generateMintCallData(inputAmount),
            update: (updatedOutputAmount: bigint) => {
              return {
                callData: generateMintCallData(updatedOutputAmount),
              };
            },
          },
        ],
        fallbackRecipient: userAddress,
      };

      console.log("getQuote", route, inputAmount, message);
      try {
        const quote = await client.getQuote({
          route,
          inputAmount,
          crossChainMessage: message,
          recipient: multicallHandlerOptimism,
        });
        console.log("quote", quote);
        return quote;
      } catch (error: any) {
        console.error("Error getting quote:", error);

        // Handle specific Across errors
        if (error.message?.includes("Sent amount is too low relative to fees")) {
          const acrossError: AcrossError = {
            type: "AMOUNT_TOO_LOW",
            message: "The amount is too low to cover bridge fees. Please try a larger amount.",
            originalError: error,
          };
          throw acrossError;
        }

        // For all other errors, just throw the original error
        throw error;
      }
    },
    enabled: !!route && !!inputAmount && !!userAddress,
  });

  // Execute a quote
  const executeQuote = async (onProgress?: ProgressCallback) => {
    if (!quote) {
      throw new Error("No quote available");
    }

    if (!wallet.data) {
      throw new Error("Wallet not connected");
    }

    try {
      await client.executeQuote({
        walletClient: wallet.data,
        deposit: quote.deposit,
        atomicIfSupported: true,
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

  return {
    // Routes data
    routes,
    isLoadingRoutes,
    isRoutesError,
    routesError,

    // Quote data
    quote,
    isLoadingQuote,
    isQuoteError,
    quoteError: quoteError as AcrossError | null,
    refetchQuote,

    // Execute function
    executeQuote,

    // Wallet state
    wallet: wallet.data,
    isWalletConnected: !!wallet.data,

    // Client (for advanced usage)
    client,
  };
}
