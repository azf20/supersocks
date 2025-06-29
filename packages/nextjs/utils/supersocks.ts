import deployedContracts from "../contracts/deployedContracts";

export const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337") as 31337 | 11155111;
export const usdcAddress: `0x${string}` =
  process.env.NEXT_PUBLIC_USDC == "faucet"
    ? deployedContracts[chainId].FreeRc20.address
    : "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

export const superSocksAddress: `0x${string}` = deployedContracts[chainId].SuperSocks.address;
export const metadataAddress: `0x${string}` = deployedContracts[chainId].Metadata.address;