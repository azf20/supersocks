import React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { chainId as configuredChainId } from "~~/utils/supersocks";

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
  const { chainId: connectedChainId, isConnected } = useAccount();
  const { switchChain, chains } = useSwitchChain();

  // Prevent flickering by waiting for data to load
  if (!isConnected || connectedChainId === undefined || configuredChainId === undefined) {
    return (
      <div>
        <button disabled className="w-full py-2 px-4 rounded font-bold text-white bg-gray-400 cursor-not-allowed">
          Loading...
        </button>
      </div>
    );
  }

  const isWrongNetwork = connectedChainId !== configuredChainId;

  const chainName = chains?.find(chain => chain.id === configuredChainId)?.name;

  const handleSwitchChain = () => {
    switchChain({ chainId: configuredChainId });
  };

  if (isWrongNetwork) {
    return (
      <div>
        <button
          onClick={handleSwitchChain}
          className="w-full py-2 px-4 rounded font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
        >
          Switch to {chainName}
        </button>
        <div className="text-orange-600 text-sm mt-2">{`Please switch to ${chainName} to continue`}</div>
      </div>
    );
  }

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