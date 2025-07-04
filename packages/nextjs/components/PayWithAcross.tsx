import { useState } from "react";
import { PayButton } from "./PayButton";
import { ExecutionProgress, Progress } from "./Progress";
import { erc20Abi, formatUnits } from "viem";
import { useChains, useReadContracts } from "wagmi";
import { useAcross } from "~~/hooks/useAcross";


//import { chainId } from "~~/utils/supersocks";

const chainId = 10;

//import { usdcAddress } from "~~/utils/supersocks";
const usdcAddress = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

// Use the SDK's Route type
type Route = {
  originChainId: number;
  inputToken: string;
  destinationChainId: number;
  outputToken: string;
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  isNative: boolean;
};

export function PayWithAcross({
  cost,
  address,
  encodedSocks,
  quantities,
  onSuccess,
}: {
  cost: bigint;
  address: string;
  encodedSocks: bigint[];
  quantities: bigint[];
  onSuccess?: () => void;
}) {
  const chains = useChains();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<ExecutionProgress | null>(null);
  const [executionError, setExecutionError] = useState<Error | null>(null);

  // Get chain name from available chains
  const getChainName = (chainId: number) => {
    const chain = chains.find(c => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  // Get block explorer URL for a chain
  const getBlockExplorerUrl = (chainId: number, address: string) => {
    const chain = chains.find(c => c.id === chainId);
    if (chain?.blockExplorers?.default?.url) {
      return `${chain.blockExplorers.default.url}/address/${address}`;
    }
    return null;
  };

  // Calculate input amount
  const inputAmount = cost;

  // Get quote for selected route
  const quoteRoute = selectedRoute
    ? {
        originChainId: selectedRoute.originChainId,
        destinationChainId: selectedRoute.destinationChainId,
        inputToken: selectedRoute.inputToken,
        outputToken: selectedRoute.outputToken,
      }
    : null;

  const { routes, isLoadingRoutes, quote, isLoadingQuote, isQuoteError, quoteError, executeQuote, isWalletConnected } =
    useAcross({
      route: quoteRoute,
      inputAmount,
      destinationChainId: chainId,
      destinationToken: usdcAddress,
      userAddress: address,
      sockIds: encodedSocks,
      amounts: quantities,
    });

  // Handle quote execution
  const handleExecuteQuote = async () => {
    if (!quote || !isWalletConnected) {
      console.error("No quote or wallet not connected");
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(null);
    setExecutionError(null);

    try {
      await executeQuote(progress => {
        setExecutionProgress(progress);
        console.log("Execution progress:", progress);
      });

      // If we get here, execution was successful
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Execution failed:", error);
      setExecutionError(error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Filter routes to only include those from configured chains
  const filteredRoutes = routes?.filter(route => chains.some(chain => chain.id === route.originChainId)) || [];

  // Prepare contracts for balance fetching (only non-native tokens)
  const balanceContracts = filteredRoutes
    .filter(route => !route.isNative)
    .map(route => ({
      address: route.inputToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address as `0x${string}`] as const,
      chainId: route.originChainId,
    }));

  // Fetch balances for all origin tokens
  const { data: balances, isLoading: isLoadingBalances } = useReadContracts({
    contracts: balanceContracts,
  });

  // Check if any route has sufficient balance
  const hasAnySufficientBalance = () => {
    if (isLoadingBalances || !balances) return false;

    let balanceIndex = 0;
    for (const route of filteredRoutes) {
      if (route.isNative) {
        // For native tokens, we can't easily check balance here, so assume it's sufficient
        return true;
      } else {
        const balance = balances[balanceIndex];
        if (balance?.result && (balance.result as bigint) >= inputAmount) {
          return true;
        }
        balanceIndex++;
      }
    }
    return false;
  };

  // Check if a specific route has sufficient balance
  const hasSufficientBalance = (route: Route, routeIndex: number) => {
    if (route.isNative) {
      // For native tokens, we can't easily check balance here, so assume it's sufficient
      return true;
    }

    const balanceIndex = filteredRoutes.filter((r, i) => i < routeIndex && !r.isNative).length;
    const balance = balances?.[balanceIndex];
    return balance?.result && (balance.result as bigint) >= inputAmount;
  };

  // Display origin token balances
  const renderOriginBalances = () => {
    if (isLoadingRoutes) {
      return (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Loading available routes...</p>
        </div>
      );
    }

    if (!filteredRoutes || filteredRoutes.length === 0) {
      return (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">No available routes found.</p>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Available Routes & Balances</h3>
        <div className="space-y-2">
          {filteredRoutes.map((route, index) => {
            const balanceIndex = filteredRoutes.filter((r, i) => i < index && !r.isNative).length;
            const balance = route.isNative ? null : balances?.[balanceIndex];
            const isSelected = selectedRoute?.inputToken === route.inputToken;
            const isSufficient = hasSufficientBalance(route, index);
            const blockExplorerUrl = getBlockExplorerUrl(route.originChainId, route.inputToken);

            return (
              <div
                key={index}
                className={`p-3 border rounded-lg transition-colors ${
                  isSelected
                    ? "bg-blue-50 border-blue-300"
                    : isSufficient
                      ? "bg-white border-gray-200 hover:bg-gray-50 cursor-pointer"
                      : "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                }`}
                onClick={() => isSufficient && setSelectedRoute(route)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{getChainName(route.originChainId)}</span>
                      <span className="text-xs text-gray-500">({route.inputTokenSymbol})</span>
                      {isSelected && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Selected</span>
                      )}
                      {!isLoadingBalances && !isSufficient && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Insufficient</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Token:{" "}
                      {blockExplorerUrl ? (
                        <a
                          href={blockExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                          onClick={e => e.stopPropagation()}
                        >
                          {route.inputToken.slice(0, 8)}...{route.inputToken.slice(-6)}
                        </a>
                      ) : (
                        `${route.inputToken.slice(0, 8)}...${route.inputToken.slice(-6)}`
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {route.isNative ? (
                      <div className="text-sm text-gray-600">Native Token</div>
                    ) : isLoadingBalances ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                      <div className="text-sm font-medium">
                        {balance?.result !== null && balance?.result !== undefined
                          ? Number(formatUnits(balance.result as bigint, 6)).toFixed(3)
                          : "0.000"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Display quote information
  const renderQuote = () => {
    if (!selectedRoute) {
      return null;
    }

    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Quote for Selected Route</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>From:</span>
            <span className="font-medium">{getChainName(selectedRoute.originChainId)}</span>
          </div>
          <div className="flex justify-between">
            <span>To:</span>
            <span className="font-medium">{getChainName(selectedRoute.destinationChainId)}</span>
          </div>
          <div className="flex justify-between">
            <span>Input Amount:</span>
            <span className="font-medium">
              {Number(formatUnits(inputAmount, 6)).toFixed(3)} {selectedRoute.inputTokenSymbol}
            </span>
          </div>
          {isLoadingQuote ? (
            <div className="text-center text-gray-600">Loading quote...</div>
          ) : isQuoteError && quoteError ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium mb-1">Amount Too Low</div>
              <div className="text-red-700 text-sm">{quoteError.message}</div>
            </div>
          ) : quote ? (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Output Amount:</span>
                <span className="font-medium">
                  {Number(formatUnits(BigInt(quote.deposit.outputAmount), 6)).toFixed(3)}{" "}
                  {selectedRoute.outputTokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Fee:</span>
                <span className="font-medium">
                  {Number(formatUnits(BigInt(quote.fees.totalRelayFee.total), 6)).toFixed(3)}{" "}
                  {selectedRoute.inputTokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Fill Time:</span>
                <span className="font-medium">{quote.estimatedFillTimeSec} seconds</span>
              </div>
            </div>
          ) : (
            <div className="text-red-600">Failed to get quote</div>
          )}
        </div>
      </div>
    );
  };

  // Get button text based on available balances
  const getButtonText = () => {
    if (!selectedRoute) {
      if (!hasAnySufficientBalance()) {
        return "No routes with sufficient balance";
      }
      return "Select a route to continue";
    }

    if (isQuoteError) {
      return "Cannot bridge - see error above";
    }

    return "Bridge & Buy";
  };

  return (
    <>
      {renderOriginBalances()}
      {renderQuote()}
      <PayButton
        onClick={handleExecuteQuote}
        loading={isExecuting}
        disabled={!selectedRoute || isQuoteError || !hasAnySufficientBalance()}
        error={null}
        chainId={selectedRoute?.originChainId}
      >
        {getButtonText()}
      </PayButton>
      <Progress progress={executionProgress} error={executionError} className="mb-4" />
    </>
  );
}