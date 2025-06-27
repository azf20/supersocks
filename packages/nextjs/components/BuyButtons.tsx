import { useRouter } from "next/navigation";

export function BuyButtons({
  isValid,
  errors,
  encodedSock,
  onAddToBasket,
  basketContainsSock,
}: {
  isValid: boolean;
  errors?: string;
  encodedSock: bigint | string | undefined;
  onAddToBasket?: () => void;
  basketContainsSock: boolean;
}) {
  const router = useRouter();

  const handleBuyNow = () => {
    if (!basketContainsSock && onAddToBasket) {
      onAddToBasket();
    }
    router.push("/checkout");
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={onAddToBasket}
        disabled={!isValid || !encodedSock || Boolean(errors) || basketContainsSock}
        className="flex-1 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-2"
      >
        {basketContainsSock
          ? "Already in Basket"
          : !isValid || Boolean(errors)
            ? "Fix Validation Errors"
            : !encodedSock
              ? "Loading..."
              : "Add to Basket"}
      </button>
      <button
        type="button"
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 text-center"
        onClick={handleBuyNow}
      >
        Buy Now
      </button>
    </div>
  );
}
