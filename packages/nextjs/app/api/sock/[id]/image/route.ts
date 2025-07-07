import { NextRequest, NextResponse } from "next/server";
import deployedContracts from "../../../../../contracts/deployedContracts";
import { chainId } from "../../../../../utils/supersocks";
import { decodeBase64SVG } from "../../../../../utils/svg";
import { createPublicClient, http } from "viem";
import { optimism, sepolia } from "viem/chains";

// Create public client for server-side contract calls
const getPublicClient = () => {
  const chains = [optimism, sepolia];
  const targetChain = chains.find(chain => chain.id === chainId);

  if (!targetChain) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }

  return createPublicClient({
    chain: targetChain,
    transport: http(),
  });
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse("Sock ID required", { status: 400 });
    }

    const publicClient = getPublicClient();
    const metadataContract = deployedContracts[chainId].Metadata;

    // Call tokenURI on the metadata contract
    const tokenURI = await publicClient.readContract({
      address: metadataContract.address as `0x${string}`,
      abi: metadataContract.abi,
      functionName: "tokenURI",
      args: [BigInt(id)],
    });

    // Parse the base64 encoded metadata from data URI
    let metadata: any = null;
    try {
      if (tokenURI && typeof tokenURI === "string") {
        // Extract base64 part from data URI: "data:application/json;base64,<base64-data>"
        const base64Data = tokenURI.replace("data:application/json;base64,", "");
        const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
        metadata = JSON.parse(decoded);
      }
    } catch (error) {
      console.error("Error parsing metadata:", error);
      return new NextResponse("Error parsing metadata", { status: 500 });
    }

    if (!metadata?.image) {
      return new NextResponse("No image found", { status: 404 });
    }

    // Decode the SVG
    const decodedSVG = decodeBase64SVG(metadata.image);
    if (!decodedSVG) {
      return new NextResponse("Error decoding SVG", { status: 500 });
    }

    // Return the SVG with proper headers
    return new NextResponse(decodedSVG, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving sock image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
