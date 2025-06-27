//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Renderer.sol";
import "./PatternLib.sol";
import "../lib/solady/src/utils/Base64.sol";
import "../lib/solady/src/utils/LibString.sol";

contract Metadata is Renderer {

    constructor() {
                // Design patterns (index 0)
        _addStyle(0, ''); // Empty design
        _addStyle(0, PatternLib.designSmile);
        _addStyle(0, PatternLib.designHeart);
        _addStyle(0, PatternLib.designFrown);
        _addStyle(0, PatternLib.designAcross);
        _addStyle(0, PatternLib.designOP);
        _addStyle(0, PatternLib.designCircle);
        _addStyle(0, PatternLib.designRing);
        _addStyle(0, PatternLib.designDog);
        _addStyle(0, PatternLib.designBG);
        
        // Heel patterns (index 1)
        _addStyle(1, ''); // Empty heel
        _addStyle(1, PatternLib.heel);
        _addStyle(1, PatternLib.heelBig);
        
        // Toe patterns (index 2)
        _addStyle(2, ''); // Empty toe
        _addStyle(2, PatternLib.toe);
        _addStyle(2, PatternLib.toeBig);
        
        // Top patterns (index 3)
        _addStyle(3, ''); // Empty top
        _addStyle(3, PatternLib.topOne);
        _addStyle(3, PatternLib.topTwo);
        _addStyle(3, PatternLib.topStripeNoOffset);
        _addStyle(3, PatternLib.topStripeThin);
        _addStyle(3, PatternLib.topBig);
        _addStyle(3, PatternLib.topVerticalStripes);
        _addStyle(3, PatternLib.topVerticalWithHorizontal);
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
