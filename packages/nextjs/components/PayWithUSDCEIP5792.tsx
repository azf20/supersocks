import { useEffect, useState } from "react";
import { PayButton } from "./PayButton";
import { erc20Abi } from "viem";
import { formatUnits } from "viem";
import { useSendCalls, useWaitForCallsStatus } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { usdcAddress } from "~~/utils/supersocks";
import { chainId } from "~~/utils/supersocks";

export function PayWithUSDCEIP5792({
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
  const { sendCallsAsync, data: sendCallsData, status } = useSendCalls();
  const { data: callsStatusData } = useWaitForCallsStatus({ id: sendCallsData?.id });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch USDC balance
  const { data: usdcBalance } = useScaffoldReadContract({
    contractName: process.env.NEXT_PUBLIC_USDC == "faucet" ? "FreeRc20" : "USDC",
    functionName: "balanceOf",
    args: [address],
    chainId,
  });

  // Fetch USDC allowance
  const { data: allowance } = useScaffoldReadContract({
    contractName: process.env.NEXT_PUBLIC_USDC == "faucet" ? "FreeRc20" : "USDC",
    functionName: "allowance",
    args: [address, deployedContracts[chainId].SuperSocks.address],
    chainId,
  });

  const hasSufficientUsdc = typeof usdcBalance === "bigint" ? usdcBalance >= cost : false;

  useEffect(() => {
    if (callsStatusData?.status === "success" && onSuccess) {
      onSuccess();
    }
    if (callsStatusData?.status === "failure") {
      setError("Payment failed. Please try again.");
    }
  }, [callsStatusData, onSuccess]);

  const handleBatchPay = async () => {
    setError(null);
    try {
      const calls = [];
      if ((allowance || 0n) < cost) {
        calls.push({
          to: usdcAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [deployedContracts[chainId].SuperSocks.address, cost],
        });
      }
      calls.push({
        to: deployedContracts[chainId].SuperSocks.address,
        abi: deployedContracts[chainId].SuperSocks.abi,
        functionName: "mint",
        args: [address, encodedSocks, quantities, cost],
      });
      setSending(true);
      await sendCallsAsync({ calls, experimental_fallback: true });
    } catch (e: any) {
      setError(e.message || "Payment failed");
    } finally {
      setSending(false);
    }
  };

  let buttonText = "Buy now";
  if (status === "pending") buttonText = "Waiting for user confirmation...";
  else if (status === "success" && !callsStatusData) buttonText = "Waiting for transaction confirmation...";
  else if (sending) buttonText = "Processing...";
  else if (callsStatusData?.status === "success") buttonText = "Payment successful!";

  return (
    <>
      <div className="mb-2 text-sm text-gray-700">
        USDC Balance: {usdcBalance !== undefined ? Number(formatUnits(usdcBalance as bigint, 6)).toFixed(3) : "-"}
      </div>
      {!hasSufficientUsdc && <div className="text-red-500 text-sm mb-2">Your USDC balance is insufficient.</div>}
      <PayButton
        onClick={handleBatchPay}
        loading={sending || status === "pending" || (status === "success" && !callsStatusData)}
        disabled={callsStatusData?.status === "success" || !hasSufficientUsdc}
        error={error || (callsStatusData?.status === "failure" ? "Payment failed. Please try again." : undefined)}
      >
        {buttonText}
      </PayButton>
      {callsStatusData?.status === "success" && (
        <div className="bg-green-100 p-4 rounded text-green-800 text-center mt-2">Payment successful!</div>
      )}
    </>
  );
}