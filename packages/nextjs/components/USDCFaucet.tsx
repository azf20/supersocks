import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export function USDCFaucet({
  onSuccess,
  amount = BigInt(100_000_000), // 100 USDC with 6 decimals
}: {
  onSuccess?: () => void;
  amount?: bigint;
}) {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync, isMining } = useScaffoldWriteContract({
    contractName: "FreeRc20",
  });

  const handleFaucet = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setError(null);
    try {
      await writeContractAsync({
        functionName: "mint",
        args: [address, amount],
      });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || "Failed to mint USDC");
    }
  };

  // Only show if USDC faucet is enabled
  if (process.env.NEXT_PUBLIC_USDC !== "faucet") {
    return null;
  }

  return (
    <div>
      <button
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleFaucet}
        disabled={isMining || !address}
      >
        {isMining ? "Minting..." : "Get Free USDC"}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {!address && <div className="text-yellow-500 text-sm mt-2">Connect your wallet to get free USDC</div>}
    </div>
  );
}
