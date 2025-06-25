"use client";

import Link from "next/link";
import { schema } from "../../lib/ponder";
import { desc } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useGlobalState } from "~~/services/store/store";
import { decodeBase64SVG } from "~~/utils/svg";

interface SockMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default function SocksPage() {
  const {
    data: socks,
    isError,
    isPending,
  } = usePonderQuery({
    queryFn: db => db.select().from(schema.token).orderBy(desc(schema.token.createdAt)).limit(50),
  });

  const { basket, addToBasket } = useGlobalState();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading socks...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error loading socks</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {socks && socks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {socks.map(sock => {
            let metadata: SockMetadata | null = null;

            try {
              if (sock.metadata) {
                metadata = JSON.parse(sock.metadata);
              }
            } catch (error) {
              console.error("Error parsing metadata for sock", sock.id, sock.metadata, error);
            }

            // Decode SVG if available
            const decodedSVG = metadata?.image ? decodeBase64SVG(metadata.image) : null;

            // Check if sock is already in basket
            const inBasket = basket.items.some(item => item.sockId === sock.id.toString());

            return (
              <div
                key={sock.id.toString()}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <Link
                  href={`/sock/${sock.id}`}
                  className="block aspect-square bg-gray-100 flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  {decodedSVG ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: decodedSVG }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-2">🧦</div>
                      <div className="text-sm">No Image</div>
                    </div>
                  )}
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                    <span>ID: #{sock.id.toString()}</span>
                    <span>Total: {sock.total.toString()}</span>
                  </div>
                  <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
                    <span>Creator:</span>
                    <Address address={sock.creator} size="sm" onlyEnsOrAddress={true} />
                  </div>
                  {/* Add to Basket Button */}
                  <button
                    className={`mt-4 w-full py-2 px-4 rounded font-bold text-white transition-colors ${inBasket ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"}`}
                    disabled={inBasket}
                    onClick={() => {
                      if (!inBasket) {
                        addToBasket({
                          sockId: sock.id.toString(),
                          sockData: {
                            svgString: decodedSVG || "",
                            metadata,
                            isValid: true,
                          },
                        });
                      }
                    }}
                  >
                    {inBasket ? "In Basket" : "Add to Basket"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🧦</div>
          <p className="text-xl">No socks found</p>
          <p className="text-sm mt-2">Make sure your Ponder indexer is running and has indexed some tokens.</p>
        </div>
      )}
    </div>
  );
}