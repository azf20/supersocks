import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useSendCalls, useWaitForCallsStatus } from "wagmi";
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
          args: [deployedContracts[31337].SuperSocks.address, cost],
        });
      }
      calls.push({
        to: deployedContracts[31337].SuperSocks.address,
        abi: deployedContracts[31337].SuperSocks.abi,
        functionName: "mint",
        args: [address, encodedSocks, quantities, cost],
      });
      await sendCallsAsync({ calls, experimental_fallback: true });
    } catch (e: any) {
      setError(e.message || "Payment failed");
    }
  };

  if (callsStatusData?.status === "pending") {
    return (
      <div className="bg-yellow-100 p-4 rounded text-yellow-800 text-center">
        Waiting for transaction confirmation...
      </div>
    );
  }

  if (callsStatusData?.status === "success") {
    return <div className="bg-green-100 p-4 rounded text-green-800 text-center">Payment successful!</div>;
  }

  return (
    <div>
      <button onClick={handleBatchPay} className="btn" disabled={status === "pending"}>
        {status === "pending" ? "Processing..." : "Buy now"}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {callsStatusData?.status === "failure" && (
        <div className="text-red-500 text-sm mt-2">Payment failed. Please try again.</div>
      )}
    </div>
  );
}
