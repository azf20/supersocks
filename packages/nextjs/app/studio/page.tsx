"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BuyButtons } from "../../components/BuyButtons";
import { Address } from "../../components/scaffold-eth/Address/Address";
import deployedContracts from "../../contracts/deployedContracts";
import { ColorPicker, ConfigRow, StylePicker } from "./components";
import toast from "react-hot-toast";
import { formatUnits } from "viem";
import { useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import { chainId } from "~~/utils/supersocks";

export default function StudioPage() {
  const { basket, addToBasket, sock, setSock } = useGlobalState();

  // Single state for which color picker is open (null if none)
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);

  const toggleColorPicker = (pickerId: string) => {
    setOpenColorPicker(prev => (prev === pickerId ? null : pickerId));
  };

  // Generate color palette from contract's COLORS string
  const generateColorPalette = () => {
    const COLORS =
      "------F1F5F9E2E8F0CBD5E194A3B864748B4755693341551E293BF5F5F4E7E5E4D6D3D1A8A29E78716C57534E44403C292524FEE2E2FECACAFCA5A5F87171EF4444DC2626B91C1C991B1BFFEDD5FED7AAFDBA74FB923CF97316EA580CC2410C9A3412FEF3C7FDE68AFCD34DFBBF24F59E0BD97706B4530992400EFEF9C3FEF08AFDE047FACC15EAB308CA8A04A16207854D0EECFCCBD9F99DBEF264A3E63584CC1665A30D4D7C0F3F6212DCFCE7BBF7D086EFAC4ADE8022C55E16A34A15803D166534D1FAE5A7F3D06EE7B734D39910B981059669047857065F46CCFBF199F6E45EEAD42DD4BF14B8A60D94880F766E115E59CFFAFEA5F3FC67E8F922D3EE06B6D40891B20E7490155E75E0F2FEBAE6FD7DD3FC38BDF80EA5E90284C70369A1075985DBEAFEBFDBFE93C5FD60A5FA3B82F62563EB1D4ED81E40AFE0E7FFC7D2FEA5B4FC818CF86366F14F46E54338CA3730A3EDE9FEDDD6FEC4B5FDA78BFA8B5CF67C3AED6D28D95B21B6F3E8FFE9D5FFD8B4FEC084FCA855F79333EA7E22CE6B21A8FAE8FFF5D0FEF0ABFCE879F9D946EFC026D3A21CAF86198FFCE7F3FBCFE8F9A8D4F472B6EC4899DB2777BE185D9D174DFFE4E6FECDD3FDA4AFFB7185F43F5EE11D48BE123C9F1239";
    const colors = [];

    for (let i = 0; i < COLORS.length; i += 6) {
      const hexCode = COLORS.slice(i, i + 6);
      const index = i / 6;

      if (index === 0) {
        colors.push({ name: "Transparent", value: "#FF000000", index: 0 });
      } else {
        colors.push({
          name: `Color ${index}`,
          value: `#${hexCode}`,
          index: index,
        });
      }
    }

    return colors;
  };

  const colorPalette = generateColorPalette();

  // Filter colors based on picker type
  const getFilteredColors = (pickerType: string) => {
    if (["baseColorPicker", "outlineColorPicker", "designColorPicker", "topColorPicker"].includes(pickerType)) {
      // Hide transparent for these pickers
      return colorPalette.filter(color => color.index !== 0);
    }
    return colorPalette;
  };

  // For contract calls, use correct types: uint8 for colors, uint256 for indices
  const sockForContract = {
    baseColorIndex: Number(sock.baseColorIndex),
    outlineColorIndex: Number(sock.outlineColorIndex),
    design: {
      colorIndex: Number(sock.design.colorIndex),
      index: Number(sock.design.index),
    },
    top: {
      colorIndex: Number(sock.top.colorIndex),
      index: Number(sock.top.index),
    },
    heel: {
      colorIndex: Number(sock.heel.colorIndex),
      index: Number(sock.heel.index),
    },
    toe: {
      colorIndex: Number(sock.toe.colorIndex),
      index: Number(sock.toe.index),
    },
  };

  const metadataContract = {
    address: deployedContracts[chainId].Metadata.address,
    abi: deployedContracts[chainId].Metadata.abi,
    chainId: chainId,
  };

  const superSocksContract = {
    address: deployedContracts[chainId].SuperSocks.address,
    abi: deployedContracts[chainId].SuperSocks.abi,
    chainId: chainId,
  };

  const { data, isPending } = useReadContracts({
    contracts: [
      {
        ...metadataContract,
        functionName: "checkSock",
        args: [sockForContract],
      },
      {
        ...metadataContract,
        functionName: "encodeSock",
        args: [sockForContract],
      },
      {
        ...superSocksContract,
        functionName: "config",
      },
      {
        ...metadataContract,
        functionName: "getStyles",
        args: [],
      },
    ],
  });

  const checkResult = data?.[0]?.result;
  const isValid = checkResult?.[0];
  const errors = checkResult?.[1];
  const encodedSock = data?.[1]?.result;
  const configData = data?.[2]?.result;
  const styles = data?.[3]?.result;

  // Extract config values
  const usdcPrice = configData?.[0];
  const creatorFee = configData?.[2];
  const platformFee = configData?.[3];

  // Calculate fee percentages
  const creatorFeePercent = creatorFee ? Number(creatorFee) / 100 : 0; // Convert basis points to percentage
  const platformFeePercent = platformFee ? Number(platformFee) / 100 : 0;
  const minterFeePercent = 100 - creatorFeePercent - platformFeePercent;

  const selectedDesignStyle = styles?.[0]?.[Number(sock.design.index)] || "";

  const showDesignColor =
    selectedDesignStyle &&
    (selectedDesignStyle.includes("designColor") || selectedDesignStyle.includes("designOutline"));

  const handleAddToBasket = () => {
    if (!isValid || !encodedSock || Boolean(errors)) {
      toast.error("Please fix validation errors before adding to basket");
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
    toast.success("Sock added to basket!");
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

    // --- New logic for base color updates ---
    if (typeof safeUpdates.baseColorIndex !== "undefined") {
      const newBase = safeUpdates.baseColorIndex;
      const colorPalette = generateColorPalette();
      // Heel & Toe: if new base matches, set to transparent
      if (sock.heel.colorIndex === newBase) {
        safeUpdates.heel = { ...sock.heel, colorIndex: 0, index: sock.heel.index };
        toast.success("Updated heel color to transparent to contrast base color");
      }
      if (sock.toe.colorIndex === newBase) {
        safeUpdates.toe = { ...sock.toe, colorIndex: 0, index: sock.toe.index };
        toast.success("Updated toe color to transparent to contrast base color");
      }
      // Design, Outline, Top: if new base matches, increment color index
      if (sock.design.colorIndex === newBase) {
        let next = (newBase + 1) % colorPalette.length;
        if (next === 0) next = 1; // skip transparent
        safeUpdates.design = { ...sock.design, colorIndex: next, index: sock.design.index };
        toast.success("Updated design color to contrast base color");
      }
      if (sock.outlineColorIndex === newBase) {
        let next = (newBase + 1) % colorPalette.length;
        if (next === 0) next = 1;
        safeUpdates.outlineColorIndex = next;
        toast.success("Updated outline color to contrast base color");
      }
      if (sock.top.colorIndex === newBase) {
        let next = (newBase + 1) % colorPalette.length;
        if (next === 0) next = 1;
        safeUpdates.top = { ...sock.top, colorIndex: next, index: sock.top.index };
        toast.success("Updated top color to contrast base color");
      }
    }
    // --- End new logic ---

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

  // Default sock state for reset
  const defaultSock = {
    baseColorIndex: 1,
    outlineColorIndex: 2,
    top: { colorIndex: 0, index: "0" },
    heel: { colorIndex: 0, index: "0" },
    toe: { colorIndex: 0, index: "0" },
    design: { colorIndex: 0, index: "0" },
  };

  const { data: renderSockData } = useReadContracts({
    contracts: [
      {
        ...metadataContract,
        functionName: "renderSock",
        args: [sockForContract, encodedSock || BigInt(0)],
      },
      {
        ...superSocksContract,
        functionName: "creator",
        args: [encodedSock || BigInt(0)],
      },
    ],
  });
  const svgString = renderSockData?.[0]?.result;
  const creator = renderSockData?.[1]?.result;
  const sockExists = creator && creator !== "0x0000000000000000000000000000000000000000";

  const [lastValidSvg, setLastValidSvg] = useState<string | null>(null);

  useEffect(() => {
    if (svgString) {
      setLastValidSvg(svgString);
    }
  }, [svgString]);

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
                href="/checkout"
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
            <ConfigRow
              border={false}
              stylePicker={
                <ColorPicker
                  colors={getFilteredColors("baseColorPicker")}
                  selectedIndex={sock.baseColorIndex}
                  onSelect={index => updateSock({ baseColorIndex: index })}
                  isOpen={openColorPicker === "baseColorPicker"}
                  onToggle={() => toggleColorPicker("baseColorPicker")}
                  pickerType="baseColorPicker"
                  baseColorIndex={sock.baseColorIndex}
                />
              }
              colorPicker={
                <ColorPicker
                  colors={getFilteredColors("outlineColorPicker")}
                  selectedIndex={sock.outlineColorIndex}
                  onSelect={index => updateSock({ outlineColorIndex: index })}
                  isOpen={openColorPicker === "outlineColorPicker"}
                  onToggle={() => toggleColorPicker("outlineColorPicker")}
                  pickerType="outlineColorPicker"
                  baseColorIndex={sock.baseColorIndex}
                />
              }
            />
            <ConfigRow
              label="Design"
              stylePicker={
                <StylePicker
                  styles={styles && Array.isArray(styles[0]) ? [...styles[0]] : []}
                  selectedIndex={Number(sock.design.index)}
                  onSelect={index => updateStyle("design", { index: String(index) })}
                  isOpen={openColorPicker === "designStylePicker"}
                  onToggle={() => toggleColorPicker("designStylePicker")}
                  viewBox="8 6 10 11"
                />
              }
              colorPicker={
                sock.design.index !== "0" &&
                showDesignColor && (
                  <ColorPicker
                    colors={getFilteredColors("designColorPicker")}
                    selectedIndex={sock.design.colorIndex}
                    onSelect={index => updateStyle("design", { colorIndex: index })}
                    isOpen={openColorPicker === "designColorPicker"}
                    onToggle={() => toggleColorPicker("designColorPicker")}
                    pickerType="designColorPicker"
                    baseColorIndex={sock.baseColorIndex}
                  />
                )
              }
            />
            <ConfigRow
              label="Top Style"
              stylePicker={
                <StylePicker
                  styles={styles && styles[3] ? [...styles[3]] : []}
                  selectedIndex={Number(sock.top.index)}
                  onSelect={index => updateStyle("top", { index: String(index) })}
                  isOpen={openColorPicker === "topStylePicker"}
                  onToggle={() => toggleColorPicker("topStylePicker")}
                  viewBox="5 1 15 7"
                />
              }
              colorPicker={
                sock.top.index !== "0" && (
                  <ColorPicker
                    colors={getFilteredColors("topColorPicker")}
                    selectedIndex={sock.top.colorIndex}
                    onSelect={index => updateStyle("top", { colorIndex: index })}
                    isOpen={openColorPicker === "topColorPicker"}
                    onToggle={() => toggleColorPicker("topColorPicker")}
                    pickerType="topColorPicker"
                    baseColorIndex={sock.baseColorIndex}
                  />
                )
              }
            />
            <ConfigRow
              label="Heel Style"
              stylePicker={
                <StylePicker
                  styles={styles && styles[1] ? [...styles[1]] : []}
                  selectedIndex={Number(sock.heel.index)}
                  onSelect={index => updateStyle("heel", { index: String(index) })}
                  isOpen={openColorPicker === "heelStylePicker"}
                  onToggle={() => toggleColorPicker("heelStylePicker")}
                  viewBox="12 14 8 7"
                />
              }
              colorPicker={
                sock.heel.index !== "0" && (
                  <ColorPicker
                    colors={getFilteredColors("heelColorPicker")}
                    selectedIndex={sock.heel.colorIndex}
                    onSelect={index => updateStyle("heel", { colorIndex: index })}
                    isOpen={openColorPicker === "heelColorPicker"}
                    onToggle={() => toggleColorPicker("heelColorPicker")}
                    pickerType="heelColorPicker"
                    baseColorIndex={sock.baseColorIndex}
                  />
                )
              }
            />
            <ConfigRow
              label="Toe Style"
              stylePicker={
                <StylePicker
                  styles={styles && styles[2] ? [...styles[2]] : []}
                  selectedIndex={Number(sock.toe.index)}
                  onSelect={index => updateStyle("toe", { index: String(index) })}
                  isOpen={openColorPicker === "toeStylePicker"}
                  onToggle={() => toggleColorPicker("toeStylePicker")}
                  viewBox="2 15 10 10"
                />
              }
              colorPicker={
                sock.toe.index !== "0" && (
                  <ColorPicker
                    colors={getFilteredColors("toeColorPicker")}
                    selectedIndex={sock.toe.colorIndex}
                    onSelect={index => updateStyle("toe", { colorIndex: index })}
                    isOpen={openColorPicker === "toeColorPicker"}
                    onToggle={() => toggleColorPicker("toeColorPicker")}
                    pickerType="toeColorPicker"
                    baseColorIndex={sock.baseColorIndex}
                  />
                )
              }
            />
            {/* Reset Button */}
            <button
              type="button"
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-300"
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
                {svgString || lastValidSvg ? (
                  <div dangerouslySetInnerHTML={{ __html: svgString || lastValidSvg || "" }} />
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
            {/* Sock Exists Info */}
            {sockExists && (
              <div className="p-2 rounded bg-blue-50 border border-blue-300 text-blue-800 text-sm flex items-center gap-2">
                <span>This sock already exists! Creator:</span>
                <Address address={creator} size="sm" />
              </div>
            )}
            {/* Validation Status */}
            <div
              className={`p-2 rounded text-sm ${isValid || isPending ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
            >
              <strong>Validation Status:</strong> {isPending ? "Loading..." : isValid ? "Valid" : "Invalid"}
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

                {/* Fee Breakdown */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <h4 className="font-medium mb-1">Fee Breakdown:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Sock designer:</span>
                      <span className="text-blue-600">{creatorFeePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supersocks:</span>
                      <span className="text-green-600">{platformFeePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>You get back:</span>
                      <span className="text-purple-600 font-medium">{minterFeePercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
