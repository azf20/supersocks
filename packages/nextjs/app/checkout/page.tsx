"use client";

import { useState } from "react";
import Link from "next/link";
import { PayWithETH } from "../../components/PayWithETH";
import { PayWithUSDCBasic } from "../../components/PayWithUSDCBasic";
import { PayWithUSDCEIP5792 } from "../../components/PayWithUSDCEIP5792";
import { USDCFaucet } from "../../components/USDCFaucet";
import deployedContracts from "../../contracts/deployedContracts";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import { usdcAddress } from "~~/utils/supersocks";

export default function CheckoutPage() {
  const { basket, clearBasket, updateBasketItemQuantity, removeFromBasket } = useGlobalState();
  const { address } = useAccount();
  const [paymentMethod, setPaymentMethod] = useState<"usdc" | "eth">("usdc");
  const [success, setSuccess] = useState(false);

  // Fetch the price once from the contract
  const { data: usdcPriceData, refetch: refetchUsdc } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].SuperSocks.address,
        abi: deployedContracts[31337].SuperSocks.abi,
        functionName: "usdcPrice",
      },
      {
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: usdcAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, deployedContracts[31337].SuperSocks.address],
      },
    ],
  });
  const usdcPrice = (usdcPriceData?.[0]?.result as bigint) || 0n;
  const totalUsdcPrice = usdcPrice * BigInt(basket.totalItems);
  const usdcBalance = usdcPriceData?.[1]?.result as bigint;

  // Check if USDC balance is sufficient
  const hasSufficientUsdc = usdcBalance && usdcBalance >= totalUsdcPrice;

  const handleQuantityChange = (sockId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromBasket(sockId);
    } else {
      updateBasketItemQuantity(sockId, newQuantity);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear basket after successful payment
    setSuccess(true);

    const timeout = setTimeout(() => {
      clearBasket();
    }, 500); // 500ms delay
    return () => clearTimeout(timeout);
  };

  if (success) {
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

  const encodedSocks = basket.items.map(item => item.sockId);
  const quantities = basket.items.map(item => BigInt(item.count));
  console.log(encodedSocks, quantities);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <button onClick={clearBasket} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Clear Basket
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {basket.items.map(item => (
                <div key={item.sockId} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center gap-4">
                    {/* Sock Preview */}
                    <div className="flex-shrink-0">
                      <div
                        dangerouslySetInnerHTML={{ __html: item.sockData.svgString }}
                        className="sock-svg-preview w-24 h-24 border border-gray-300 rounded flex items-center justify-center overflow-hidden"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{`#${item.sockId}`}</h3>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.sockId, item.count - 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium min-w-[2rem] text-center">{item.count}</span>
                        <button
                          onClick={() => handleQuantityChange(item.sockId, item.count + 1)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromBasket(item.sockId)}
                          className="text-red-500 hover:text-red-700 font-medium ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
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
                {process.env.NEXT_PUBLIC_USDC !== "faucet" && (
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="eth"
                      checked={paymentMethod === "eth"}
                      onChange={e => setPaymentMethod(e.target.value as "usdc" | "eth")}
                      className="mr-2"
                    />
                    Pay with ETH
                  </label>
                )}
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
                  {paymentMethod === "usdc" ? `${formatUnits(totalUsdcPrice, 6)} USDC` : "Calculating ETH price..."}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            {paymentMethod === "usdc" && (
              <div className="flex flex-col gap-2">
                <PayWithUSDCBasic
                  allowance={(usdcPriceData?.[2]?.result as bigint) || 0n}
                  cost={totalUsdcPrice}
                  address={address as string}
                  encodedSocks={encodedSocks}
                  quantities={quantities}
                  onSuccess={handlePaymentSuccess}
                />
                <PayWithUSDCEIP5792
                  allowance={(usdcPriceData?.[2]?.result as bigint) || 0n}
                  cost={totalUsdcPrice}
                  address={address as string}
                  encodedSocks={encodedSocks}
                  quantities={quantities}
                  onSuccess={handlePaymentSuccess}
                />
              </div>
            )}
            {paymentMethod === "eth" && (
              <PayWithETH
                totalUsdcPrice={totalUsdcPrice}
                encodedSocks={encodedSocks}
                quantities={quantities}
                address={address as string}
                onSuccess={handlePaymentSuccess}
              />
            )}

            {!address && (
              <p className="text-red-500 text-sm mt-2">Please connect your wallet to complete the purchase</p>
            )}
            {paymentMethod === "usdc" && !hasSufficientUsdc && (
              <p className="text-red-500 text-sm mt-2">
                Your USDC balance is insufficient. Please use ETH payment or add more USDC.
              </p>
            )}
            <USDCFaucet onSuccess={refetchUsdc} />
          </div>
        </div>
      </div>
    </div>
  );
}