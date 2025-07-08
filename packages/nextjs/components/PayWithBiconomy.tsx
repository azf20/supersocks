import { useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import externalContracts from "../contracts/externalContracts";
import { PayButton } from "./PayButton";
import { ExecutionProgress, Progress } from "./Progress";
import { createMeeClient, getMeeScanLink, toMultichainNexusAccount } from "@biconomy/abstractjs";
import { formatEther } from "viem";
import { http } from "viem";
import { optimism } from "viem/chains";
import { useWalletClient } from "wagmi";
import { ETH_TOKEN, USDC_TOKEN, useUniswapETHQuote } from "~~/hooks/useUniswapETHQuote";
import { chainId, superSocksAddress } from "~~/utils/supersocks";

const v3SwapRouter = externalContracts[10].V3_SWAP_ROUTER;

export function PayWithBiconomy({
  cost,
  address,
  encodedSocks,
  quantities,
  onSuccess,
}: {
  cost: bigint;
  address: string;
  encodedSocks: bigint[];
  quantities: bigint[];
  onSuccess?: () => void;
}) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<ExecutionProgress | null>(null);
  const [executionError, setExecutionError] = useState<Error | null>(null);
  const { data: walletClient } = useWalletClient();

  // Get ETH quote using the custom hook
  const { ethPrice, isLoading: isQuoteLoading } = useUniswapETHQuote(cost, 100n); // 1% slippage

  const handleExecuteQuote = async () => {
    if (!address || encodedSocks.length === 0) {
      setExecutionError(new Error("Please connect your wallet and ensure your basket is not empty"));
      throw new Error("Please connect your wallet and ensure your basket is not empty");
    }

    if (ethPrice === 0n) {
      setExecutionError(new Error("Unable to get ETH quote. Please try again."));
      throw new Error("Unable to get ETH quote. Please try again.");
    }

    if (!walletClient) {
      setExecutionError(new Error("No wallet connector found"));
      throw new Error("No wallet connector found");
    }

    setIsExecuting(true);
    setExecutionProgress(null);
    setExecutionError(null);

    try {
      // Step 1: Get user's signer
      setExecutionProgress({
        step: "approve",
        status: "txPending",
      });

      // Step 2: Create orchestrator account
      setExecutionProgress({
        step: "deposit",
        status: "txPending",
      });

      const orchestrator = await toMultichainNexusAccount({
        chains: [optimism],
        transports: [http()],
        signer: walletClient,
      });

      const meeClient = await createMeeClient({
        account: orchestrator,
        apiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY,
      });

      // Step 3: Build swap instruction (ETH -> USDC) using Uniswap V3
      const swapEthToUsdc = await orchestrator.buildComposable({
        type: "default",
        data: {
          chainId: optimism.id,
          abi: v3SwapRouter.abi,
          to: v3SwapRouter.address,
          functionName: "exactOutputSingle",
          args: [
            {
              tokenIn: ETH_TOKEN.address,
              tokenOut: USDC_TOKEN.address,
              fee: 500, // 0.05% fee tier
              recipient: orchestrator.addressOn(optimism.id, true),
              amountOut: cost,
              amountInMaximum: ethPrice,
              sqrtPriceLimitX96: 0n,
            },
          ],
          value: ethPrice, // Send ETH with the transaction
        },
      });

      // Step 4: Build mint instruction using the exact USDC amount
      const mintSocks = await orchestrator.buildComposable({
        type: "default",
        data: {
          chainId: optimism.id,
          abi: deployedContracts[chainId].SuperSocks.abi,
          to: superSocksAddress,
          functionName: "mint",
          args: [address, encodedSocks, quantities, cost],
        },
      });

      // Step 5: Create trigger for ETH input
      const trigger = {
        chainId: optimism.id,
        tokenAddress: "0x0000000000000000000000000000000000000000", // ETH
        amount: ethPrice,
      };

      // Step 6: Get quote and execute
      setExecutionProgress({
        step: "fill",
        status: "txPending",
      });

      const fusionQuote = await meeClient.getFusionQuote({
        trigger,
        feeToken: { address: "0x0000000000000000000000000000000000000000", chainId: optimism.id },
        instructions: [swapEthToUsdc, mintSocks],
      });

      const { hash } = await meeClient.executeFusionQuote({ fusionQuote });
      console.log(`Biconomy Explorer: ${getMeeScanLink(hash)}`);

      // Step 7: Wait for completion
      const receipt = await meeClient.waitForSupertransactionReceipt({ hash });
      console.log("Biconomy batch complete:", receipt);

      setExecutionProgress({
        step: "fill",
        status: "txSuccess",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Biconomy execution failed:", error);
      setExecutionError(error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <>
      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-2">Biconomy Gasless Payment</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>USDC Amount:</span>
            <span className="font-medium">{cost.toString()} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>ETH Cost:</span>
            <span className="font-medium">
              {ethPrice > 0n ? `${Number(formatEther(ethPrice)).toPrecision(4)} ETH` : "Calculating..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Gas Fee:</span>
            <span className="font-medium text-green-600">0 ETH (Gasless!)</span>
          </div>
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-xs">
            <span className="font-medium text-green-800">✨ Powered by Biconomy Fusion</span>
          </div>
        </div>
      </div>

      <PayButton
        onClick={handleExecuteQuote}
        loading={isExecuting || isQuoteLoading}
        disabled={ethPrice === 0n || encodedSocks.length === 0 || !walletClient}
        error={null}
        chainId={chainId}
      >
        {isExecuting
          ? "Processing..."
          : ethPrice > 0n
            ? `Pay ${Number(formatEther(ethPrice)).toPrecision(4)} ETH`
            : "Calculating..."}
      </PayButton>

      <Progress progress={executionProgress} error={executionError} className="mb-4" />

      {ethPrice === 0n && cost > 0n && <div className="text-yellow-500 text-sm mt-2">Calculating ETH price...</div>}
    </>
  );
}
