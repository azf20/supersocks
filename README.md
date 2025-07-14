# Super Socks

Super Socks is a full-stack NFT platform for creating, remixing and buying onchain SVG socks, built as part of the [EIP-7702 UX & Developer Tooling Mission](https://github.com/ethereum-optimism/ecosystem-contributions/issues/274) from the Optimism Foundation.

Read more about the background to Supersocks [here](https://www.azfuller.com/blog/supersocks), and see [here](https://github.com/azf20/7702-mission/tree/main) for more on this OP Mission.

The project is organized as a monorepo with three main packages:

## Packages

- **contracts**: Solidity smart contracts for the SuperSocks protocol, including ERC-1155 minting, fee logic, metadata, SVG rendering, and onchain swapper utilities.
- **nextjs**: The Next.js frontend app, featuring the sock studio, collection explorer, checkout, and profile pages. Integrates with the contracts for minting, buying, and remixing socks.
- **supersocks-api**: The Ponder-based indexer and API, indexing onchain events and exposing sock, holder, and transaction data to the frontend.

> This is in development

## Onchain SVG Socks

- Create custom socks!
- Base sock with ability to add flexible designs

TODO:
- Robustness - DONE
- More designs! Maybe make the socks look nicer? - DONE
- Move to 1155 - DONE
- Clean "studio" page - DONE
- Explore page - DONE
- Profile page - DONE
- Give "creators" a share of the minting proceeds for socks they create - DONE
- Add Uniswap swapping for USDC - DONE
- Add Ponder indexer - DONE
- Add "Basket" flow - DONE
- Enable withdraw creator balance - DONE
- Add meaning to the attributes on the sock pages - DONE
- "Fork" existing socks - DONE

MINTING FLOWS:
- Basic (approve then swap) - DONE
- 5792 (approve + swap in one tx) - DONE
- From ETH - DONE
- Across with USDC - DONE
- Daimo pay - DONE

## Running locally
```
yarn install

# Run the chain
yarn fork

# Deploy the contracts
yarn compile
yarn deploy

# Run the Ponder indexer
cd packages/supersocks-api
yarn dev

# Start the app
yarn start
```