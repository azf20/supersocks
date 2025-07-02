import { useEffect, useState } from "react";
import { PayButton } from "./PayButton";
import { erc20Abi } from "viem";
import { useChainId, useSendCalls, useWaitForCallsStatus } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { usdcAddress } from "~~/utils/supersocks";

export function PayWithUSDCEIP5792({
  allowance,
  cost,
  address,
  encodedSocks,
  quantities,
  onSuccess,
}: {
  allowance: bigint;
  cost: bigint;
  address: string;
  encodedSocks: string[];
  quantities: bigint[];
  onSuccess?: () => void;
}) {
  const { sendCallsAsync, data: sendCallsData, status } = useSendCalls();
  const { data: callsStatusData } = useWaitForCallsStatus({ id: sendCallsData?.id });
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId() as 31337 | 11155111;
  const [sending, setSending] = useState(false);

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
      if (allowance < cost) {
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
      <PayButton
        onClick={handleBatchPay}
        loading={sending || status === "pending" || (status === "success" && !callsStatusData)}
        disabled={callsStatusData?.status === "success"}
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