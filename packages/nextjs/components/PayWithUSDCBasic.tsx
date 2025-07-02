import { useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import { PayButton } from "./PayButton";
import { formatUnits } from "viem";
import { useChainId } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export function PayWithUSDCBasic({
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
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId() as 31337 | 11155111;

  // Fetch USDC balance
  const { data: usdcBalance } = useScaffoldReadContract({
    contractName: process.env.NEXT_PUBLIC_USDC == "faucet" ? "FreeRc20" : "USDC",
    functionName: "balanceOf",
    args: [address],
    chainId,
  });

  // Fetch USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: process.env.NEXT_PUBLIC_USDC == "faucet" ? "FreeRc20" : "USDC",
    functionName: "allowance",
    args: [address, deployedContracts[chainId].SuperSocks.address],
    chainId,
  });

  const hasSufficientUsdc = typeof usdcBalance === "bigint" ? usdcBalance >= cost : false;

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
      refetchAllowance();
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

  if ((allowance || 0n) < cost) {
    return (
      <>
        <div className="mb-2 text-sm text-gray-700">
          USDC Balance: {usdcBalance !== undefined ? Number(formatUnits(usdcBalance as bigint, 6)).toFixed(3) : "-"}
        </div>
        {!hasSufficientUsdc && <div className="text-red-500 text-sm mb-2">Your USDC balance is insufficient.</div>}
        <PayButton onClick={handleApprove} loading={isApproving} disabled={!hasSufficientUsdc} error={error}>
          Approve USDC
        </PayButton>
      </>
    );
  }

  return (
    <>
      <div className="mb-2 text-sm text-gray-700">
        USDC Balance: {usdcBalance !== undefined ? Number(formatUnits(usdcBalance as bigint, 6)).toFixed(3) : "-"}
      </div>
      {!hasSufficientUsdc && <div className="text-red-500 text-sm mb-2">Your USDC balance is insufficient.</div>}
      <PayButton onClick={handleMint} loading={isMinting} disabled={!hasSufficientUsdc} error={error}>
        Buy Now
      </PayButton>
    </>
  );
}