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
import { formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { PayWithAcross } from "~~/components/PayWithAcross";
import { PayWithDaimo } from "~~/components/PayWithDaimo";
import { useGlobalState } from "~~/services/store/store";
import { chainId, superSocksAddress } from "~~/utils/supersocks";


export default function CheckoutPage() {
  const { basket, clearBasket, updateBasketItemQuantity, removeFromBasket } = useGlobalState();
  const { address } = useAccount();
  const [success, setSuccess] = useState(false);

  // Get allowed payment methods from environment variable
  const allowedPaymentMethods = process.env.NEXT_PUBLIC_PAYMENT_METHODS
    ? process.env.NEXT_PUBLIC_PAYMENT_METHODS.split(",").map(method => method.trim().toLowerCase())
    : ["regular", "batch", "eth", "across", "daimo"]; // Default to all methods if not specified

  // Set default payment method to first available method
  const defaultPaymentMethod = allowedPaymentMethods[0] as "regular" | "batch" | "eth" | "across" | "daimo";
  const [paymentMethod, setPaymentMethod] = useState<"regular" | "batch" | "eth" | "across" | "biconomy" | "daimo">(
    defaultPaymentMethod,
  );

  const showEthOption = process.env.NEXT_PUBLIC_USDC !== "faucet";

  // Fetch the price once from the contract
  const { data: usdcPriceData, refetch: refetchUsdc } = useReadContracts({
    contracts: [
      {
        address: superSocksAddress,
        abi: deployedContracts[chainId].SuperSocks.abi,
        functionName: "config",
        chainId,
      },
    ],
  });
  const configData = usdcPriceData?.[0]?.result;
  const usdcPrice = configData?.[0] || 0n;
  const creatorFee = configData?.[2];
  const platformFee = configData?.[3];
  const totalUsdcPrice = usdcPrice * BigInt(basket.totalItems);

  // Calculate fee percentages and amounts
  const creatorFeePercent = creatorFee ? Number(creatorFee) / 100 : 0;
  const platformFeePercent = platformFee ? Number(platformFee) / 100 : 0;
  const minterFeePercent = 100 - creatorFeePercent - platformFeePercent;

  // Calculate fee amounts for the total order
  const totalCreatorFee = (totalUsdcPrice * BigInt(creatorFee || 0)) / 10000n;
  const totalPlatformFee = (totalUsdcPrice * BigInt(platformFee || 0)) / 10000n;
  const totalMinterFee = totalUsdcPrice - totalCreatorFee - totalPlatformFee;

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

  const encodedSocks = basket.items.map(item => BigInt(item.sockId));
  const quantities = basket.items.map(item => BigInt(item.count));

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

              {/* Fee Breakdown */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm">Fee Breakdown:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Sock designer ({creatorFeePercent}%):</span>
                    <span className="text-blue-600">{formatUnits(totalCreatorFee, 6)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supersocks ({platformFeePercent}%):</span>
                    <span className="text-green-600">{formatUnits(totalPlatformFee, 6)} USDC</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>You get back ({minterFeePercent}%):</span>
                    <span className="text-purple-600">{formatUnits(totalMinterFee, 6)} USDC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="flex gap-4 mb-4 overflow-x-auto no-scrollbar flex-wrap justify-center">
                {/* Payment method buttons */}
                {allowedPaymentMethods.includes("regular") && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("regular")}
                    className={`${baseCardClass} ${paymentMethod === "regular" ? selectedCardClass : unselectedCardClass}`}
                  >
                    <span className="text-lg mb-1">Regular</span>
                    <span className="text-xs">Approve + Buy</span>
                  </button>
                )}
                {allowedPaymentMethods.includes("batch") && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("batch")}
                    className={`${baseCardClass} ${paymentMethod === "batch" ? selectedCardClass : unselectedCardClass}`}
                  >
                    <span className="text-lg mb-1">Batch</span>
                    <span className="text-xs">EIP-5792</span>
                  </button>
                )}
                {allowedPaymentMethods.includes("eth") && showEthOption && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("eth")}
                    className={`${baseCardClass} ${paymentMethod === "eth" ? selectedCardClass : unselectedCardClass}`}
                  >
                    <span className="text-lg mb-1">ETH</span>
                    <span className="text-xs">Custom Contract</span>
                  </button>
                )}
                {allowedPaymentMethods.includes("across") && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("across")}
                    className={`${baseCardClass} ${paymentMethod === "across" ? selectedCardClass : unselectedCardClass}`}
                  >
                    <span className="text-lg mb-1">Across</span>
                    <span className="text-xs">Across Protocol</span>
                  </button>
                )}
                {allowedPaymentMethods.includes("daimo") && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("daimo")}
                    className={`${baseCardClass} ${paymentMethod === "daimo" ? selectedCardClass : unselectedCardClass}`}
                  >
                    <span className="text-lg mb-1">Daimo</span>
                    <span className="text-xs">Daimo Pay</span>
                  </button>
                )}
              </div>
            </div>

            {/* Payment Button(s) */}
            {paymentMethod === "regular" && (
              <PayWithUSDCBasic
                cost={totalUsdcPrice}
                address={address as string}
                encodedSocks={encodedSocks}
                quantities={quantities}
                onSuccess={handlePaymentSuccess}
              />
            )}
            {paymentMethod === "batch" && (
              <PayWithUSDCEIP5792
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
            {paymentMethod === "across" && (
              <PayWithAcross
                cost={totalUsdcPrice}
                address={address as string}
                encodedSocks={encodedSocks}
                quantities={quantities}
                onSuccess={handlePaymentSuccess}
              />
            )}
            {paymentMethod === "daimo" && (
              <PayWithDaimo
                cost={totalUsdcPrice}
                address={address as `0x${string}`}
                encodedSocks={encodedSocks}
                quantities={quantities}
                onSuccess={handlePaymentSuccess}
              />
            )}

            {!address && (
              <p className="text-red-500 text-sm mt-2">Please connect your wallet to complete the purchase</p>
            )}
            <USDCFaucet onSuccess={refetchUsdc} />
          </div>
        </div>
      </div>
    </div>
  );
}