//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Renderer.sol";
import "solady/utils/Base64.sol";
import "solady/utils/LibString.sol";
import "solady/auth/Ownable.sol";

contract Metadata is Renderer, Ownable {

    constructor() {
        _initializeOwner(msg.sender);
        
        // Design patterns (index 0)
        _addStyle(0, ''); // Empty design

        // Heel patterns (index 0)
        _addStyle(1, ''); // Empty heel
        
        // Toe patterns (index 2)
        _addStyle(2, ''); // Empty toe
        
        // Top patterns (index 3)
        _addStyle(3, ''); // Empty top
    }

    function addStyles(uint8 index, string[] memory styles) public onlyOwner {
        for (uint256 i = 0; i < styles.length; i++) {
            _addStyle(index, styles[i]);
        }
    }

    function updateStyle(uint8 index, uint8 styleIndex, string memory style) public onlyOwner {
        _updateStyle(index, styleIndex, style);
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
