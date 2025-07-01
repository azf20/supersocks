import { useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { useChainId } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export function PayWithUSDCBasic({
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
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId() as 31337 | 11155111;

  const {
    writeContractAsync: writeUSDCAsync,
    isPending: isApprovalPending,
    isMining: isApprovalMining,
  } = useScaffoldWriteContract({
    contractName: process.env.NEXT_PUBLIC_USDC == "faucet" ? "FreeRc20" : "USDC",
  });

  const isApproving = isApprovalPending || isApprovalMining;

  const {
    writeContractAsync: writeSuperSocksAsync,
    isPending: isMintPending,
    isMining: isMintMining,
  } = useScaffoldWriteContract({
    contractName: "SuperSocks",
  });

  const isMinting = isMintPending || isMintMining;

  const handleApprove = async () => {
    setError(null);
    try {
      await writeUSDCAsync({
        functionName: "approve",
        args: [deployedContracts[chainId].SuperSocks.address, cost],
      });
      setApproved(true);
    } catch (e: any) {
      setError(e.message || "Approval failed");
    }
  };

  const handleMint = async () => {
    setError(null);
    try {
      // Convert string sockIds to bigint for the contract
      const sockIdsAsBigInt = encodedSocks.map(sockId => BigInt(sockId));

      await writeSuperSocksAsync({
        functionName: "mint",
        args: [address, sockIdsAsBigInt, quantities, cost],
      });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || "Minting failed");
    }
  };

  if (allowance < cost && !approved) {
    return (
      <div>
        <button onClick={handleApprove} disabled={isApproving} className="btn">
          {isApproving ? "Approving..." : "Approve USDC"}
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleMint} disabled={isMinting} className="btn">
        {isMinting ? "Minting..." : "Buy Now"}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
