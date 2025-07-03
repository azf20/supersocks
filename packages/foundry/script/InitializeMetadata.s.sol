// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/Metadata.sol";
import "../contracts/PatternLib.sol";

contract InitializeMetadata is ScaffoldETHDeploy {

    function run(address _metadata) external ScaffoldEthDeployerRunner returns (bool) {
        Metadata metadata = Metadata(_metadata);
        
        // Main patterns (index 0) - keeping original order
        string[] memory mainPatterns = new string[](25);
        mainPatterns[0] = PatternLib.designSmile;
        mainPatterns[1] = PatternLib.designHeart;
        mainPatterns[2] = PatternLib.designFrown;
        mainPatterns[3] = PatternLib.designAcross;
        mainPatterns[4] = PatternLib.designOP;
        mainPatterns[5] = PatternLib.designCircle;
        mainPatterns[6] = PatternLib.designRing;
        mainPatterns[7] = PatternLib.designDog;
        mainPatterns[8] = PatternLib.designBG;
        mainPatterns[9] = PatternLib.designStar;
        mainPatterns[10] = PatternLib.designDiamond;
        mainPatterns[11] = PatternLib.designSun;
        mainPatterns[12] = PatternLib.designMoon;
        mainPatterns[13] = PatternLib.designPaw;
        mainPatterns[14] = PatternLib.designWarrior;
        mainPatterns[15] = PatternLib.designWarrior2;
        mainPatterns[16] = PatternLib.designMagician;
        mainPatterns[17] = PatternLib.designSunGlasses;
        mainPatterns[18] = PatternLib.designLightningBolt;
        mainPatterns[19] = PatternLib.designKey;
        mainPatterns[20] = PatternLib.designNotes;
        mainPatterns[21] = PatternLib.designOctopus;
        mainPatterns[22] = PatternLib.designSquid;
        mainPatterns[23] = PatternLib.designMonster;
        mainPatterns[24] = PatternLib.designDaimo;
        metadata.addStyles(0, mainPatterns);
        
        // Heel patterns (index 1) - keeping original order
        string[] memory heelPatterns = new string[](2);
        heelPatterns[0] = PatternLib.heel;
        heelPatterns[1] = PatternLib.heelBig;
        metadata.addStyles(1, heelPatterns);
        
        // Toe patterns (index 2) - keeping original order
        string[] memory toePatterns = new string[](2);
        toePatterns[0] = PatternLib.toe;
        toePatterns[1] = PatternLib.toeBig;
        metadata.addStyles(2, toePatterns);
        
        // Top patterns (index 3) - keeping original order
        string[] memory topPatterns = new string[](7);
        topPatterns[0] = PatternLib.topOne;
        topPatterns[1] = PatternLib.topTwo;
        topPatterns[2] = PatternLib.topStripeNoOffset;
        topPatterns[3] = PatternLib.topStripeThin;
        topPatterns[4] = PatternLib.topBig;
        topPatterns[5] = PatternLib.topVerticalStripes;
        topPatterns[6] = PatternLib.topVerticalWithHorizontal;
        metadata.addStyles(3, topPatterns);
        
        return true;
    }
}
