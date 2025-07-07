import deployedContracts from "../contracts/deployedContracts";
import externalContracts from "../contracts/externalContracts";

export const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337") as 31337 | 11155111 | 10;
export const usdcAddress: `0x${string}` =
  process.env.NEXT_PUBLIC_USDC == "faucet" && chainId !== 10
    ? deployedContracts[chainId].FreeRc20.address
    : externalContracts[chainId].USDC.address;

export const superSocksAddress: `0x${string}` = deployedContracts[chainId].SuperSocks.address;
export const metadataAddress: `0x${string}` = deployedContracts[chainId].Metadata.address;