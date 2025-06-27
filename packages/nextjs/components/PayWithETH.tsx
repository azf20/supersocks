import { useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import externalContracts from "../contracts/externalContracts";
import { ChainId, Token } from "@uniswap/sdk-core";
import { formatEther } from "viem";
import { useSimulateContract } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const usdcAddress =
  process.env.NEXT_PUBLIC_USDC == "faucet"
    ? deployedContracts[31337].FreeRc20.address
    : "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

const ETH_TOKEN = new Token(ChainId.OPTIMISM, "0x0000000000000000000000000000000000000000", 18, "ETH", "Ether");
const USDC_TOKEN = new Token(ChainId.OPTIMISM, usdcAddress, 6, "USDC", "USDC");

export function PayWithETH({
  totalUsdcPrice,
  encodedSocks,
  quantities,
  address,
  onSuccess,
}: {
  totalUsdcPrice: bigint;
  encodedSocks: string[];
  quantities: bigint[];
  address: string;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  // Get ETH quote for the total USDC amount
  const QuoteConfig = {
    poolKey: {
      currency0: ETH_TOKEN.address,
      currency1: USDC_TOKEN.address,
      fee: 500,
      tickSpacing: 10,
      hooks: "0x0000000000000000000000000000000000000000",
    },
    zeroForOne: true,
    exactAmount: totalUsdcPrice,
    hookData: "0x00",
  };

  const { data: quoteResult } = useSimulateContract({
    address: externalContracts[31337].QUOTER.address,
    abi: externalContracts[31337].QUOTER.abi,
    functionName: "quoteExactOutputSingle",
    args: [QuoteConfig],
    query: {
      enabled: totalUsdcPrice > 0n,
    },
  });

  const slippage = 50n; // 50% slippage
  const quote = quoteResult?.result[0];
  const ethPrice = quote ? (quote * (slippage + 100n)) / 100n : 0n;

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
      // Convert string sockIds to bigint for the contract
      const sockIdsAsBigInt = encodedSocks.map(sockId => BigInt(sockId));

      await writeContractAsync({
        functionName: "mintSocksWithETH",
        args: [address, sockIdsAsBigInt, quantities, totalUsdcPrice, address],
        value: ethPrice,
      });
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div>
      <button onClick={handlePayment} className="btn" disabled={isPending || ethPrice === 0n}>
        {isPending
          ? "Processing..."
          : `Buy now ${ethPrice > 0n ? Number(formatEther(ethPrice)).toPrecision(2) : "Calculating..."} ETH`}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {ethPrice === 0n && totalUsdcPrice > 0n && (
        <div className="text-yellow-500 text-sm mt-2">Calculating ETH price...</div>
      )}
    </div>
  );
}
