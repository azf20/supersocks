import React, { useEffect, useRef } from "react";


interface Color {
  name: string;
  value: string;
  index: number;
}

interface ColorPickerProps {
  colors: Color[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  pickerType: string;
  baseColorIndex?: number;
}

// Organize colors into rows: transparent on its own row, then rows of 8
const organizeColorsIntoRows = (colors: Color[]) => {
  const rows = [];

  // Transparent on its own row
  const transparent = colors.find(c => c.index === 0);
  if (transparent) {
    rows.push([transparent]);
  }

  // Other colors in rows of 8
  const nonTransparentColors = colors.filter(c => c.index !== 0);
  for (let i = 0; i < nonTransparentColors.length; i += 8) {
    rows.push(nonTransparentColors.slice(i, i + 8));
  }

  return rows;
};

// Check if a color is selectable for a given picker type
const isColorSelectable = (colorIndex: number, pickerType: string, baseColorIndex?: number) => {
  // Transparent is not selectable for base, outline, design, top
  if (
    colorIndex === 0 &&
    ["baseColorPicker", "outlineColorPicker", "designColorPicker", "topColorPicker"].includes(pickerType)
  ) {
    return false;
  }

  // Base color is not selectable for outline, design, top, heel, toe
  if (
    baseColorIndex !== undefined &&
    colorIndex === baseColorIndex &&
    ["outlineColorPicker", "designColorPicker", "topColorPicker", "heelColorPicker", "toeColorPicker"].includes(
      pickerType,
    )
  ) {
    return false;
  }

  return true;
};

export const ColorPicker = ({
  colors,
  selectedIndex,
  onSelect,
  isOpen,
  onToggle,
  pickerType,
  baseColorIndex,
}: ColorPickerProps) => {
  const selectedColor = colors.find(c => c.index === selectedIndex);
  const colorRows = organizeColorsIntoRows(colors);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{
            backgroundColor: selectedColor?.value === "#FF000000" ? "transparent" : selectedColor?.value,
            backgroundImage:
              selectedColor?.value === "#FF000000"
                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                : "none",
            backgroundSize: selectedColor?.value === "#FF000000" ? "8px 8px" : "auto",
            backgroundPosition: selectedColor?.value === "#FF000000" ? "0 0, 0 4px, 4px -4px, -4px 0px" : "auto",
          }}
        />
        <span className="text-sm">{selectedColor?.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto w-72 sm:w-80 sm:max-w-none sm:absolute sm:left-0 sm:right-auto fixed left-1/2 -translate-x-1/2 w-full max-w-xs sm:translate-x-0">
          <div className="p-3">
            {colorRows.map((row: Color[], rowIndex: number) => (
              <div
                key={rowIndex}
                className={`grid gap-2 ${row.length === 1 ? "grid-cols-1" : "grid-cols-8"} ${rowIndex > 0 ? "mt-2" : ""}`}
              >
                {row.map((color: Color) => {
                  const isSelectable = isColorSelectable(color.index, pickerType, baseColorIndex);
                  return (
                    <button
                      key={color.index}
                      onClick={() => {
                        if (isSelectable) {
                          onSelect(color.index);
                          onToggle();
                        }
                      }}
                      disabled={!isSelectable}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 relative ${
                        selectedIndex === color.index ? "border-blue-500" : "border-gray-300"
                      } ${!isSelectable ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
                      style={{
                        backgroundColor: color.value === "#FF000000" ? "transparent" : color.value,
                        backgroundImage:
                          color.value === "#FF000000"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                            : "none",
                        backgroundSize: color.value === "#FF000000" ? "4px 4px" : "auto",
                        backgroundPosition: color.value === "#FF000000" ? "0 0, 0 2px, 2px -2px, -2px 0px" : "auto",
                      }}
                      title={color.name}
                    >
                      {!isSelectable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};