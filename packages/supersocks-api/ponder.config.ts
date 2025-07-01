import { config } from "dotenv";
config();

import { createConfig } from "ponder";
import { getAddress, hexToNumber } from "viem";
import { erc1155ABI } from "./abis/erc1155Abi";

const chainId = process.env.CHAIN_ID === "11155111" ? 11155111 : 31337;

import SepoliaSuperSocksDeploy from "../foundry/broadcast/Deploy.s.sol/11155111/run-latest.json";

const SuperSocksDeploy =
  chainId === 11155111
    ? SepoliaSuperSocksDeploy
    : require("../foundry/broadcast/Deploy.s.sol/31337/run-latest.json");

const contractIndex = process.env.USDC === "faucet" ? 2 : 1;
const address = getAddress(
  SuperSocksDeploy.transactions[contractIndex]!.contractAddress
);
const startBlock = hexToNumber(
  SuperSocksDeploy.receipts[1]!.blockNumber as `0x${string}`
);

export default createConfig({
  chains: {
    anvil: {
      id: 31337,
      rpc: process.env.PONDER_RPC_URL_1,
      disableCache: true,
    },
    sepolia: {
      id: 11155111,
      rpc: process.env.PONDER_RPC_URL_2,
      disableCache: true,
    },
  },
  contracts: {
    ERC1155: {
      chain: chainId === 11155111 ? "sepolia" : "anvil",
      abi: erc1155ABI,
      address: address,
      startBlock: startBlock,
    },
  },
});
