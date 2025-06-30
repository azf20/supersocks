"use client";

import { SockCard } from "../../components/SockCard";
import { schema } from "../../lib/ponder";
import { desc } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import { useGlobalState } from "~~/services/store/store";

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
            return (
              <SockCard
                key={sock.id.toString()}
                id={sock.id.toString()}
                metadata={metadata}
                total={sock.total?.toString()}
                creator={sock.creator}
                basket={basket}
                addToBasket={addToBasket}
                showBuyButtons={true}
              />
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