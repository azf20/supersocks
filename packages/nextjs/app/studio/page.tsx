"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import deployedContracts from "../../contracts/deployedContracts";
import { formatUnits } from "viem";
import { useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";

export default function StudioPage() {
  const { basket, addToBasket } = useGlobalState();

  const [sock, setSock] = useState({
    baseColorIndex: 0,
    top: { offset: 0, stripes: 1, thickness: 1, gap: 0, colorIndex: 1 },
    heel: { colorIndex: 1, index: BigInt(1) },
    toe: { colorIndex: 0, index: BigInt(0) },
    design: { colorIndex: 1, index: BigInt(2) },
  });

  const [previousSvg, setPreviousSvg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"base" | "top" | "heel" | "toe" | "design">("base");

  const { data, isLoading: isLoadingCheckSock } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "checkSock",
        args: [sock],
      },
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "encodeSock",
        args: [sock],
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

  const { data: renderSockData, isLoading } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "renderSock",
        args: [sock, encodedSock || BigInt(0)],
      },
    ],
  });

  const svgString = renderSockData?.[0]?.result;

  // Update previous SVG when we get a new one and we're not loading
  useEffect(() => {
    if (svgString && !isLoading) {
      setPreviousSvg(svgString);
    }
  }, [svgString, isLoading]);

  const handleAddToBasket = () => {
    if (!isValid || !encodedSock || Boolean(errors)) {
      alert("Please fix validation errors before adding to basket");
      return;
    }

    // Generate a unique sock ID based on the encoded sock data
    // Convert the encoded sock to a string and use a hash of it as the ID
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

    // Show success message
    alert("Sock added to basket!");
  };

  const updateSock = (updates: Partial<typeof sock>) => {
    setSock(prev => ({ ...prev, ...updates }));
  };

  const updateTop = (updates: Partial<typeof sock.top>) => {
    setSock(prev => {
      const newTop = { ...prev.top, ...updates };

      // If stripes is set to 0, set all other top properties to 0
      if ("stripes" in updates && Number(updates.stripes) === 0) {
        newTop.offset = 0;
        newTop.thickness = 0;
        newTop.gap = 0;
        newTop.colorIndex = 0;
      }

      // If stripes goes from 0 to >0, set thickness to 1
      if ("stripes" in updates && Number(updates.stripes) > 0 && prev.top.stripes === 0) {
        newTop.thickness = 1;
      }

      // If stripes goes from 0 or 1 to 2+, set gap to 1
      if ("stripes" in updates && Number(updates.stripes) >= 2 && prev.top.stripes <= 1) {
        newTop.gap = 1;
      }

      // If stripes goes from >1 to 1, set gap to 0 (since gaps are only relevant with multiple stripes)
      if ("stripes" in updates && Number(updates.stripes) === 1 && prev.top.stripes > 1) {
        newTop.gap = 0;
      }

      // If stripes is set to non-zero and color is currently 0, pick first non-base color
      if ("stripes" in updates && Number(updates.stripes) > 0 && newTop.colorIndex === 0) {
        // Find first color that's not the base color
        for (let i = 1; i < colorPalette.length; i++) {
          if (i !== prev.baseColorIndex) {
            newTop.colorIndex = i;
            break;
          }
        }
      }

      return {
        ...prev,
        top: newTop,
      };
    });
  };

  const updateStyle = (styleKey: "heel" | "toe" | "design", updates: Partial<typeof sock.heel>) => {
    setSock(prev => {
      const newStyle = { ...prev[styleKey], ...updates };

      // If index is set to 0, set color to 0
      if ("index" in updates && Number(updates.index) === 0) {
        newStyle.colorIndex = 0;
      }

      // If index is set to non-zero and color is currently 0, pick first non-base color
      if ("index" in updates && Number(updates.index) > 0 && newStyle.colorIndex === 0) {
        // Find first color that's not the base color
        for (let i = 1; i < colorPalette.length; i++) {
          if (i !== prev.baseColorIndex) {
            newStyle.colorIndex = i;
            break;
          }
        }
      }

      return {
        ...prev,
        [styleKey]: newStyle,
      };
    });
  };

  // Color palette for the picker
  const colorPalette = [
    { name: "White", value: "#FFFFFF", index: 0 },
    { name: "Black", value: "#000000", index: 1 },
    { name: "Red", value: "#FF0000", index: 2 },
    { name: "Green", value: "#00FF00", index: 3 },
    { name: "Blue", value: "#0000FF", index: 4 },
    { name: "Yellow", value: "#FFFF00", index: 5 },
    { name: "Magenta", value: "#FF00FF", index: 6 },
    { name: "Cyan", value: "#00FFFF", index: 7 },
    { name: "Orange", value: "#FFA500", index: 8 },
    { name: "Purple", value: "#800080", index: 9 },
    { name: "Brown", value: "#A52A2A", index: 10 },
    { name: "Gray", value: "#808080", index: 11 },
    { name: "Pink", value: "#FFC0CB", index: 12 },
    { name: "Dark Green", value: "#008000", index: 13 },
    { name: "Navy", value: "#000080", index: 14 },
    { name: "Gold", value: "#FFD700", index: 15 },
  ];

  // Color picker component
  const ColorPicker = ({
    selectedIndex,
    onColorSelect,
    label,
  }: {
    selectedIndex: number;
    onColorSelect: (index: number) => void;
    label?: string;
  }) => (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <div className="grid grid-cols-8 gap-1">
        {colorPalette.map(color => (
          <button
            key={color.index}
            onClick={() => onColorSelect(color.index)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              selectedIndex === color.index ? "border-gray-800 scale-110" : "border-gray-300 hover:border-gray-500"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "base" as const, label: "Base Color", icon: "🎨" },
    { id: "top" as const, label: "Top Stripes", icon: "📏" },
    { id: "heel" as const, label: "Heel", icon: "👠" },
    { id: "toe" as const, label: "Toe", icon: "🦶" },
    { id: "design" as const, label: "Design", icon: "✨" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "base":
        return (
          <div className="space-y-4">
            <ColorPicker
              selectedIndex={sock.baseColorIndex}
              onColorSelect={index => updateSock({ baseColorIndex: index })}
              label="Base Color"
            />
          </div>
        );

      case "top":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Top Stripes Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Stripes: {sock.top.stripes}</label>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={sock.top.stripes}
                  onChange={e => updateTop({ stripes: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {sock.top.stripes > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Offset: {sock.top.offset}</label>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={sock.top.offset}
                      onChange={e => updateTop({ offset: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Thickness: {sock.top.thickness}</label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={sock.top.thickness}
                      onChange={e => updateTop({ thickness: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {sock.top.stripes > 1 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Gap: {sock.top.gap}</label>
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={sock.top.gap}
                        onChange={e => updateTop({ gap: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div>
                    <ColorPicker
                      selectedIndex={sock.top.colorIndex}
                      onColorSelect={index => updateTop({ colorIndex: index })}
                      label="Stripe Color"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case "heel":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Heel Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Style: {Number(sock.heel.index) === 0 ? "None" : Number(sock.heel.index) === 1 ? "Small" : "Large"}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={Number(sock.heel.index)}
                  onChange={e => updateStyle("heel", { index: BigInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
              {Number(sock.heel.index) > 0 && (
                <div>
                  <ColorPicker
                    selectedIndex={sock.heel.colorIndex}
                    onColorSelect={index => updateStyle("heel", { colorIndex: index })}
                    label="Heel Color"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "toe":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Toe Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Style: {Number(sock.toe.index) === 0 ? "None" : Number(sock.toe.index) === 1 ? "Small" : "Large"}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={Number(sock.toe.index)}
                  onChange={e => updateStyle("toe", { index: BigInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
              {Number(sock.toe.index) > 0 && (
                <div>
                  <ColorPicker
                    selectedIndex={sock.toe.colorIndex}
                    onColorSelect={index => updateStyle("toe", { colorIndex: index })}
                    label="Toe Color"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "design":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Design Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pattern:{" "}
                  {Number(sock.design.index) === 0
                    ? "None"
                    : Number(sock.design.index) === 1
                      ? "Optimism"
                      : Number(sock.design.index) === 2
                        ? "Base"
                        : Number(sock.design.index) === 3
                          ? "Across"
                          : "Unisock"}
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={Number(sock.design.index)}
                  onChange={e => updateStyle("design", { index: BigInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Optimism</span>
                  <span>Base</span>
                  <span>Across</span>
                  <span>Unisock</span>
                </div>
              </div>
              {Number(sock.design.index) > 0 && (
                <div>
                  <ColorPicker
                    selectedIndex={sock.design.colorIndex}
                    onColorSelect={index => updateStyle("design", { colorIndex: index })}
                    label="Design Color"
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-6xl">
        {/* Header with Basket Info */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Sock Studio</h1>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-blue-800 font-medium">🛒 Basket: {basket.totalItems} items</span>
            </div>
            {basket.totalItems > 0 && (
              <Link href="/basket" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                View Basket
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sock Configuration Panel */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Sock Configuration</h2>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-2 md:space-x-4 overflow-x-auto" aria-label="Tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] p-6 border border-gray-200 rounded-lg bg-secondary dark:border-gray-700 dark:bg-gray-800">
              {renderTabContent()}
            </div>
          </div>

          {/* Sock Preview Panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Sock Preview</h2>

            <div className="flex justify-center">
              {isLoading && previousSvg ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-white flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: previousSvg }} className="bg-white blur-sm" />
                </div>
              ) : svgString ? (
                <div
                  dangerouslySetInnerHTML={{ __html: svgString }}
                  className="border border-gray-300 rounded-lg p-4 bg-white"
                />
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-white flex items-center justify-center">
                  <div className="w-[300px] h-[300px] bg-gray-500 rounded-lg animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Loading sock...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Status */}
            <div
              className={`p-4 rounded ${
                isLoadingCheckSock
                  ? "bg-gray-100 border border-gray-400 text-gray-700"
                  : isValid
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "bg-red-100 border border-red-400 text-red-700"
              }`}
            >
              <strong>Validation Status:</strong>{" "}
              {isLoadingCheckSock ? (
                <span className="inline-flex items-center">
                  Loading...
                  <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                </span>
              ) : isValid ? (
                "Valid"
              ) : (
                "Invalid"
              )}
              {errors && !isLoadingCheckSock && (
                <div className="mt-2">
                  <strong>Errors:</strong>
                  <p className="text-sm mt-1">{errors}</p>
                </div>
              )}
            </div>

            {/* Add to Basket Button */}
            <div className="space-y-3">
              <button
                onClick={handleAddToBasket}
                disabled={!isValid || !encodedSock || isLoadingCheckSock || Boolean(errors)}
                className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded"
              >
                {isLoadingCheckSock
                  ? "Loading..."
                  : !isValid || Boolean(errors)
                    ? "Fix Validation Errors"
                    : `Add to Basket (${usdcPrice ? `${formatUnits(usdcPrice, 6)} USDC` : "0 USDC"})`}
              </button>
            </div>

            {/* Price Info */}
            {usdcPrice && (
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">Pricing Information</h3>
                <p className="text-sm">Each sock costs {formatUnits(usdcPrice, 6)} USDC</p>
                <p className="text-sm">You can pay with USDC or ETH (with automatic conversion)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
