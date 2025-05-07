//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployMetadata } from "./DeployMetadata.s.sol";
import { DeploySuperSocks } from "./DeploySuperSocks.s.sol";
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
        deploySuperSocks.run(metadata, metadata);

        // Deploy another contract
        // DeployMyContract myContract = new DeployMyContract();
        // myContract.run();
    }
}
