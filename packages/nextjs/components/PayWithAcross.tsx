import { useState } from "react";
import { PayButton } from "./PayButton";
import { ExecutionProgress, Progress } from "./Progress";
import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { useChains, useReadContracts } from "wagmi";
import { useAcross } from "~~/hooks/useAcross";

//import { chainId } from "~~/utils/supersocks";

const chainId = 10;

//import { usdcAddress } from "~~/utils/supersocks";
const usdcAddress = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

type RouteResponse = {
  originChainId: number;
  originToken: string;
  destinationChainId: number;
  destinationToken: string;
  originTokenSymbol: string;
  destinationTokenSymbol: string;
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
  encodedSocks: string[];
  quantities: bigint[];
  onSuccess?: () => void;
}) {
  const [error] = useState<string | null>(null);
  const chains = useChains();
  const { useQuote, executeQuote, wallet } = useAcross();
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<ExecutionProgress | null>(null);
  const [executionError, setExecutionError] = useState<Error | null>(null);

  console.log("PayWithAcross", cost, address, encodedSocks, quantities, onSuccess, error);

  // Get chain name from available chains
  const getChainName = (chainId: number) => {
    const chain = chains.find(c => c.id === chainId);
    return chain?.name || `Chain ${chainId}`;
  };

  // Calculate input amount (cost + 1%)
  const inputAmount = cost;

  console.log("Input amount:", inputAmount);

  // Get quote for selected route
  const quoteRoute = selectedRoute
    ? {
        originChainId: selectedRoute.originChainId,
        destinationChainId: selectedRoute.destinationChainId,
        inputToken: selectedRoute.originToken,
        outputToken: selectedRoute.destinationToken,
      }
    : null;

  const { data: quote, isLoading: isLoadingQuote } = useQuote(quoteRoute, inputAmount);

  // Handle quote execution
  const handleExecuteQuote = async () => {
    if (!quote || !wallet.data) {
      console.error("No quote or wallet not connected");
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(null);
    setExecutionError(null);

    try {
      await executeQuote(quote, progress => {
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

  // Fetch available routes from Across Protocol
  const { data: routes } = useQuery({
    queryKey: ["across-routes", chainId],
    queryFn: async (): Promise<RouteResponse[]> => {
      const baseUrl = "https://app.across.to";
      const response = await fetch(
        `${baseUrl}/api/available-routes?originChainId=&destinationChainId=${chainId}&destinationToken=${usdcAddress}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }
      const data = await response.json();
      console.log("Available routes:", data);
      return data;
    },
  });

  // Filter routes to only include those from configured chains
  const filteredRoutes = routes?.filter(route => chains.some(chain => chain.id === route.originChainId)) || [];

  // Prepare contracts for balance fetching (only non-native tokens)
  const balanceContracts = filteredRoutes
    .filter(route => !route.isNative)
    .map(route => ({
      address: route.originToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address as `0x${string}`] as const,
      chainId: route.originChainId,
    }));

  // Fetch balances for all origin tokens
  const {
    data: balances,
    isLoading: isLoadingBalances,
    error: balanceError,
  } = useReadContracts({
    contracts: balanceContracts,
  });

  console.log("Balances:", balances, balanceError);
  console.log("Balance contracts:", balanceContracts);
  console.log("Selected route:", selectedRoute);
  console.log("Quote:", quote);

  // Display origin token balances
  const renderOriginBalances = () => {
    if (!filteredRoutes || filteredRoutes.length === 0) {
      return (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Loading available routes...</p>
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
            const isSelected = selectedRoute?.originToken === route.originToken;

            return (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{getChainName(route.originChainId)}</span>
                      <span className="text-xs text-gray-500">({route.originTokenSymbol})</span>
                      {isSelected && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Selected</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Token: {route.originToken.slice(0, 8)}...{route.originToken.slice(-6)}
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
              {Number(formatUnits(inputAmount, 6)).toFixed(3)} {selectedRoute.originTokenSymbol}
            </span>
          </div>
          {isLoadingQuote ? (
            <div className="text-center text-gray-600">Loading quote...</div>
          ) : quote ? (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Output Amount:</span>
                <span className="font-medium">
                  {Number(formatUnits(BigInt(quote.deposit.outputAmount), 6)).toFixed(3)}{" "}
                  {selectedRoute.destinationTokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Fee:</span>
                <span className="font-medium">
                  {Number(formatUnits(BigInt(quote.fees.totalRelayFee.total), 6)).toFixed(3)}{" "}
                  {selectedRoute.originTokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>LP Fee:</span>
                <span className="font-medium">
                  {Number(formatUnits(BigInt(quote.fees.lpFee.total), 6)).toFixed(3)} {selectedRoute.originTokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Relayer Gas Fee:</span>
                <span className="font-medium">
                  {Number(formatUnits(BigInt(quote.fees.relayerGasFee.total), 6)).toFixed(3)}{" "}
                  {selectedRoute.originTokenSymbol}
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

  return (
    <>
      {renderOriginBalances()}
      {renderQuote()}
      <Progress progress={executionProgress} error={executionError} className="mb-4" />
      <PayButton
        onClick={handleExecuteQuote}
        loading={isExecuting}
        disabled={!selectedRoute}
        error={executionError?.message || null}
      >
        {selectedRoute ? "Bridge & Buy" : "Select a route to continue"}
      </PayButton>
    </>
  );
}
