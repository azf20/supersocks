import React, { useEffect, useRef } from "react";

interface StylePickerProps {
  styles: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  viewBox: string;
}

export const StylePicker = ({ styles, selectedIndex, onSelect, isOpen, onToggle, viewBox }: StylePickerProps) => {
  const selectedStyle = styles[selectedIndex] || "";
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

  // Generate SVG preview for a style
  const generateStylePreview = (style: string) => {
    if (!style) return "";

    const baseColor = "#000000"; // Default color, will be overridden by CSS
    const designColor = "#000000"; // Always use black for design color

    return `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"${viewBox}\">\n        <defs>\n          <style>\n            .baseColor { fill: ${baseColor}; }\n            .designColor { fill: ${designColor}; fill-rule: evenodd; }\n            .designOutline { stroke: ${designColor}; fill: none; }\n          </style>\n        </defs>\n        <rect x=\"${viewBox.split(" ")[0]}\" y=\"${viewBox.split(" ")[1]}\" width=\"${viewBox.split(" ")[2]}\" height=\"${viewBox.split(" ")[3]}\" fill=\"transparent\"/>\n        ${style}\n      </svg>`;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300 bg-gray-100 flex items-center justify-center"
          dangerouslySetInnerHTML={{
            __html: generateStylePreview(selectedStyle),
          }}
        />
        <span className="text-sm">{selectedIndex === 0 ? "No Style" : `Style ${selectedIndex}`}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto min-w-[240px]">
          <div className="p-3 flex flex-col gap-y-2">
            {/* Split styles into rows of 4 */}
            {Array.from({ length: Math.ceil(styles.length / 4) }).map((_, rowIdx) => {
              const row = styles.slice(rowIdx * 4, rowIdx * 4 + 4);
              return (
                <div key={rowIdx} className="grid grid-cols-4 gap-2">
                  {row.map((style, index) => {
                    const styleIdx = rowIdx * 4 + index;
                    return (
                      <button
                        key={styleIdx}
                        onClick={() => {
                          onSelect(styleIdx);
                          onToggle();
                        }}
                        className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 bg-gray-100 flex items-center justify-center ${
                          selectedIndex === styleIdx ? "border-blue-500" : "border-gray-300"
                        }`}
                        title={styleIdx === 0 ? "No Style" : `Style ${styleIdx}`}
                      >
                        <div
                          className="w-8 h-8"
                          dangerouslySetInnerHTML={{
                            __html: generateStylePreview(style),
                          }}
                        />
                      </button>
                    );
                  })}
                  {/* Pad row with empty cells if needed */}
                  {row.length < 4 &&
                    Array.from({ length: 4 - row.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-12 h-12" />
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
