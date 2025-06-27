import deployedContracts from "../contracts/deployedContracts";

export const usdcAddress: `0x${string}` =
  process.env.NEXT_PUBLIC_USDC == "faucet"
    ? deployedContracts[31337].FreeRc20.address
    : "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
