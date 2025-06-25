"use client";

import Link from "next/link";

export default function CheckoutSuccessPage() {
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
            <Link href="/socks" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
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
