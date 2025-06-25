//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployMetadata } from "./DeployMetadata.s.sol";
import { DeploySuperSocks } from "./DeploySuperSocks.s.sol";
import { DeploySwapper } from "./DeploySwapper.s.sol";
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

        DeployMetadata deployMetadata = new DeployMetadata();
        address metadata = deployMetadata.run();

        DeploySuperSocks deploySuperSocks = new DeploySuperSocks();
        address payable superSocks = deploySuperSocks.run(metadata, 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85);

        DeploySwapper deploySwapper = new DeploySwapper();
        deploySwapper.run(0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85, superSocks);

        // Deploy another contract
        // DeployMyContract myContract = new DeployMyContract();
        // myContract.run();
    }
}
