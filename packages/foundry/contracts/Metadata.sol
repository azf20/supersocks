//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Renderer.sol";
import "./PatternLib.sol";
import "../lib/solady/src/utils/Base64.sol";
import "../lib/solady/src/utils/LibString.sol";

contract Metadata is Renderer {

    constructor() {
                // Design patterns (index 0)
        addStyle(0, ''); // Empty design
        addStyle(0, PatternLib.designSmile);
        addStyle(0, PatternLib.designHeart);
        addStyle(0, PatternLib.designFrown);
        addStyle(0, PatternLib.designAcross);
        addStyle(0, PatternLib.designOP);
        addStyle(0, PatternLib.designCircle);
        addStyle(0, PatternLib.designRing);
        addStyle(0, PatternLib.designDog);
        
        // Heel patterns (index 1)
        addStyle(1, ''); // Empty heel
        addStyle(1, PatternLib.heel);
        addStyle(1, PatternLib.heelBig);
        
        // Toe patterns (index 2)
        addStyle(2, ''); // Empty toe
        addStyle(2, PatternLib.toe);
        addStyle(2, PatternLib.toeBig);
        
        // Top patterns (index 3)
        addStyle(3, ''); // Empty top
        addStyle(3, PatternLib.topOne);
        addStyle(3, PatternLib.topTwo);
        addStyle(3, PatternLib.topStripeNoOffset);
        addStyle(3, PatternLib.topStripeThin);
        addStyle(3, PatternLib.topBig);
        addStyle(3, PatternLib.topVerticalStripes);
        addStyle(3, PatternLib.topVerticalWithHorizontal);
    }

    /// @dev Returns the Uniform Resource Identifier (URI) for token `id`.
    function tokenURI(uint256 id) public view returns (string memory) {
        
        // Get SVG from renderer
        string memory _svg = render(id);
        string memory _traits = getTraits(id);
        
        string memory json = string(abi.encodePacked(
            '{"name": "SuperSocks #',
            LibString.toString(id),
            '","description": "A unique Sock from the SuperSocks collection",',
            '"attributes":[', _traits, '],',
            '"image": "data:image/svg+xml;base64,',
            Base64.encode(bytes(_svg)),
            '"}'
        ));
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    
}
