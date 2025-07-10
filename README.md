# Super Socks

Super Socks is a full-stack onchain NFT platform for creating, collecting, and remixing generative SVG socks. The project is organized as a monorepo with three main packages:

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
    - Swap from ETH then buy
    - Intermediary contract - DONE
    - Swap from ETH then buy in one tx via 5792
- Across with USDC - DONE
- Daimo pay - DONE
- Biconomy - BLOCKED

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