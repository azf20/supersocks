import { config } from "dotenv";
config();

import { createConfig } from "ponder";
import { getAddress, hexToNumber } from "viem";
import { erc1155ABI } from "./abis/erc1155Abi";

const chainId =
  process.env.CHAIN_ID === "11155111"
    ? 11155111
    : process.env.CHAIN_ID === "10"
    ? 10
    : 31337;

import SepoliaSuperSocksDeploy from "../foundry/broadcast/Deploy.s.sol/11155111/run-latest.json";
import OptimismSuperSocksDeploy from "../foundry/broadcast/Deploy.s.sol/10/run-latest.json";

const SuperSocksDeploy =
  chainId === 11155111
    ? SepoliaSuperSocksDeploy
    : chainId === 10
    ? OptimismSuperSocksDeploy
    : require("../foundry/broadcast/Deploy.s.sol/31337/run-latest.json");

const contractIndex = process.env.USDC === "faucet" ? 2 : 1;
const address = getAddress(
  SuperSocksDeploy.transactions[contractIndex]!.contractAddress
);
const startBlock = hexToNumber(
  SuperSocksDeploy.receipts[1]!.blockNumber as `0x${string}`
);

const anvil = {
  id: 31337,
  rpc: process.env.PONDER_RPC_URL_1,
  disableCache: true,
};

const sepolia = {
  id: 11155111,
  rpc: process.env.PONDER_RPC_URL_11155111,
  disableCache: true,
};

const optimism = {
  id: 10,
  rpc: process.env.PONDER_RPC_URL_10,
  disableCache: true,
};

const chains: Record<string, any> = {};

if (chainId === 11155111) {
  chains.sepolia = sepolia;
} else if (chainId === 10) {
  chains.optimism = optimism;
} else {
  chains.anvil = anvil;
}

export default createConfig({
  chains,
  contracts: {
    ERC1155: {
      chain:
        chainId === 11155111
          ? "sepolia"
          : chainId === 10
          ? "optimism"
          : "anvil",
      abi: erc1155ABI,
      address: address,
      startBlock: startBlock,
    },
  },
});
