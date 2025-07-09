import Link from "next/link";
import { decodeBase64SVG } from "../utils/svg";
import { BuyButtons } from "./BuyButtons";
import { Address } from "./scaffold-eth/Address/Address";
import { ScissorsIcon } from "@heroicons/react/24/outline";

interface SockCardProps {
  id: string | number;
  metadata?: any;
  total?: string | number;
  creator?: string;
  ownedCount?: string | number;
  className?: string;
  basket: any;
  addToBasket: (item: any) => void;
  showBuyButtons?: boolean;
}

export function SockCard({
  id,
  metadata,
  total,
  creator,
  ownedCount,
  className = "",
  basket,
  addToBasket,
  showBuyButtons = true,
}: SockCardProps) {
  let decodedSVG: string | null = null;
  try {
    if (metadata?.image) {
      decodedSVG = decodeBase64SVG(metadata.image);
    }
  } catch {
    decodedSVG = null;
  }
  const sockId = typeof id === "string" ? id : id.toString();
  const inBasket = basket.items.some((item: any) => item.sockId === sockId);
  const handleAddToBasket = () => {
    if (!inBasket) {
      addToBasket({
        sockId,
        sockData: {
          svgString: decodedSVG || "",
          metadata,
          isValid: true,
        },
      });
    }
  };
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        {/* Remix Button - top right */}
        <Link
          href={`/studio?sockId=${sockId}`}
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full p-1 shadow-sm transition-colors"
          title="Remix this sock in the studio"
        >
          <ScissorsIcon className="w-4 h-4" />

          <span className="sr-only">Remix</span>
        </Link>
        <Link
          href={`/sock/${sockId}`}
          className="block w-full h-full flex items-center justify-center hover:opacity-80 transition-opacity"
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
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">#{sockId}</h3>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          {typeof total !== "undefined" && <span>Supply: {total}</span>}
        </div>
        {typeof ownedCount !== "undefined" && <div className="text-xs text-blue-600 mb-2">You own: {ownedCount}</div>}
        {creator && (
          <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
            <span>Creator:</span>
            <Address address={creator} size="xs" onlyEnsOrAddress={true} />
          </div>
        )}
        {showBuyButtons && (
          <BuyButtons
            isValid={true}
            errors={undefined}
            encodedSock={sockId}
            onAddToBasket={handleAddToBasket}
            basketContainsSock={!!inBasket}
          />
        )}
      </div>
    </div>
  );
}