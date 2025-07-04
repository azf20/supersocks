import Link from "next/link";

export function CheckoutSuccess({ address }: { address: string }) {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold mb-4">Order Successful!</h1>
            <p className="text-xl text-gray-600 mb-6">Your Supersocks have been stitched onchain!</p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/profile/${address}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
            >
              View My Socks
            </Link>
            <Link href="/socks" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded">
              Explore the Collection
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
