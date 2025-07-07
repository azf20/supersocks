import deployedContracts from "../../../contracts/deployedContracts";
import { chainId } from "../../../utils/supersocks";
import { decodeBase64SVG } from "../../../utils/svg";
import { Metadata } from "next";
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

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;

  if (!id) {
    return {
      title: "Sock Not Found",
      description: "The requested sock could not be found.",
    };
  }

  try {
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
    }

    // Get creator information
    const superSocksContract = deployedContracts[chainId].SuperSocks;
    const creator = await publicClient.readContract({
      address: superSocksContract.address as `0x${string}`,
      abi: superSocksContract.abi,
      functionName: "creator",
      args: [BigInt(id)],
    });

    const title = metadata?.name || `SuperSock #${id}`;
    const description = `${metadata?.description} created by ${creator} | Supersocks`;

    // Generate OpenGraph image from SVG if available
    let openGraphImage = undefined;
    if (metadata?.image) {
      try {
        // Decode the base64 SVG using the utility function
        const decodedSVG = decodeBase64SVG(metadata.image);
        if (decodedSVG) {
          // Convert the decoded SVG to a data URI for OpenGraph
          const base64 = Buffer.from(decodedSVG).toString("base64");
          openGraphImage = `data:image/svg+xml;base64,${base64}`;
        }
      } catch (error) {
        console.error("Error processing image for OpenGraph:", error);
      }
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: openGraphImage ? [{ url: openGraphImage, width: 1200, height: 630 }] : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: openGraphImage ? [openGraphImage] : undefined,
      },
      other: {
        creator: creator as string,
        "sock-id": id,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: `SuperSock #${id}`,
      description: "A unique SuperSock from the collection",
    };
  }
}

export default async function SockLayout({ children }: LayoutProps) {
  return children;
}