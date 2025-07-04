//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./Renderer.sol";
import "solady/utils/Base64.sol";
import "solady/utils/LibString.sol";
import "solady/auth/Ownable.sol";

/**
 * @title Metadata
 * @notice Contract for managing SuperSocks metadata and token URIs
 * @dev Inherits from Renderer to access sock rendering functionality
 * @dev Manages style patterns and generates on-chain metadata for NFTs
 */
contract Metadata is Renderer, Ownable {

    /**
     * @notice Constructor initializes the contract with empty style patterns
     * @dev Sets up initial empty styles for design, heel, toe, and top patterns
     * @dev Initializes ownership for the contract
     */
    constructor() {
        _initializeOwner(msg.sender);
        
        // Design patterns (index 0)
        _addStyle(0, ''); // Empty design

        // Heel patterns (index 1)
        _addStyle(1, ''); // Empty heel
        
        // Toe patterns (index 2)
        _addStyle(2, ''); // Empty toe
        
        // Top patterns (index 3)
        _addStyle(3, ''); // Empty top
    }

    /**
     * @notice Adds multiple styles to a specific style category
     * @param index The style category index (0=design, 1=heel, 2=toe, 3=top)
     * @param styles Array of SVG style strings to add
     * @dev Only callable by the contract owner
     * @dev Appends styles to the existing style array for the given category
     */
    function addStyles(uint8 index, string[] memory styles) public onlyOwner {
        for (uint256 i = 0; i < styles.length; i++) {
            _addStyle(index, styles[i]);
        }
    }

    /**
     * @notice Updates an existing style at a specific index
     * @param index The style category index (0=design, 1=heel, 2=toe, 3=top)
     * @param styleIndex The index of the style to update within the category
     * @param style The new SVG style string
     * @dev Only callable by the contract owner
     * @dev Replaces the existing style at the specified index
     */
    function updateStyle(uint8 index, uint8 styleIndex, string memory style) public onlyOwner {
        _updateStyle(index, styleIndex, style);
    }

    /**
     * @notice Returns the Uniform Resource Identifier (URI) for a given token ID
     * @param id The token ID to generate metadata for
     * @return The complete token URI as a base64-encoded data URI
     * @dev Generates on-chain metadata including name, description, attributes, and SVG image
     * @dev The returned URI contains all metadata needed for NFT marketplaces
     */
    function tokenURI(uint256 id) public view returns (string memory) {
        
        // Get SVG from renderer
        string memory _svg = render(id);
        string memory _traits = getTraits(id);
        
        string memory json = string(abi.encodePacked(
            '{"name": "#',
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
