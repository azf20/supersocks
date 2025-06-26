"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { desc, eq } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { schema } from "~~/lib/ponder";
import { useGlobalState } from "~~/services/store/store";
import { decodeBase64SVG } from "~~/utils/svg";

export default function SockDetailPage() {
  const params = useParams();
  const id = params?.id?.toString();
  const { basket, addToBasket } = useGlobalState();

  // Query for the sock
  const {
    data: sock,
    isPending,
    isError,
  } = usePonderQuery({
    queryFn: db =>
      db
        .select()
        .from(schema.token)
        .where(eq(schema.token.id, BigInt(id!)))
        .limit(1),
    enabled: !!id,
  });

  // Query for holders
  const { data: holders } = usePonderQuery({
    queryFn: db =>
      db
        .select()
        .from(schema.tokenBalance)
        .where(eq(schema.tokenBalance.tokenId, BigInt(id!)))
        .orderBy(desc(schema.tokenBalance.balance)),
    enabled: !!id,
  });

  // Filter out the zero address from holders
  const filteredHolders = holders?.filter(h => h.owner !== "0x0000000000000000000000000000000000000000");

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading sock...</div>;
  }
  if (isError || !sock || sock.length === 0) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-red-500">Sock not found</div>;
  }

  const sockData = sock[0];
  let metadata: any = null;
  try {
    if (sockData.metadata) {
      metadata = JSON.parse(sockData.metadata);
    }
  } catch (error) {
    console.error("Error parsing metadata for sock", sockData.id, sockData.metadata, error);
  }
  const decodedSVG = metadata?.image ? decodeBase64SVG(metadata.image) : null;

  // Check if sock is already in basket
  const inBasket = basket.items.some(item => item.sockId === id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/socks" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Collection
      </Link>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-full md:w-64 flex items-center justify-center aspect-square bg-gray-100">
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
          </div>
          <div className="flex-1">
            <div className="mb-2 text-sm text-gray-500">
              ID: <span className="font-mono">{sockData.id}</span>
            </div>
            <div className="mb-2 text-sm text-gray-500">Total Supply: {sockData.total.toString()}</div>
            <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
              <span>Creator:</span>
              <Address address={sockData.creator} size="sm" onlyEnsOrAddress={true} />
            </div>
            {/* Add to Basket Button */}
            <button
              className={`mt-4 w-full py-2 px-1 rounded font-bold text-white transition-colors ${inBasket ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"}`}
              disabled={inBasket}
              onClick={() => {
                if (!inBasket) {
                  addToBasket({
                    sockId: sockData.id.toString(),
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
            {metadata?.attributes && metadata.attributes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {metadata.attributes.map((attr: any, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {attr.trait_type}: {attr.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Holders</h2>
          {filteredHolders && filteredHolders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredHolders.map(holder => (
                <li key={holder.owner} className="py-2 flex justify-between items-center">
                  <Address address={holder.owner} size="sm" onlyEnsOrAddress={true} />
                  <span className="text-gray-700">{holder.balance.toString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No holders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}