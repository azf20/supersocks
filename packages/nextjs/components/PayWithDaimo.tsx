"use client";

import { DaimoPayButton } from "@daimo/pay";
import { encodeFunctionData, formatUnits, getAddress } from "viem";
import { useAccount } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { chainId, usdcAddress } from "~~/utils/supersocks";

export function PayWithDaimo({
  cost,
  onSuccess,
  encodedSocks,
  quantities,
  address,
}: {
  cost: bigint;
  address: `0x${string}`;
  encodedSocks: string[];
  quantities: bigint[];
  onSuccess?: () => void;
}) {
  // Convert cost from wei to USDC units (6 decimals)
  const costInUsdc = formatUnits(cost, 6);

  // For now, we'll use a placeholder recipient address
  // In a real implementation, this would be the contract address or a payment processor
  const paymentRecipient = deployedContracts[chainId].SuperSocks.address;
  const callData = encodeFunctionData({
    abi: deployedContracts[chainId].SuperSocks.abi,
    functionName: "mint",
    args: [address, encodedSocks.map(sockId => BigInt(sockId)), quantities, cost],
  });

  const { isConnected } = useAccount();

  const handlePaymentStarted = (e: any) => {
    console.log("Daimo payment started:", e);
  };

  const handlePaymentCompleted = (e: any) => {
    console.log("Daimo payment completed:", e);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Pay with Daimo</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">{costInUsdc} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="font-medium">Optimism</span>
          </div>
          <div className="flex justify-between">
            <span>Recipient:</span>
            <span className="font-medium text-xs">
              {paymentRecipient.slice(0, 8)}...{paymentRecipient.slice(-6)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <DaimoPayButton.Custom
          appId="pay-demo"
          toChain={chainId}
          toUnits={costInUsdc}
          toToken={getAddress(usdcAddress)}
          toAddress={getAddress(paymentRecipient)}
          toCallData={callData}
          onPaymentStarted={handlePaymentStarted}
          onPaymentCompleted={handlePaymentCompleted}
        >
          {({ show }) => (
            <button
              onClick={show}
              className={`w-full py-2 px-4 rounded font-bold text-white transition-colors ${
                !isConnected ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={!isConnected}
            >
              Pay with Daimo
            </button>
          )}
        </DaimoPayButton.Custom>
      </div>
    </div>
  );
}
