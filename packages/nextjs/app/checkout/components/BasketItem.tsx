import React from "react";

export function BasketItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: any;
  onQuantityChange: (sockId: string, newQuantity: number) => void;
  onRemove: (sockId: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
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
          <h3 className="font-semibold text-sm break-all whitespace-normal">#{item.sockId}</h3>
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onQuantityChange(item.sockId, item.count - 1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded"
            >
              -
            </button>
            <span className="text-lg font-medium min-w-[2rem] text-center">{item.count}</span>
            <button
              onClick={() => onQuantityChange(item.sockId, item.count + 1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded"
            >
              +
            </button>
            <button
              onClick={() => onRemove(item.sockId)}
              className="text-red-500 hover:text-red-700 font-medium ml-auto"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
