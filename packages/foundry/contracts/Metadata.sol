//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Renderer.sol";
import "./PatternLib.sol";
import "../lib/solady/src/utils/Base64.sol";
import "../lib/solady/src/utils/LibString.sol";

contract Metadata is Renderer {

    constructor() {
        designs.push('');
        designs.push(PatternLib.optimism);
        designs.push(PatternLib.base);
        designs.push(PatternLib.across);
        designs.push(PatternLib.unisock);
    }

    /// @dev Returns the Uniform Resource Identifier (URI) for token `id`.
    function tokenURI(uint256 id) public view returns (string memory) {
        
        // Get SVG from renderer
        string memory _svg = render(id);
        
        string memory json = string(abi.encodePacked(
            '{"name": "SuperSocks #',
            LibString.toString(id),
            '","description": "A unique Sock from the SuperSocks collection",',
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
