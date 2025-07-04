//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './svg/SVG.sol';
import './svg/Utils.sol';

/**
 * @title Renderer
 * @notice Contract for rendering SuperSocks as SVG images and managing sock configurations
 * @dev Handles sock encoding/decoding, validation, and SVG generation
 * @dev Manages color palette and style patterns for sock customization
 */
contract Renderer {

    // Color storage - efficient constant string approach
    string public constant COLORS = '------F1F5F9E2E8F0CBD5E194A3B864748B4755693341551E293BF5F5F4E7E5E4D6D3D1A8A29E78716C57534E44403C292524FEE2E2FECACAFCA5A5F87171EF4444DC2626B91C1C991B1BFFEDD5FED7AAFDBA74FB923CF97316EA580CC2410C9A3412FEF3C7FDE68AFCD34DFBBF24F59E0BD97706B4530992400EFEF9C3FEF08AFDE047FACC15EAB308CA8A04A16207854D0EECFCCBD9F99DBEF264A3E63584CC1665A30D4D7C0F3F6212DCFCE7BBF7D086EFAC4ADE8022C55E16A34A15803D166534D1FAE5A7F3D06EE7B734D39910B981059669047857065F46CCFBF199F6E45EEAD42DD4BF14B8A60D94880F766E115E59CFFAFEA5F3FC67E8F922D3EE06B6D40891B20E7490155E75E0F2FEBAE6FD7DD3FC38BDF80EA5E90284C70369A1075985DBEAFEBFDBFE93C5FD60A5FA3B82F62563EB1D4ED81E40AFE0E7FFC7D2FEA5B4FC818CF86366F14F46E54338CA3730A3EDE9FEDDD6FEC4B5FDA78BFA8B5CF67C3AED6D28D95B21B6F3E8FFE9D5FFD8B4FEC084FCA855F79333EA7E22CE6B21A8FAE8FFF5D0FEF0ABFCE879F9D946EFC026D3A21CAF86198FFCE7F3FBCFE8F9A8D4F472B6EC4899DB2777BE185D9D174DFFE4E6FECDD3FDA4AFFB7185F43F5EE11D48BE123C9F1239';

    /**
     * @notice Extracts a color from the color palette at a specific position
     * @param spot The position in the color palette (0 returns transparent)
     * @return The 6-character hex color code (without # prefix)
     * @dev Returns 'FF000000' for spot 0 (transparent)
     * @dev Extracts 6 characters from the COLORS constant string
     */
    function getColor(uint256 spot) public pure returns (string memory) {
        if (spot == 0) return 'FF000000';
        bytes memory strBytes = bytes(COLORS);
        bytes memory result = new bytes(6);
        for (uint256 i = (spot * 6); i < ((spot + 1) * 6); i++) result[i - (spot * 6)] = strBytes[i];
        return string(result);
    }

    /**
     * @notice Returns the total number of colors available in the palette
     * @return The number of colors in the palette
     * @dev Calculated by dividing the COLORS string length by 6
     */
    function getColorCount() public pure returns (uint256) {
        return bytes(COLORS).length / 6;
    }

    // 0 = designs
    // 1 = heels
    // 2 = toes
    // 3 = tops
    string[] public styleNames = ["design", "heel", "toe", "top"];
    mapping(uint8 => string[]) public styleLookup;

    /**
     * @notice Returns all available styles organized by category
     * @return A 2D array of style strings organized by category
     * @dev Returns styles for all categories: design, heel, toe, and top
     */
    function getStyles() public view returns (string[][] memory) {
        string[][] memory styles = new string[][](styleNames.length);
        for (uint8 i = 0; i < styleNames.length; i++) {
            styles[i] = styleLookup[i];
        }
        return styles;
    }

    /**
     * @notice Returns a specific style from a style category
     * @param index The style category index (0=design, 1=heel, 2=toe, 3=top)
     * @param styleIndex The index of the style within the category
     * @return The SVG style string at the specified index
     * @dev Reverts if the category index is out of bounds
     */
    function getStyle(uint8 index, uint16 styleIndex) public view returns (string memory) {
        require(index < styleNames.length, "Style index out of bounds");
        return styleLookup[index][styleIndex];
    }

    /**
     * @notice Internal function to add a new style to a category
     * @param index The style category index
     * @param _style The SVG style string to add
     * @dev Appends the style to the end of the category's style array
     */
    function _addStyle(uint8 index, string memory _style) internal virtual {
        styleLookup[index].push(_style);
    }

    /**
     * @notice Internal function to update an existing style
     * @param index The style category index
     * @param styleIndex The index of the style to update
     * @param _style The new SVG style string
     * @dev Reverts if the category index is out of bounds
     * @dev Replaces the existing style at the specified index
     */
    function _updateStyle(uint8 index, uint8 styleIndex, string memory _style) internal {
        require(index < styleNames.length, "Style index out of bounds");
        styleLookup[index][styleIndex] = _style;
    }

    /**
     * @notice Validates a sock configuration for correctness
     * @param sock The sock configuration to validate
     * @return isValid Whether the sock configuration is valid
     * @return errors A string containing any validation errors
     * @dev Checks color indices, style constraints, and design rules
     * @dev Returns detailed error messages for debugging
     */
    function checkSock(Sock memory sock) public view returns (bool isValid, string memory errors) {
        errors = "";
        uint256 colorCount = getColorCount();
        
        // Check base color index
        if (sock.baseColorIndex >= colorCount) {
            errors = string.concat(errors, "Base color index out of bounds; ");
        }
        
        // Check outline color index
        if (sock.outlineColorIndex >= colorCount) {
            errors = string.concat(errors, "Outline color index out of bounds; ");
        }
        
        // Check base and outline color constraints
        if (sock.outlineColorIndex == sock.baseColorIndex) {
            errors = string.concat(errors, "Outline color must be different from base color; ");
        }
        if (sock.baseColorIndex == 0) {
            errors = string.concat(errors, "Base color must not be transparent; ");
        }
        if (sock.outlineColorIndex == 0) {
            errors = string.concat(errors, "Outline color must not be transparent; ");
        }
        
        // Check all styles using a loop
        Style[4] memory styles = [sock.design, sock.heel, sock.toe, sock.top];
        for (uint8 i = 0; i < styleNames.length; i++) {
            (bool valid, string memory styleErrors) = checkStyle(
                styleNames[i],
                styles[i],
                styleLookup[i].length - 1,
                sock.baseColorIndex
            );
            if (!valid) {
                errors = string.concat(errors, styleErrors);
            }
        }
        
        // Additional validation for design and top (non-transparent colors when index > 0)
        if (sock.design.index != 0 && sock.design.colorIndex == 0) {
            errors = string.concat(errors, "Design color must not be transparent if design index is not 0; ");
        }
        if (sock.top.index != 0 && sock.top.colorIndex == 0) {
            errors = string.concat(errors, "Top color must not be transparent if top index is not 0; ");
        }
        
        isValid = bytes(errors).length == 0;
    }

    /**
     * @notice Validates a single style configuration
     * @param name The name of the style category for error messages
     * @param style The style configuration to validate
     * @param maxIndex The maximum allowed index for this style category
     * @param baseColorIndex The base color index for comparison
     * @return isValid Whether the style configuration is valid
     * @return errors A string containing any validation errors
     * @dev Checks index bounds, color constraints, and transparency rules
     */
    function checkStyle(string memory name, Style memory style, uint256 maxIndex, uint8 baseColorIndex) internal pure returns (bool isValid, string memory errors) {
        errors = "";
        uint256 colorCount = getColorCount();
        
        if (style.index > maxIndex) {
            errors = string.concat(name, " index too large; ");
        }
        if (style.index == 0) {
            if (style.colorIndex != 0) {
                errors = string.concat(errors, name, " color must be transparent if ", name, " index is 0; ");
            }
        } else {
            if (style.colorIndex == baseColorIndex) {
                errors = string.concat(errors, name, " color must be different from base color if ", name, " index is not 0; ");
            }
        }
        if (style.colorIndex > colorCount - 1) {
            errors = string.concat(errors, name, " color index too large; ");
        }
        
        isValid = bytes(errors).length == 0;
    }
    
    // Bit sizes
    uint256 constant COLOR_BITS = 8;         // 8 bits for each color (0-255)
    uint256 constant STYLE_INDEX_BITS = 16;  // 16 bits for each style index (0-65535)

    // Bit positions (sock configuration starts from bit 0)
    uint256 constant BASE_COLOR_POS = 0;
    uint256 constant OUTLINE_COLOR_POS = BASE_COLOR_POS + COLOR_BITS;
    uint256 constant TOP_COLOR_POS = OUTLINE_COLOR_POS + COLOR_BITS;
    uint256 constant TOP_INDEX_POS = TOP_COLOR_POS + COLOR_BITS;
    uint256 constant HEEL_COLOR_POS = TOP_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant HEEL_INDEX_POS = HEEL_COLOR_POS + COLOR_BITS;
    uint256 constant TOE_COLOR_POS = HEEL_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant TOE_INDEX_POS = TOE_COLOR_POS + COLOR_BITS;
    uint256 constant DESIGN_COLOR_POS = TOE_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant DESIGN_INDEX_POS = DESIGN_COLOR_POS + COLOR_BITS;

    /**
     * @notice Style configuration struct
     * @param colorIndex Index into the color palette
     * @param index Index of the style pattern within its category
     */
    struct Style {
        uint8 colorIndex;  // Index into colorPalette
        uint16 index;
    }

    /**
     * @notice Complete sock configuration struct
     * @param baseColorIndex Index of the base color in the palette
     * @param outlineColorIndex Index of the outline color in the palette
     * @param top Top style configuration
     * @param heel Heel style configuration
     * @param toe Toe style configuration
     * @param design Design style configuration
     */
    struct Sock {
        uint8 baseColorIndex;  // Index into colorPalette
        uint8 outlineColorIndex;  // Index into colorPalette
        Style top;
        Style heel;
        Style toe;
        Style design;
    }

    /**
     * @notice Validates a token ID by decoding and checking the sock configuration
     * @param tokenId The encoded token ID to validate
     * @return Whether the token ID represents a valid sock configuration
     * @dev Decodes the token ID and runs full validation checks
     */
    function validateTokenId(uint256 tokenId) public view returns (bool) {
        Sock memory sock = decodeSock(tokenId);
        (bool isValid,) = checkSock(sock);
        return isValid;
    }

    /**
     * @notice Encodes a sock configuration into a token ID
     * @param sock The sock configuration to encode
     * @return The encoded token ID
     * @dev Validates the sock configuration before encoding
     * @dev Packs all sock parameters into a single uint256 using bit manipulation
     */
    function encodeSock(Sock memory sock) public view returns (uint256) {
        checkSock(sock);
        uint256 encoded = 0;
        encoded |= uint256(sock.baseColorIndex) << BASE_COLOR_POS;
        encoded |= uint256(sock.outlineColorIndex) << OUTLINE_COLOR_POS;
        encoded |= uint256(sock.top.colorIndex) << TOP_COLOR_POS;
        encoded |= uint256(sock.top.index) << TOP_INDEX_POS;
        encoded |= uint256(sock.heel.colorIndex) << HEEL_COLOR_POS;
        encoded |= uint256(sock.heel.index) << HEEL_INDEX_POS;
        encoded |= uint256(sock.toe.colorIndex) << TOE_COLOR_POS;
        encoded |= uint256(sock.toe.index) << TOE_INDEX_POS;
        encoded |= uint256(sock.design.colorIndex) << DESIGN_COLOR_POS;
        encoded |= uint256(sock.design.index) << DESIGN_INDEX_POS;
        return encoded;
    }

    /**
     * @notice Decodes a token ID into a sock configuration
     * @param encoded The encoded token ID
     * @return sock The decoded sock configuration
     * @dev Extracts all sock parameters from the encoded token ID
     * @dev Validates the decoded configuration
     */
    function decodeSock(uint256 encoded) public view returns (Sock memory sock) {
        sock = _decodeSockData(encoded);
    }

    /**
     * @notice Utility function for extracting values from encoded sock data
     * @param encoded The encoded data
     * @param position The bit position to extract from
     * @param bits The number of bits to extract
     * @return The extracted value
     * @dev Uses bit shifting and masking to extract specific fields
     */
    function _extract(uint256 encoded, uint256 position, uint256 bits) internal pure returns (uint256) {
        return (encoded >> position) & ((1 << bits) - 1);
    }

    /**
     * @notice Internal function to decode sock data from encoded token ID
     * @param encoded The encoded token ID
     * @return sock The decoded sock configuration
     * @dev Extracts all sock parameters and validates the configuration
     * @dev Reverts if the decoded configuration is invalid
     */
    function _decodeSockData(uint256 encoded) internal view returns (Sock memory sock) {
        uint8 baseColorIndex = uint8(_extract(encoded, BASE_COLOR_POS, COLOR_BITS));
        uint8 outlineColorIndex = uint8(_extract(encoded, OUTLINE_COLOR_POS, COLOR_BITS));
        uint8 topColorIndex = uint8(_extract(encoded, TOP_COLOR_POS, COLOR_BITS));
        uint16 topIndex = uint16(_extract(encoded, TOP_INDEX_POS, STYLE_INDEX_BITS));
        uint8 heelColorIndex = uint8(_extract(encoded, HEEL_COLOR_POS, COLOR_BITS));
        uint16 heelIndex = uint16(_extract(encoded, HEEL_INDEX_POS, STYLE_INDEX_BITS));
        uint8 toeColorIndex = uint8(_extract(encoded, TOE_COLOR_POS, COLOR_BITS));
        uint16 toeIndex = uint16(_extract(encoded, TOE_INDEX_POS, STYLE_INDEX_BITS));
        uint8 designColorIndex = uint8(_extract(encoded, DESIGN_COLOR_POS, COLOR_BITS));
        uint16 designIndex = uint16(_extract(encoded, DESIGN_INDEX_POS, STYLE_INDEX_BITS));
        sock = Sock({
            baseColorIndex: baseColorIndex,
            outlineColorIndex: outlineColorIndex,
            top: Style({ colorIndex: topColorIndex, index: topIndex }),
            heel: Style({ colorIndex: heelColorIndex, index: heelIndex }),
            toe: Style({ colorIndex: toeColorIndex, index: toeIndex }),
            design: Style({ colorIndex: designColorIndex, index: designIndex })
        });
        (bool isValid, string memory errors) = checkSock(sock);
        require(isValid, errors);
    }

    /**
     * @notice Internal function to create a trait JSON string
     * @param traitType The trait type name
     * @param value The trait value
     * @return The formatted trait JSON string
     * @dev Creates properly formatted JSON for NFT metadata attributes
     */
    function _trait(string memory traitType, string memory value, bool comma) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"trait_type":"', traitType, '","value":"', value, '"}', comma ? ',' : ''
        ));
    }

    /**
     * @notice Generates trait attributes for a sock token
     * @param encodedSockId The encoded sock token ID
     * @return attributes A comma-separated string of trait JSON objects
     * @dev Decodes the sock and generates all trait attributes
     * @dev Includes color and style information for each sock component
     */
    function getTraits(uint256 encodedSockId) public view returns (string memory attributes) {
        Sock memory sock = decodeSock(encodedSockId);
        attributes = string(abi.encodePacked(
            _trait("Base Color", utils.uint2str(sock.baseColorIndex), true),
            _trait("Outline Color", utils.uint2str(sock.outlineColorIndex), true),
            sock.top.index > 0 ? _trait("Top Color", utils.uint2str(sock.top.colorIndex), true) : '',
            _trait("Top Style", utils.uint2str(sock.top.index), true),
            sock.heel.index > 0 ? _trait("Heel Color", utils.uint2str(sock.heel.colorIndex), true) : '',
            _trait("Heel Style", utils.uint2str(sock.heel.index), true),
            sock.toe.index > 0 ? _trait("Toe Color", utils.uint2str(sock.toe.colorIndex), true) : '',
            _trait("Toe Style", utils.uint2str(sock.toe.index), true),
            sock.design.index > 0 ? _trait("Design Color", utils.uint2str(sock.design.colorIndex), true) : '',
            _trait("Design Index", utils.uint2str(sock.design.index), false)
            ));
    }

    /**
     * @notice Generates the base sock SVG path elements
     * @param baseColorClass CSS class name for the base color
     * @param outlineColorClass CSS class name for the outline color
     * @return The SVG path elements for the base sock shape
     * @dev Creates the basic sock outline and fill paths
     */
    function baseSock(string memory baseColorClass, string memory outlineColorClass) public pure returns (string memory) {
        return string.concat(
            '<path d="M7 2h12v16h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H5v-1H4v-1H3v-1H2v-4h1v-1h1v-1h1v-1h1v-1h1V2" class="', outlineColorClass, '"/>',
            '<path d="M8 3v10H7v1H6v1H5v1H4v1H3v4h1v1h1v1h7v-1h1v-1h1v-1h2v-1h1v-1h1V3Z" class="', baseColorClass, '"/>'
        );
    }

    /**
     * @notice Generates the complete SVG for a sock configuration
     * @param sock The sock configuration to render
     * @return The complete SVG string for the sock
     * @dev Combines base sock with all style elements
     */
    function drawSock(Sock memory sock) public view returns (string memory) {
        return string.concat(
            baseSock('baseColor', 'outlineColor'),
            getStyle(1, sock.heel.index),
            getStyle(2, sock.toe.index),
            getStyle(3, sock.top.index),
            getStyle(0, sock.design.index)
        );
    }

    /**
     * @notice Generates CSS fill style for a sock component
     * @param component The CSS class name for the component
     * @param sockId The unique sock identifier
     * @param color The hex color value (without #)
     * @return The CSS style string for filling the component
     */
    function generateFillStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { fill: ', color, '; fill-rule: evenodd; } ');
    }

    /**
     * @notice Generates CSS stroke style for a sock component
     * @param component The CSS class name for the component
     * @param sockId The unique sock identifier
     * @param color The hex color value (without #)
     * @return The CSS style string for stroking the component
     */
    function generateStrokeStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { stroke: ', color, '; fill: none; } ');
    }

    /**
     * @notice Generates all CSS styles for a sock configuration
     * @param sock The sock configuration
     * @param sockId The unique sock identifier
     * @return The complete CSS style string for the sock
     * @dev Handles color fallbacks for transparent styles
     * @dev Generates styles for all sock components
     */
    function generateStyles(Sock memory sock, string memory sockId) public pure returns (string memory) {

        string memory heelColor = sock.heel.colorIndex == 0 ? getColor(sock.baseColorIndex) : getColor(sock.heel.colorIndex);
        string memory toeColor = sock.toe.colorIndex == 0 ? getColor(sock.baseColorIndex) : getColor(sock.toe.colorIndex);
        
        return string.concat(
            generateFillStyle('baseColor', sockId, string.concat('#', getColor(sock.baseColorIndex))),
            generateFillStyle('outlineColor', sockId, string.concat('#', getColor(sock.outlineColorIndex))),
            generateFillStyle('topColor', sockId, string.concat('#', getColor(sock.top.colorIndex))),
            generateFillStyle('heelColor', sockId, string.concat('#', heelColor)),
            generateFillStyle('toeColor', sockId, string.concat('#', toeColor)),
            generateFillStyle('designColor', sockId, string.concat('#', getColor(sock.design.colorIndex))),
            generateStrokeStyle('designOutline', sockId, string.concat('#', getColor(sock.design.colorIndex)))
        );
    }

    /**
     * @notice Renders a sock configuration as a complete SVG
     * @param sock The sock configuration to render
     * @param id The token ID for the sock
     * @return The complete SVG string with embedded styles
     * @dev Creates a self-contained SVG with all necessary styling
     */
    function renderSock(Sock memory sock, uint256 id) public view returns (string memory) {
        string memory sockId = string.concat('sock-', utils.uint2str(id));
        return
            string.concat(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="-1 0 24 25">',
                '<defs>',
                '<style>',
                generateStyles(sock, sockId),
                '</style>',
                '<symbol id="', sockId, '">',
                drawSock(sock),
                '</symbol>',
                '</defs>',
                '<use href="#', sockId, '"/>',
                '</svg>'
            );
    }

    /**
     * @notice Renders a sock from an encoded token ID
     * @param encodedSockId The encoded sock token ID
     * @return The complete SVG string for the sock
     * @dev Decodes the token ID and renders the sock configuration
     */
    function render(uint256 encodedSockId) public view returns (string memory) {
        Sock memory sock = decodeSock(encodedSockId);
        return renderSock(sock, encodedSockId);
    }
}
