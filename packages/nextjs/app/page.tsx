"use client";

import Link from "next/link";
import { desc } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import { schema } from "~~/lib/ponder";
import { useGlobalState } from "~~/services/store/store";
import { decodeBase64SVG } from "~~/utils/svg";

export default function HomePage() {
  const { basket } = useGlobalState();

  const {
    data: recentSocks,
    isError,
    isPending,
  } = usePonderQuery({
    queryFn: db => db.select().from(schema.token).orderBy(desc(schema.token.createdAt)).limit(6),
  });

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Super Socks</h1>
          <p className="text-xl text-gray-600 mb-8">Create, collect, and trade unique custom socks on the blockchain</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/studio"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 text-lg transition-colors"
            >
              🎨 Create Socks
            </Link>
            <Link
              href="/socks"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 text-lg transition-colors"
            >
              🧦 View Collection
            </Link>
            {basket.totalItems > 0 && (
              <Link
                href="/checkout"
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-6 text-lg transition-colors"
              >
                🛒 Basket ({basket.totalItems})
              </Link>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{recentSocks ? recentSocks.length : "..."}</div>
            <div className="text-gray-600">Recent Socks</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {recentSocks ? recentSocks.reduce((sum, sock) => sum + Number(sock.total), 0) : "..."}
            </div>
            <div className="text-gray-600">Total Supply</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {recentSocks ? new Set(recentSocks.map(sock => sock.creator)).size : "..."}
            </div>
            <div className="text-gray-600">Unique Creators</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{basket.totalItems}</div>
            <div className="text-gray-600">In Your Basket</div>
          </div>
        </div>

        {/* Recent Socks Preview */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Socks</h2>
            <Link href="/socks" className="text-blue-500 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>

          {isPending ? (
            <div className="text-center py-8">
              <div className="text-xl">Loading recent socks...</div>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <div className="text-xl text-red-500">Error loading socks</div>
            </div>
          ) : recentSocks && recentSocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSocks.map(sock => {
                let metadata: any = null;

                try {
                  if (sock.metadata) {
                    metadata = JSON.parse(sock.metadata);
                  }
                } catch (error) {
                  console.error("Error parsing metadata for sock", sock.id, sock.metadata, error);
                }

                // Decode SVG if available
                const decodedSVG = metadata?.image ? decodeBase64SVG(metadata.image) : null;

                return (
                  <Link
                    key={sock.id.toString()}
                    href={`/sock/${sock.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {decodedSVG ? (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: decodedSVG }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-4xl mb-2">🧦</div>
                          <div className="text-sm">No Image</div>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{metadata?.name || `Sock #${sock.id}`}</h3>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Supply: {sock.total.toString()}</span>
                        <span>ID: #{sock.id.toString()}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧦</div>
              <p className="text-xl text-gray-500">No socks found</p>
              <p className="text-sm mt-2">Be the first to create a sock!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
