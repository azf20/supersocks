"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import deployedContracts from "../../contracts/deployedContracts";
import externalContracts from "../../contracts/externalContracts";
import { ChainId, Token } from "@uniswap/sdk-core";
import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useReadContracts, useSendCalls, useSimulateContract, useWaitForCallsStatus } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

const ETH_TOKEN = new Token(ChainId.OPTIMISM, "0x0000000000000000000000000000000000000000", 18, "ETH", "Ether");
const USDC_TOKEN = new Token(ChainId.OPTIMISM, "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", 6, "USDC", "USDC");

export default function CheckoutPage() {
  const { basket, clearBasket } = useGlobalState();
  const { address } = useAccount();
  const [paymentMethod, setPaymentMethod] = useState<"usdc" | "eth">("usdc");
  const { sendCallsAsync, data: sendCallsData, status: sendCallsStatus } = useSendCalls();
  const { data: callsStatusData } = useWaitForCallsStatus({
    id: sendCallsData?.id,
  });

  const callFailure = sendCallsData && callsStatusData?.status === "failure";

  // Fetch the price once from the contract
  const { data: usdcPriceData } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].SuperSocks.address,
        abi: deployedContracts[31337].SuperSocks.abi,
        functionName: "usdcPrice",
      },
      {
        address: USDC_TOKEN.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
      },
    ],
  });
  const usdcPrice = (usdcPriceData?.[0]?.result as bigint) || 0n;
  const totalUsdcPrice = usdcPrice * BigInt(basket.totalItems);
  const usdcBalance = usdcPriceData?.[1]?.result as bigint;

  // Check if USDC balance is sufficient
  const hasSufficientUsdc = usdcBalance && usdcBalance >= totalUsdcPrice;

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

  const handlePayment = async () => {
    if (!address || basket.items.length === 0) {
      alert("Please connect your wallet and ensure your basket is not empty");
      return;
    }

    try {
      const encodedSocks = basket.items.flatMap(item => Array(item.count).fill(item.sockId));
      const quantities = basket.items.flatMap(item => Array(item.count).fill(BigInt(1)));

      if (paymentMethod === "usdc") {
        await sendCallsAsync({
          calls: [
            {
              to: USDC_TOKEN.address,
              abi: erc20Abi,
              functionName: "approve",
              args: [deployedContracts[31337].SuperSocks.address, totalUsdcPrice],
            },
            {
              to: deployedContracts[31337].SuperSocks.address,
              abi: deployedContracts[31337].SuperSocks.abi,
              functionName: "mint",
              args: [address, encodedSocks, quantities, totalUsdcPrice],
            },
          ],
          experimental_fallback: true,
        });
      } else {
        await sendCallsAsync({
          calls: [
            {
              to: deployedContracts[31337].Swapper.address,
              abi: deployedContracts[31337].Swapper.abi,
              functionName: "mintSocksWithETH",
              args: [address, encodedSocks, quantities, totalUsdcPrice, address],
              value: ethPrice,
            },
          ],
          experimental_fallback: true,
        });
      }
      // Do NOT clear basket or redirect here!
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    if (sendCallsData && callsStatusData?.status === "success") {
      const timeout = setTimeout(() => {
        clearBasket();
      }, 500); // 500ms delay
      return () => clearTimeout(timeout);
    }
  }, [sendCallsData, callsStatusData, clearBasket]);

  // Show loading state while waiting for confirmation
  if (sendCallsData && callsStatusData?.status == "pending") {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Processing Payment...</h1>
            <div className="bg-yellow-100 p-8 rounded-lg text-yellow-800 text-xl">
              Waiting for transaction confirmation...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sendCallsData && callsStatusData?.status === "success") {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-2xl">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold mb-4">Order Successful!</h1>
              <p className="text-xl text-gray-600 mb-6">
                Your custom socks have been minted successfully! You can now view them in your collection.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-green-800 mb-4">What&apos;s Next?</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-green-700">Your socks are now minted as NFTs on the blockchain</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-green-700">You can view them in your collection on the Socks page</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-green-700">Design more socks or explore the community collection</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href={`/profile/${address}`}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
              >
                View My Socks
              </Link>
              <Link href="/studio" className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded">
                Design More Socks
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (basket.items.length === 0) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Checkout</h1>
            <div className="bg-gray-100 p-8 rounded-lg">
              <p className="text-xl text-gray-600 mb-6">Your basket is empty</p>
              <Link href="/studio" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <Link href="/basket" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Back to Basket
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {basket.items.map(item => (
                <div key={item.sockId} className="flex items-center gap-3 p-3 border rounded">
                  <div
                    dangerouslySetInnerHTML={{ __html: item.sockData.svgString }}
                    className="sock-svg-preview w-16 h-16 border border-gray-300 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.sockData.metadata?.name || `Sock #${item.sockId}`}</h3>
                    <p className="text-gray-600 text-sm">Quantity: {item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Payment</h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="space-y-2">
                <label className={`flex items-center ${!hasSufficientUsdc ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <input
                    type="radio"
                    value="usdc"
                    checked={paymentMethod === "usdc"}
                    onChange={e => setPaymentMethod(e.target.value as "usdc" | "eth")}
                    disabled={!hasSufficientUsdc}
                    className="mr-2"
                  />
                  <div>
                    <div>Pay with USDC ({formatUnits(totalUsdcPrice || 0n, 6)} USDC)</div>
                    <div className="text-sm text-gray-500">Balance: {formatUnits(usdcBalance || 0n, 6)} USDC</div>
                    {!hasSufficientUsdc && <div className="text-sm text-red-500">Insufficient balance</div>}
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="eth"
                    checked={paymentMethod === "eth"}
                    onChange={e => setPaymentMethod(e.target.value as "usdc" | "eth")}
                    className="mr-2"
                  />
                  Pay with ETH ({ethPrice > 0n ? formatEther(ethPrice) : "Calculating..."} ETH)
                </label>
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Total Items:</span>
                <span className="text-lg">{basket.totalItems}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">Price per sock:</span>
                <span className="text-lg">{formatUnits(usdcPrice, 6)} USDC</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>
                  {paymentMethod === "usdc"
                    ? `${formatUnits(totalUsdcPrice, 6)} USDC`
                    : `${ethPrice > 0n ? formatEther(ethPrice) : "Calculating..."} ETH`}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={
                !address ||
                sendCallsStatus === "pending" ||
                totalUsdcPrice === 0n ||
                (paymentMethod === "usdc" && !hasSufficientUsdc)
              }
              className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded"
            >
              {!address
                ? "Connect Wallet to Pay"
                : sendCallsStatus === "pending"
                  ? "Processing Payment..."
                  : paymentMethod === "usdc" && !hasSufficientUsdc
                    ? "Insufficient USDC Balance"
                    : `Pay with ${paymentMethod.toUpperCase()}`}
            </button>

            {!address && (
              <p className="text-red-500 text-sm mt-2">Please connect your wallet to complete the purchase</p>
            )}
            {paymentMethod === "usdc" && !hasSufficientUsdc && (
              <p className="text-red-500 text-sm mt-2">
                Your USDC balance is insufficient. Please use ETH payment or add more USDC.
              </p>
            )}
            {callFailure && <p className="text-red-500 text-sm mt-2">Payment failed. Please try again.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
