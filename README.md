# Super Socks

> This is currently in an early stage of development

## Onchain SVG Socks

- Create custom socks!
- Base sock with ability to add flexible designs

TODO:
- Robustness
- More designs
- Move to 1155 - DONE
- Clean "customise" page
- Explore page
- Holdings page
- Give "creators" a share of the minting proceeds for socks they create - DONE
- Add Uniswap swapping for USDC - DONE
- Add Ponder indexer - DONE
- Add "Basket" flow - DONE

MINTING FLOWS:
- Basic (approve then swap)
- 5792 (approve + swap in one tx)
- From ETH
    - Swap from ETH then buy
    - Intermediary contract
    - Swap from ETH then buy in one tx via 5792
- From other chains
    - Send to bridge
    - Approve then bridge then buy
    - Approve then bridge + call to buy
- Daimo pay

## Running locally
```
yarn install

# Run the chain
yarn chain

# Deploy the contracts
yarn compile
yarn deploy

# Run the Ponder indexer
cd packages/supersocks-api
yarn dev

# Start the app
yarn start
```