"use client";

import { useState } from "react";
import deployedContracts from "../contracts/deployedContracts";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";

const Home: NextPage = () => {
  const [sock, setSock] = useState({
    baseColorIndex: 0,
    top: { offset: 0, stripes: 1, thickness: 1, gap: 0, colorIndex: 1 },
    heel: { colorIndex: 1, index: BigInt(1) },
    toe: { colorIndex: 0, index: BigInt(0) },
    design: { colorIndex: 1, index: BigInt(2) },
  });

  const account = useAccount();

  const { data } = useReadContracts({
    contracts: [
      {
        address: deployedContracts[31337].Metadata.address,
        abi: deployedContracts[31337].Metadata.abi,
        functionName: "renderSock",
        args: [sock, BigInt(2)],
      },
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
        args: [sock, BigInt(0)],
      },
      {
        address: deployedContracts[31337].SuperSocks.address,
        abi: deployedContracts[31337].SuperSocks.abi,
        functionName: "ethPrice",
      },
    ],
  });

  const svgString = data?.[0]?.result;
  const checkResult = data?.[1]?.result;
  const isValid = checkResult?.[0];
  const errors = checkResult?.[1];
  const encodedSock = data?.[2]?.result;

  const { writeContract, status, error } = useWriteContract();

  const mintSock = () => {
    writeContract({
      address: deployedContracts[31337].SuperSocks.address,
      abi: deployedContracts[31337].SuperSocks.abi,
      functionName: "mintWithEth",
      args: [account.address!, encodedSock!],
      value: data?.[3]?.result,
    });
  };

  console.log("SVG string:", svgString);
  console.log("Is valid:", isValid);
  console.log("Errors:", errors);

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

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sock Configuration Panel */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Sock Configuration</h2>

              {/* Base Color */}
              <div>
                <ColorPicker
                  selectedIndex={sock.baseColorIndex}
                  onColorSelect={index => updateSock({ baseColorIndex: index })}
                  label="Base Color"
                />
              </div>

              {/* Top Configuration */}
              <div className="border p-4 rounded">
                <h3 className="font-semibold mb-3">Top Stripes</h3>

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
                      min="0"
                      max="7"
                      value={sock.top.thickness}
                      onChange={e => updateTop({ thickness: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Gap: {sock.top.gap}</label>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={sock.top.gap}
                      onChange={e => updateTop({ gap: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {sock.top.stripes > 0 && (
                    <div>
                      <ColorPicker
                        selectedIndex={sock.top.colorIndex}
                        onColorSelect={index => updateTop({ colorIndex: index })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Heel Configuration */}
              <div className="border p-4 rounded">
                <h3 className="font-semibold mb-3">Heel</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Style:{" "}
                      {Number(sock.heel.index) === 0 ? "None" : Number(sock.heel.index) === 1 ? "Small" : "Large"}
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
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Toe Configuration */}
              <div className="border p-4 rounded">
                <h3 className="font-semibold mb-3">Toe</h3>
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
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Design Configuration */}
              <div className="border p-4 rounded">
                <h3 className="font-semibold mb-3">Design</h3>
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
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sock Preview Panel */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Sock Preview</h2>

              {svgString && (
                <div className="flex justify-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: svgString }}
                    className="border border-gray-300 rounded-lg p-4 bg-white"
                  />
                </div>
              )}

              {/* Validation Status */}
              <div
                className={`p-4 rounded ${isValid ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
              >
                <strong>Validation Status:</strong> {isValid ? "Valid" : "Invalid"}
                {errors && (
                  <div className="mt-2">
                    <strong>Errors:</strong>
                    <p className="text-sm mt-1">{errors}</p>
                  </div>
                )}
              </div>

              {/* Mint Button */}
              <div className="p-4 border rounded">
                <button
                  onClick={mintSock}
                  disabled={!isValid || !account.address || !encodedSock || Boolean(errors)}
                  className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {!account.address
                    ? "Connect Wallet to Mint"
                    : !isValid || Boolean(errors)
                      ? "Fix Validation Errors"
                      : !encodedSock
                        ? "Loading..."
                        : `Mint Sock (${data?.[3]?.result ? `${formatEther(data[3].result)} ETH` : "0 ETH"})`}
                </button>
              </div>

              {status === "pending" && (
                <div className="p-4 border rounded bg-yellow-100 border-yellow-400 text-yellow-700">
                  <p>Transaction pending...</p>
                </div>
              )}

              {status === "success" && (
                <div className="p-4 border rounded bg-green-100 border-green-400 text-green-700">
                  <p>Transaction successful!</p>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 border rounded bg-red-100 border-red-400 text-red-700">
                  <p>Transaction failed: {error?.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;