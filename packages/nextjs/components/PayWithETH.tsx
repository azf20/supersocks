import { useState } from "react";
import { PayButton } from "./PayButton";
import { formatEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { useUniswapETHQuote } from "~~/hooks/useUniswapETHQuote";

export function PayWithETH({
  totalUsdcPrice,
  encodedSocks,
  quantities,
  address,
  onSuccess,
}: {
  totalUsdcPrice: bigint;
  encodedSocks: bigint[];
  quantities: bigint[];
  address: string;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  // Fetch ETH balance
  const { data: ethBalance } = useWatchBalance({ address: address as `0x${string}` });

  // Get ETH quote using the custom hook
  const { ethPrice, isLoading: isQuoteLoading } = useUniswapETHQuote(totalUsdcPrice, 100n); // 1% slippage

  // Check if ETH balance is sufficient
  const hasSufficientEth = ethBalance && ethPrice ? ethBalance.value >= ethPrice : false;

  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "Swapper",
  });

  const handlePayment = async () => {
    if (!address || encodedSocks.length === 0) {
      setError("Please connect your wallet and ensure your basket is not empty");
      return;
    }

    if (ethPrice === 0n) {
      setError("Unable to get ETH quote. Please try again.");
      return;
    }

    setError(null);
    try {
      await writeContractAsync({
        functionName: "mintSocksWithETH",
        args: [address, encodedSocks, quantities, totalUsdcPrice, address],
        value: ethPrice,
      });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-2 text-sm text-gray-700">
        ETH Balance: {ethBalance ? Number(formatEther(ethBalance.value)).toPrecision(3) : "-"}
      </div>
      {!hasSufficientEth && ethPrice > 0n && (
        <div className="text-red-500 text-sm mb-2">Your ETH balance is insufficient.</div>
      )}
      <PayButton
        onClick={handlePayment}
        loading={isPending || isQuoteLoading}
        disabled={ethPrice === 0n || !hasSufficientEth}
        error={error}
      >
        {ethPrice > 0n ? `Buy now ${Number(formatEther(ethPrice)).toPrecision(3)} ETH` : "Calculating..."}
      </PayButton>
      {ethPrice === 0n && totalUsdcPrice > 0n && (
        <div className="text-yellow-500 text-sm mt-2">Calculating ETH price...</div>
      )}
    </div>
  );
}
