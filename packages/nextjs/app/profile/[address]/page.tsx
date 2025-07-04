"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SockCard } from "../../../components/SockCard";
import deployedContracts from "../../../contracts/deployedContracts";
import { and, eq, gt, inArray } from "@ponder/client";
import { usePonderQuery } from "@ponder/react";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { schema } from "~~/lib/ponder";
import { useGlobalState } from "~~/services/store/store";
import { chainId } from "~~/utils/supersocks";

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as `0x${string}`;

  // Query for token balances where the address has a positive balance
  const {
    data: tokenBalances,
    isError: balancesError,
    isPending: balancesPending,
  } = usePonderQuery({
    queryFn: db =>
      db
        .select()
        .from(schema.tokenBalance)
        .where(and(eq(schema.tokenBalance.owner, address), gt(schema.tokenBalance.balance, 0n)))
        .orderBy(schema.tokenBalance.balance),
  });

  // Get creator balance from the Socks contract
  const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
    address: deployedContracts[chainId].SuperSocks.address,
    abi: deployedContracts[chainId].SuperSocks.abi,
    functionName: "userBalance",
    args: [address],
    chainId: chainId,
  });

  // Withdraw functionality
  const { writeContractAsync: writeSuperSocksAsync, isPending: isWithdrawPending } = useScaffoldWriteContract({
    contractName: "SuperSocks",
  });

  const handleWithdraw = async () => {
    try {
      await writeSuperSocksAsync({
        functionName: "userWithdraw",
        args: [address],
      });
      // Refetch the balance after successful withdrawal
      refetchUserBalance();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  // Get the token IDs that the user owns
  const ownedTokenIds = tokenBalances?.map(balance => balance.tokenId) || [];

  // Query for token details for all tokens the user owns
  const {
    data: tokens,
    isError: tokensError,
    isPending: tokensPending,
  } = usePonderQuery({
    queryFn: db => db.select().from(schema.token).where(inArray(schema.token.id, ownedTokenIds)),
  });

  // Create a map of token balances for quick lookup
  const balanceMap = new Map();
  if (tokenBalances) {
    tokenBalances.forEach((balance: any) => {
      balanceMap.set(balance.tokenId.toString(), balance.balance);
    });
  }

  // Create a map of token details for quick lookup
  const tokenMap = new Map();
  if (tokens) {
    tokens.forEach((token: any) => {
      tokenMap.set(token.id.toString(), token);
    });
  }

  const isPending = balancesPending || tokensPending;
  const isError = balancesError || tokensError;

  const { basket, addToBasket } = useGlobalState();

  if (isPending) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <div className="text-center">
            <div className="text-xl">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <div className="text-center">
            <div className="text-xl text-red-500">Error loading profile</div>
          </div>
        </div>
      </div>
    );
  }

  const totalSocks = tokenBalances?.reduce((sum, balance) => sum + Number(balance.balance), 0) || 0;
  const uniqueSocks = tokenBalances?.length || 0;

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-6xl">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <Address address={address} onlyEnsOrAddress={true} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalSocks}</div>
                <div className="text-gray-600">Total Socks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{uniqueSocks}</div>
                <div className="text-gray-600">Unique Sock Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {userBalance ? formatUnits(userBalance, 6) : 0} USDC
                </div>
                <div className="text-gray-600">Balance</div>
                {userBalance && userBalance > 0n && (
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawPending}
                    className="mt-2 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    {isWithdrawPending ? "Withdrawing..." : "Withdraw"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sock Collection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sock Collection</h2>
            <Link href="/socks" className="text-blue-500 hover:text-blue-700 font-medium">
              Browse All Socks →
            </Link>
          </div>

          {tokenBalances && tokenBalances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokenBalances.map(balance => {
                const token = tokenMap.get(balance.tokenId.toString());
                let metadata: any = null;
                try {
                  if (token?.metadata) {
                    metadata = JSON.parse(token.metadata);
                  }
                } catch (error) {
                  console.error("Error parsing metadata for sock", balance.tokenId, token?.metadata, error);
                }
                return (
                  <SockCard
                    key={balance.tokenId.toString()}
                    id={balance.tokenId.toString()}
                    metadata={metadata || {}}
                    total={token?.total ? token.total.toString() : ""}
                    creator={token?.creator}
                    basket={basket}
                    addToBasket={addToBasket}
                    showBuyButtons={true}
                    ownedCount={String(balance.balance ?? "0")}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧦</div>
              <p className="text-xl text-gray-500">No socks found</p>
              <p className="text-sm mt-2">This address doesn&apos;t own any socks yet</p>
              <div className="mt-4">
                <Link href="/studio" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4">
                  Create Your First Sock
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}