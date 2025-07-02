//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployMetadata } from "./DeployMetadata.s.sol";
import { DeploySuperSocks } from "./DeploySuperSocks.s.sol";
import { DeploySwapper } from "./DeploySwapper.s.sol";
import { DeployFreeRc20 } from "./DeployFreerc20.s.sol";
import { InitializeMetadata } from "./InitializeMetadata.s.sol";
/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {


    mapping(uint256 => address) public usdcAddresses;
    bool faucet = true;

    function run() external {
        // Deploys all your contracts sequentially
        usdcAddresses[10] = 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85;
        usdcAddresses[31337] = 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85; // assume running an OP mainnet fork
        usdcAddresses[11155111] = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

        // Add new deployments here when needed
        address usdc = usdcAddresses[block.chainid];
        
        if (faucet) {
            require(block.chainid != 10, "Don't deploy faucet configuration on Optimism Mainnet");

            DeployFreeRc20 deployFreeRc20 = new DeployFreeRc20();
            usdc = deployFreeRc20.run();
        }

        DeployMetadata deployMetadata = new DeployMetadata();
        address metadata = deployMetadata.run();

        DeploySuperSocks deploySuperSocks = new DeploySuperSocks();
        address payable superSocks = deploySuperSocks.run(metadata, usdc);

        DeploySwapper deploySwapper = new DeploySwapper();
        deploySwapper.run(usdc, superSocks);

        InitializeMetadata initializeMetadata = new InitializeMetadata();
        initializeMetadata.run(metadata);
    }
}
