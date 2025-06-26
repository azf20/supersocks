//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "solady/tokens/ERC20.sol";

/**
 * A smart contract that allows minting SuperSocks with USDC
 * @author azf20
 */
contract FreeRc20 is ERC20 {
    constructor() {
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }

    function name() public pure override returns (string memory) {
        return "FreeRc20";
    }

    function symbol() public pure override returns (string memory) {
        return "FREE";
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}