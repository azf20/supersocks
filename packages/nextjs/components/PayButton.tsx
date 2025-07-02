import React from "react";

export function PayButton({
  onClick,
  loading,
  disabled,
  children,
  error,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full py-2 px-4 rounded font-bold text-white transition-colors
          ${disabled || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
        `}
      >
        {loading ? "Processing..." : children}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
