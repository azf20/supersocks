//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployMetadata } from "./DeployMetadata.s.sol";
import { DeploySuperSocks } from "./DeploySuperSocks.s.sol";
import { DeploySwapper } from "./DeploySwapper.s.sol";
import { DeployFreeRc20 } from "./DeployFreerc20.s.sol";
/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed
        address usdc = 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85;
        if (block.chainid == 31337 || block.chainid == 11155111) {
            DeployFreeRc20 deployFreeRc20 = new DeployFreeRc20();
            usdc = deployFreeRc20.run();
        }

        DeployMetadata deployMetadata = new DeployMetadata();
        address metadata = deployMetadata.run();

        DeploySuperSocks deploySuperSocks = new DeploySuperSocks();
        address payable superSocks = deploySuperSocks.run(metadata, usdc);

        DeploySwapper deploySwapper = new DeploySwapper();
        deploySwapper.run(usdc, superSocks);

        // Deploy another contract
        // DeployMyContract myContract = new DeployMyContract();
        // myContract.run();
    }
}
