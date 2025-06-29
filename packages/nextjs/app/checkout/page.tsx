"use client";

import { useState } from "react";
import Link from "next/link";
import { PayWithETH } from "../../components/PayWithETH";
import { PayWithUSDCBasic } from "../../components/PayWithUSDCBasic";
import { PayWithUSDCEIP5792 } from "../../components/PayWithUSDCEIP5792";
import { USDCFaucet } from "../../components/USDCFaucet";
import deployedContracts from "../../contracts/deployedContracts";
import { BasketItem } from "./components/BasketItem";
import { CheckoutSuccess } from "./components/CheckoutSuccess";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import { chainId, superSocksAddress, usdcAddress } from "~~/utils/supersocks";

export default function CheckoutPage() {
  const { basket, clearBasket, updateBasketItemQuantity, removeFromBasket } = useGlobalState();
  const { address } = useAccount();
  const [paymentMethod, setPaymentMethod] = useState<"regular" | "batch" | "eth">("regular");
  const [success, setSuccess] = useState(false);

  const showEthOption = process.env.NEXT_PUBLIC_USDC !== "faucet";

  // Fetch the price once from the contract
  const { data: usdcPriceData, refetch: refetchUsdc } = useReadContracts({
    contracts: [
      {
        address: superSocksAddress,
        abi: deployedContracts[chainId].SuperSocks.abi,
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
        args: [address!, deployedContracts[chainId].SuperSocks.address],
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

  const baseCardClass =
    "flex-1 px-4 py-3 rounded-lg border-2 font-semibold flex flex-col items-center transition-all duration-100";
  const selectedCardClass = "border-blue-500 bg-blue-50 text-blue-700 shadow";
  const unselectedCardClass = "border-gray-300 bg-white text-gray-700 hover:border-blue-400";

  if (success) {
    return <CheckoutSuccess address={address as string} />;
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
                <BasketItem
                  key={item.sockId}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={removeFromBasket}
                />
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div>
            {/* Order Total Summary at the top */}
            <div className="mb-6">
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
                <span>{formatUnits(totalUsdcPrice, 6)} USDC</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("regular")}
                  className={`${baseCardClass} ${paymentMethod === "regular" ? selectedCardClass : unselectedCardClass}`}
                >
                  <span className="text-lg mb-1">Regular</span>
                  <span className="text-xs">Approve + Buy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("batch")}
                  className={`${baseCardClass} ${paymentMethod === "batch" ? selectedCardClass : unselectedCardClass}`}
                >
                  <span className="text-lg mb-1">Batch</span>
                  <span className="text-xs">EIP-5792</span>
                </button>
                {showEthOption && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("eth")}
                    className={`${baseCardClass} ${paymentMethod === "eth" ? selectedCardClass : unselectedCardClass}`}
                  >
                    <span className="text-lg mb-1">ETH</span>
                    <span className="text-xs">Custom Contract</span>
                  </button>
                )}
              </div>
            </div>

            {/* Payment Button(s) */}
            {paymentMethod === "regular" && (
              <PayWithUSDCBasic
                allowance={(usdcPriceData?.[2]?.result as bigint) || 0n}
                cost={totalUsdcPrice}
                address={address as string}
                encodedSocks={encodedSocks}
                quantities={quantities}
                onSuccess={handlePaymentSuccess}
              />
            )}
            {paymentMethod === "batch" && (
              <PayWithUSDCEIP5792
                allowance={(usdcPriceData?.[2]?.result as bigint) || 0n}
                cost={totalUsdcPrice}
                address={address as string}
                encodedSocks={encodedSocks}
                quantities={quantities}
                onSuccess={handlePaymentSuccess}
              />
            )}
            {paymentMethod === "eth" && showEthOption && (
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
            {paymentMethod === "regular" && !hasSufficientUsdc && (
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