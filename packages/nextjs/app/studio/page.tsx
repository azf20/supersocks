"use client";

import { useState } from "react";
import Link from "next/link";
import { BuyButtons } from "../../components/BuyButtons";
import deployedContracts from "../../contracts/deployedContracts";
import { formatUnits } from "viem";
import { useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

export default function StudioPage() {
  const { basket, addToBasket, sock, setSock } = useGlobalState();

  // Color palette for the picker - updated to match new contract
  const colorPalette = [
    { name: "Transparent", value: "#FF000000", index: 0 },
    { name: "White", value: "#FFFFFF", index: 1 },
    { name: "Black", value: "#000000", index: 2 },
    { name: "Red", value: "#FF0000", index: 3 },
    { name: "Green", value: "#00FF00", index: 4 },
    { name: "Blue", value: "#0000FF", index: 5 },
    { name: "Yellow", value: "#FFFF00", index: 6 },
    { name: "Magenta", value: "#FF00FF", index: 7 },
    { name: "Cyan", value: "#00FFFF", index: 8 },
    { name: "Orange", value: "#FFA500", index: 9 },
    { name: "Purple", value: "#800080", index: 10 },
    { name: "Brown", value: "#A52A2A", index: 11 },
    { name: "Gray", value: "#808080", index: 12 },
    { name: "Pink", value: "#FFC0CB", index: 13 },
    { name: "Dark Green", value: "#008000", index: 14 },
    { name: "Navy", value: "#000080", index: 15 },
    { name: "Gold", value: "#FFD700", index: 16 },
  ];

  // For contract calls, convert indices to BigInt
  const contractSock = {
    ...sock,
    top: { ...sock.top, index: BigInt(sock.top.index) },
    heel: { ...sock.heel, index: BigInt(sock.heel.index) },
    toe: { ...sock.toe, index: BigInt(sock.toe.index) },
    design: { ...sock.design, index: BigInt(sock.design.index) },
  };

  const { data } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "checkSock",
        args: [contractSock],
      },
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "encodeSock",
        args: [contractSock],
      },
      {
        address: deployedContracts[31337].SuperSocks.address,
        abi: deployedContracts[31337].SuperSocks.abi,
        functionName: "usdcPrice",
      },
    ],
  });

  const checkResult = data?.[0]?.result;
  const isValid = checkResult?.[0];
  const errors = checkResult?.[1];
  const encodedSock = data?.[1]?.result;
  const usdcPrice = data?.[2]?.result;

  const { data: renderSockData } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "renderSock",
        args: [contractSock, encodedSock || BigInt(0)],
      },
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "getStyle",
        args: [0, contractSock.design.index],
      },
    ],
  });

  const svgString = renderSockData?.[0]?.result;
  const designStyle = renderSockData?.[1]?.result;

  const showDesignColor = designStyle && (designStyle.includes("designColor") || designStyle.includes("designOutline"));

  const handleAddToBasket = () => {
    if (!isValid || !encodedSock || Boolean(errors)) {
      alert("Please fix validation errors before adding to basket");
      return;
    }
    const sockId = encodedSock.toString();
    addToBasket({
      sockId,
      sockData: {
        svgString: svgString || "",
        metadata: {
          name: `Custom Sock #${sockId}`,
          description: "A custom designed sock",
        },
        isValid,
        errors,
      },
    });
    alert("Sock added to basket!");
  };

  const updateSock = (updates: Partial<typeof sock>) => {
    // Ensure any index fields are stored as string
    const safeUpdates = { ...updates };
    if (safeUpdates.top && typeof safeUpdates.top.index !== "undefined" && typeof safeUpdates.top.index !== "string")
      safeUpdates.top = { ...safeUpdates.top, index: String(safeUpdates.top.index) };
    if (safeUpdates.heel && typeof safeUpdates.heel.index !== "undefined" && typeof safeUpdates.heel.index !== "string")
      safeUpdates.heel = { ...safeUpdates.heel, index: String(safeUpdates.heel.index) };
    if (safeUpdates.toe && typeof safeUpdates.toe.index !== "undefined" && typeof safeUpdates.toe.index !== "string")
      safeUpdates.toe = { ...safeUpdates.toe, index: String(safeUpdates.toe.index) };
    if (
      safeUpdates.design &&
      typeof safeUpdates.design.index !== "undefined" &&
      typeof safeUpdates.design.index !== "string"
    )
      safeUpdates.design = { ...safeUpdates.design, index: String(safeUpdates.design.index) };
    // Ensure all index fields are string before updating state
    if (safeUpdates.top && typeof safeUpdates.top.index !== "string")
      safeUpdates.top.index = String(safeUpdates.top.index);
    if (safeUpdates.heel && typeof safeUpdates.heel.index !== "string")
      safeUpdates.heel.index = String(safeUpdates.heel.index);
    if (safeUpdates.toe && typeof safeUpdates.toe.index !== "string")
      safeUpdates.toe.index = String(safeUpdates.toe.index);
    if (safeUpdates.design && typeof safeUpdates.design.index !== "string")
      safeUpdates.design.index = String(safeUpdates.design.index);
    setSock({ ...sock, ...safeUpdates });
  };

  const updateStyle = (styleKey: "heel" | "toe" | "design" | "top", updates: Partial<typeof sock.heel>) => {
    const newStyle = { ...sock[styleKey], ...updates };
    // Always store index as string
    if ("index" in updates && typeof updates.index !== "undefined" && typeof updates.index !== "string") {
      newStyle.index = String(updates.index);
    }
    if ("index" in updates && Number(newStyle.index) === 0) {
      newStyle.colorIndex = 0;
    }
    if (
      "index" in updates &&
      Number(newStyle.index) > 0 &&
      newStyle.colorIndex === 0 &&
      ["design", "top"].includes(styleKey)
    ) {
      for (let i = 1; i < colorPalette.length; i++) {
        if (i !== sock.baseColorIndex) {
          newStyle.colorIndex = i;
          break;
        }
      }
    }
    // Ensure index is always a string before updating state
    if (typeof newStyle.index !== "string") {
      newStyle.index = String(newStyle.index);
    }
    setSock({
      ...sock,
      [styleKey]: newStyle,
    });
  };

  // Custom Color picker component with swatch dropdown (no label)
  const ColorPicker = ({
    selectedIndex,
    onColorSelect,
  }: {
    selectedIndex: number;
    onColorSelect: (index: number) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const selectedColor = colorPalette.find(c => c.index === selectedIndex);
    return (
      <div className="relative">
        <button
          type="button"
          className="w-full flex items-center border border-gray-300 rounded-md p-1 text-sm"
          onClick={() => setOpen(o => !o)}
        >
          <span
            className="inline-block w-5 h-5 rounded mr-2 border"
            style={{ backgroundColor: selectedColor?.value }}
          />
          {selectedColor?.name}
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto">
            {colorPalette.map(color => (
              <button
                key={color.index}
                type="button"
                className="flex items-center w-full px-2 py-1 hover:bg-gray-100"
                onClick={() => {
                  onColorSelect(color.index);
                  setOpen(false);
                }}
              >
                <span className="inline-block w-5 h-5 rounded mr-2 border" style={{ backgroundColor: color.value }} />
                {color.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Default sock state for reset
  const defaultSock = {
    baseColorIndex: 1,
    outlineColorIndex: 2,
    top: { colorIndex: 0, index: "0" },
    heel: { colorIndex: 0, index: "0" },
    toe: { colorIndex: 0, index: "0" },
    design: { colorIndex: 0, index: "0" },
  };

  return (
    <div className="flex flex-col items-center flex-grow pt-6">
      <div className="px-2 w-full max-w-6xl">
        {/* Header with Basket Info */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Sock Studio</h1>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 px-3 py-1 rounded-lg">
              <span className="text-blue-800 font-medium">🛒 Basket: {basket.totalItems} items</span>
            </div>
            {basket.totalItems > 0 && (
              <Link
                href="/basket"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                View Basket
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left: Sock Configuration Panel */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-1">Sock Configuration</h2>
            {/* Section 1: Base, Outline, Design */}
            <div className="flex flex-row gap-4 mb-2">
              <div className="flex-1">
                <ColorPicker
                  selectedIndex={sock.baseColorIndex}
                  onColorSelect={index => updateSock({ baseColorIndex: index })}
                />
              </div>
              <div className="flex-1">
                <ColorPicker
                  selectedIndex={sock.outlineColorIndex}
                  onColorSelect={index => updateSock({ outlineColorIndex: index })}
                />
              </div>
            </div>
            {/* Design Style + Color */}
            <div className="border p-2 rounded mb-2">
              <label className="block text-xs font-medium mb-1">Design</label>
              <div className="flex flex-row gap-2 items-center">
                <div className="w-[180px]">
                  <select
                    value={sock.design.index}
                    onChange={e => updateStyle("design", { index: e.target.value })}
                    className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="0">None</option>
                    <option value="1">Smile</option>
                    <option value="2">Heart</option>
                    <option value="3">Frown</option>
                    <option value="4">Across</option>
                    <option value="5">OP</option>
                    <option value="6">Circle</option>
                    <option value="7">Ring</option>
                    <option value="8">Dog</option>
                  </select>
                </div>
                {sock.design.index !== "0" && showDesignColor && (
                  <div className="flex-1">
                    <ColorPicker
                      selectedIndex={sock.design.colorIndex}
                      onColorSelect={index => updateStyle("design", { colorIndex: index })}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Section 2: Top, Heel, Toe */}
            {/* Top Style + Color */}
            <div className="border p-2 rounded mb-2">
              <label className="block text-xs font-medium mb-1">Top Style</label>
              <div className="flex flex-row gap-2 items-center">
                <div className="w-[180px]">
                  <select
                    value={sock.top.index}
                    onChange={e => updateStyle("top", { index: e.target.value })}
                    className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="0">None</option>
                    <option value="1">One Stripe</option>
                    <option value="2">Two Stripes</option>
                    <option value="3">Stripe No Offset</option>
                    <option value="4">Thin Stripe</option>
                    <option value="5">Big Top</option>
                    <option value="6">Vertical Stripes</option>
                    <option value="7">Vertical + Horizontal</option>
                  </select>
                </div>
                {sock.top.index !== "0" && (
                  <div className="flex-1">
                    <ColorPicker
                      selectedIndex={sock.top.colorIndex}
                      onColorSelect={index => updateStyle("top", { colorIndex: index })}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Heel Style + Color */}
            <div className="border p-2 rounded mb-2">
              <label className="block text-xs font-medium mb-1">Heel Style</label>
              <div className="flex flex-row gap-2 items-center">
                <div className="w-[180px]">
                  <select
                    value={sock.heel.index}
                    onChange={e => updateStyle("heel", { index: e.target.value })}
                    className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="0">None</option>
                    <option value="1">Small</option>
                    <option value="2">Large</option>
                  </select>
                </div>
                {sock.heel.index !== "0" && (
                  <div className="flex-1">
                    <ColorPicker
                      selectedIndex={sock.heel.colorIndex}
                      onColorSelect={index => updateStyle("heel", { colorIndex: index })}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Toe Style + Color */}
            <div className="border p-2 rounded mb-2">
              <label className="block text-xs font-medium mb-1">Toe Style</label>
              <div className="flex flex-row gap-2 items-center">
                <div className="w-[180px]">
                  <select
                    value={sock.toe.index}
                    onChange={e => updateStyle("toe", { index: e.target.value })}
                    className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="0">None</option>
                    <option value="1">Small</option>
                    <option value="2">Large</option>
                  </select>
                </div>
                {sock.toe.index !== "0" && (
                  <div className="flex-1">
                    <ColorPicker
                      selectedIndex={sock.toe.colorIndex}
                      onColorSelect={index => updateStyle("toe", { colorIndex: index })}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Reset Button */}
            <button
              type="button"
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded border border-gray-300"
              onClick={() => setSock(defaultSock)}
            >
              Reset
            </button>
          </div>

          {/* Right: Sock Preview Panel */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-1">Sock Preview</h2>
            <div className="flex justify-center">
              <div
                className="border border-gray-300 rounded-lg p-2 bg-white flex items-center justify-center"
                style={{ minWidth: 300, minHeight: 300, width: 300, height: 300 }}
              >
                {svgString ? (
                  <div dangerouslySetInnerHTML={{ __html: svgString }} />
                ) : (
                  <svg width="300" height="300" viewBox="-1 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="300" height="300" rx="24" fill="#f3f4f6" />
                    <path
                      d="M60 40 h120 v160 h-10 v10 h-10 v10 h-10 v10 h-10 v10 h-10 v10 h-10 v10 H40 v-10 H30 v-10 H20 v-10 H10 v-40 h10 v-10 h10 v-10 h10 v-10 h10 V40"
                      stroke="#bbb"
                      strokeWidth="8"
                      fill="none"
                    />
                  </svg>
                )}
              </div>
            </div>
            {/* Validation Status */}
            <div
              className={`p-2 rounded text-sm ${isValid ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
            >
              <strong>Validation Status:</strong> {isValid ? "Valid" : "Invalid"}
              {errors && (
                <div className="mt-1">
                  <strong>Errors:</strong>
                  <p className="text-xs mt-1">{errors}</p>
                </div>
              )}
            </div>
            {/* Add to Basket and Buy Now Buttons */}
            <BuyButtons
              isValid={!!isValid}
              errors={errors}
              encodedSock={encodedSock}
              onAddToBasket={handleAddToBasket}
              basketContainsSock={basket.items.some(
                item => item.sockId === (encodedSock ? encodedSock.toString() : ""),
              )}
            />
            {/* Price Info */}
            {usdcPrice && (
              <div className="p-2 border rounded bg-gray-50 text-xs">
                <h3 className="font-semibold mb-1">Pricing Information</h3>
                <p>Each sock costs {formatUnits(usdcPrice, 6)} USDC</p>
                <p>You can pay with USDC or ETH (with automatic conversion)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}