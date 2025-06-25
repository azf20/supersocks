"use client";

import Link from "next/link";
import deployedContracts from "../../contracts/deployedContracts";
import { formatUnits } from "viem";
import { useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

export default function BasketPage() {
  const { basket, updateBasketItemQuantity, removeFromBasket, clearBasket } = useGlobalState();

  // Fetch the price once from the contract
  const { data: usdcPriceData } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].SuperSocks.address,
        abi: deployedContracts[31337].SuperSocks.abi,
        functionName: "usdcPrice",
      },
    ],
  });
  const usdcPrice = (usdcPriceData?.[0]?.result as bigint) || 0n;
  const totalPrice = usdcPrice * BigInt(basket.totalItems);

  const handleQuantityChange = (sockId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromBasket(sockId);
    } else {
      updateBasketItemQuantity(sockId, newQuantity);
    }
  };

  if (basket.items.length === 0) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Your Basket</h1>
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
          <h1 className="text-4xl font-bold">Your Basket</h1>
          <button onClick={clearBasket} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Clear Basket
          </button>
        </div>

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
                  <h3 className="font-semibold text-lg">{item.sockData.metadata?.name || `Sock #${item.sockId}`}</h3>

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
                  </div>
                </div>

                {/* Remove Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => removeFromBasket(item.sockId)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Basket Summary */}
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total Items:</span>
            <span className="text-lg">{basket.totalItems}</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold">Total Price:</span>
            <span className="text-xl font-bold">
              {totalPrice > 0n ? `${formatUnits(totalPrice, 6)} USDC` : "Calculating..."}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/studio"
              className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
