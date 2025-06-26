//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './svg/SVG.sol';
import './svg/Utils.sol';

contract Renderer {

    // Color mapping - we'll encode colors as uint8 indices
    string[] public colorPalette;

    // 0 = designs
    // 1 = heels
    // 2 = toes
    // 3 = tops
    string[] public styleNames = ["design", "heel", "toe", "top"];
    mapping(uint8 => string[]) public styleLookup;

    function addStyle(uint8 index, string memory _style) public {
        styleLookup[index].push(_style);
    }

    function getStyle(uint8 index, uint256 styleIndex) public view returns (string memory) {
        require(index < styleNames.length, "Style index out of bounds");
        return styleLookup[index][styleIndex];
    }
    
    
    // Bit positions for encoding (from right to left)
    uint256 constant TOP_CONFIG_BITS = 3;    // 3 bits for each top property (0-7)
    uint256 constant COLOR_BITS = 8;         // 8 bits for each color (0-255)
    uint256 constant STYLE_INDEX_BITS = 4;   // 4 bits for style index (0-15) - heel/toe
    uint256 constant DESIGN_INDEX_BITS = 6;  // 6 bits for design index (0-63)
    
    // Bit positions (sock configuration starts from bit 0)
    uint256 constant BASE_COLOR_POS = 0;     // Base color first (logical foundation)
    uint256 constant OUTLINE_COLOR_POS = BASE_COLOR_POS + COLOR_BITS;
    uint256 constant TOP_COLOR_POS = OUTLINE_COLOR_POS + COLOR_BITS;
    uint256 constant TOP_INDEX_POS = TOP_COLOR_POS + COLOR_BITS;
    uint256 constant HEEL_COLOR_POS = TOP_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant HEEL_INDEX_POS = HEEL_COLOR_POS + COLOR_BITS;
    uint256 constant TOE_COLOR_POS = HEEL_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant TOE_INDEX_POS = TOE_COLOR_POS + COLOR_BITS;
    uint256 constant DESIGN_COLOR_POS = TOE_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant DESIGN_INDEX_POS = DESIGN_COLOR_POS + COLOR_BITS;

    struct Style {
        uint8 colorIndex;  // Index into colorPalette
        uint256 index;
    }

    struct Sock {
        uint8 baseColorIndex;  // Index into colorPalette
        uint8 outlineColorIndex;  // Index into colorPalette
        Style top;
        Style heel;
        Style toe;
        Style design;
    }

    constructor() {
        // Initialize color palette with common colors
        colorPalette = [
            "#FF000000", // 0 - Transparent
            "#FFFFFF", // 1 - White
            "#000000", // 2 - Black
            "#FF0000", // 3 - Red
            "#00FF00", // 4 - Green
            "#0000FF", // 5 - Blue
            "#FFFF00", // 6 - Yellow
            "#FF00FF", // 7 - Magenta
            "#00FFFF", // 8 - Cyan
            "#FFA500", // 9 - Orange
            "#800080", // 10 - Purple
            "#A52A2A", // 11 - Brown
            "#808080", // 12 - Gray
            "#FFC0CB", // 13 - Pink
            "#008000", // 14 - Dark Green
            "#000080", // 15 - Navy
            "#FFD700"  // 16 - Gold
        ];
        
    }

    function addColor(string memory color) public {
        colorPalette.push(color);
    }

    function getColorIndex(string memory color) public view returns (uint8) {
        for (uint8 i = 0; i < colorPalette.length; i++) {
            if (keccak256(abi.encodePacked(colorPalette[i])) == keccak256(abi.encodePacked(color))) {
                return i;
            }
        }
        revert("Color not found in palette");
    }

    function getColor(uint8 index) public view returns (string memory) {
        require(index < colorPalette.length, "Color index out of bounds");
        return colorPalette[index];
    }

    function validateTokenId(uint256 tokenId) public view returns (bool) {
        Sock memory sock = decodeSock(tokenId);
        (bool isValid,) = checkSock(sock);
        return isValid;
    }

    function encodeSock(Sock memory sock) public view returns (uint256) {
        // Validate the sock first
        checkSock(sock);
        
        uint256 encoded = 0;
        
        // Encode in order of bit positions (lowest to highest)
        // Base color (bits 0-7)
        encoded |= uint256(sock.baseColorIndex) << BASE_COLOR_POS;
        
        // Outline color (bits 8-15)
        encoded |= uint256(sock.outlineColorIndex) << OUTLINE_COLOR_POS;
        
        // Top color (bits 16-23)
        encoded |= uint256(sock.top.colorIndex) << TOP_COLOR_POS;
        
        // Top index (bits 24-27)
        encoded |= uint256(sock.top.index) << TOP_INDEX_POS;
        
        // Heel color (bits 28-35)
        encoded |= uint256(sock.heel.colorIndex) << HEEL_COLOR_POS;
        
        // Heel index (bits 36-39)
        encoded |= uint256(sock.heel.index) << HEEL_INDEX_POS;
        
        // Toe color (bits 40-47)
        encoded |= uint256(sock.toe.colorIndex) << TOE_COLOR_POS;
        
        // Toe index (bits 48-51)
        encoded |= uint256(sock.toe.index) << TOE_INDEX_POS;
        
        // Design color (bits 52-59)
        encoded |= uint256(sock.design.colorIndex) << DESIGN_COLOR_POS;
        
        // Design index (bits 60-65)
        encoded |= uint256(sock.design.index) << DESIGN_INDEX_POS;
        
        return encoded;
    }

    function decodeSock(uint256 encoded) public view returns (Sock memory sock) {
        sock = _decodeSockData(encoded);
    }

    function _decodeSockData(uint256 encoded) internal view returns (Sock memory sock) {
        // Extract colors and indices in order of bit positions
        uint8 baseColorIndex = _extractColor(encoded, BASE_COLOR_POS);
        uint8 outlineColorIndex = _extractColor(encoded, OUTLINE_COLOR_POS);
        uint8 topColorIndex = _extractColor(encoded, TOP_COLOR_POS);
        uint256 topIndex = _extractStyleIndex(encoded, TOP_INDEX_POS);
        uint8 heelColorIndex = _extractColor(encoded, HEEL_COLOR_POS);
        uint256 heelIndex = _extractStyleIndex(encoded, HEEL_INDEX_POS);
        uint8 toeColorIndex = _extractColor(encoded, TOE_COLOR_POS);
        uint256 toeIndex = _extractStyleIndex(encoded, TOE_INDEX_POS);
        uint8 designColorIndex = _extractColor(encoded, DESIGN_COLOR_POS);
        uint256 designIndex = _extractDesignIndex(encoded, DESIGN_INDEX_POS);
        
        // Construct Sock struct
        sock = Sock({
            baseColorIndex: baseColorIndex,
            outlineColorIndex: outlineColorIndex,
            top: Style({
                colorIndex: topColorIndex,
                index: topIndex
            }),
            heel: Style({
                colorIndex: heelColorIndex,
                index: heelIndex
            }),
            toe: Style({
                colorIndex: toeColorIndex,
                index: toeIndex
            }),
            design: Style({
                colorIndex: designColorIndex,
                index: designIndex
            })
        });
        
        // Validate the decoded sock
        (bool isValid, string memory errors) = checkSock(sock);
        require(isValid, errors);
    }

    function _extractColor(uint256 encoded, uint256 position) internal pure returns (uint8) {
        return uint8((encoded >> position) & ((1 << COLOR_BITS) - 1));
    }

    function _extractStyleIndex(uint256 encoded, uint256 position) internal pure returns (uint256) {
        return (encoded >> position) & ((1 << STYLE_INDEX_BITS) - 1);
    }

    function _extractDesignIndex(uint256 encoded, uint256 position) internal pure returns (uint256) {
        return (encoded >> position) & ((1 << DESIGN_INDEX_BITS) - 1);
    }

    function _trait(string memory traitType, string memory value) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{"trait_type":"', traitType, '","value":"', value, '"}'
        ));
    }

    function getTraits(uint256 encodedSockId) public view returns (string memory attributes) {
        Sock memory sock = decodeSock(encodedSockId);
        attributes = string(abi.encodePacked(
            _trait("Base Color", utils.uint2str(sock.baseColorIndex)), ',',
            _trait("Outline Color", utils.uint2str(sock.outlineColorIndex)), ',',
            _trait("Top Color", utils.uint2str(sock.top.colorIndex)), ',',
            _trait("Top Style", utils.uint2str(sock.top.index)), ',',
            _trait("Heel Color", utils.uint2str(sock.heel.colorIndex)), ',',
            _trait("Heel Style", utils.uint2str(sock.heel.index)), ',',
            _trait("Toe Color", utils.uint2str(sock.toe.colorIndex)), ',',
            _trait("Toe Style", utils.uint2str(sock.toe.index)), ',',
            _trait("Design Color", utils.uint2str(sock.design.colorIndex)), ',',
            _trait("Design Index", utils.uint2str(sock.design.index))
            ));
    }
    
    function updateStyle(uint8 index, uint8 styleIndex, string memory _style) public {
        require(index < styleNames.length, "Style index out of bounds");
        styleLookup[index][styleIndex] = _style;
    }

    function baseSock(string memory baseColorClass, string memory outlineColorClass) public pure returns (string memory) {
        return string.concat(
            '<path d="M7 2h12v16h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H5v-1H4v-1H3v-1H2v-4h1v-1h1v-1h1v-1h1v-1h1V2" class="', outlineColorClass, '"/>',
            '<path d="M8 3v10H7v1H6v1H5v1H4v1H3v4h1v1h1v1h7v-1h1v-1h1v-1h2v-1h1v-1h1V3Z" class="', baseColorClass, '"/>'
        );
    }

    function drawSock(Sock memory sock) public view returns (string memory) {
        return string.concat(
            baseSock('baseColor', 'outlineColor'),
            getStyle(0, sock.design.index),
            getStyle(1, sock.heel.index),
            getStyle(2, sock.toe.index),
            getStyle(3, sock.top.index)
        );
    }

    function generateFillStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { fill: ', color, '; } ');
    }

    function generateStrokeStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { stroke: ', color, '; fill: none; } ');
    }

    function generateStyles(Sock memory sock, string memory sockId) public view returns (string memory) {

        string memory heelColor = sock.heel.colorIndex == 0 ? getColor(sock.baseColorIndex) : getColor(sock.heel.colorIndex);
        string memory toeColor = sock.toe.colorIndex == 0 ? getColor(sock.baseColorIndex) : getColor(sock.toe.colorIndex);
        
        return string.concat(
            generateFillStyle('baseColor', sockId, getColor(sock.baseColorIndex)),
            generateFillStyle('outlineColor', sockId, getColor(sock.outlineColorIndex)),
            generateFillStyle('topColor', sockId, getColor(sock.top.colorIndex)),
            generateFillStyle('heelColor', sockId, heelColor),
            generateFillStyle('toeColor', sockId, toeColor),
            generateFillStyle('designColor', sockId, getColor(sock.design.colorIndex)),
            generateStrokeStyle('designOutline', sockId, getColor(sock.design.colorIndex))
        );
    }

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

    function render(uint256 encodedSockId) public view returns (string memory) {
        Sock memory sock = decodeSock(encodedSockId);
        return renderSock(sock, encodedSockId);
    }

    function checkSock(Sock memory sock) public view returns (bool isValid, string memory errors) {
        errors = "";
        
        // Check base color index
        if (sock.baseColorIndex >= colorPalette.length) {
            errors = string.concat(errors, "Base color index out of bounds; ");
        }
        
        // Check outline color index
        if (sock.outlineColorIndex >= colorPalette.length) {
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
        
        // Check design style
        (bool designValid, string memory designErrors) = checkStyle("design", sock.design, styleLookup[0].length - 1, sock.baseColorIndex);
        if (!designValid) {
            errors = string.concat(errors, designErrors);
        }
        
        // Check heel style
        (bool heelValid, string memory heelErrors) = checkStyle("heel", sock.heel, styleLookup[1].length - 1, sock.baseColorIndex);
        if (!heelValid) {
            errors = string.concat(errors, heelErrors);
        }
        
        // Check toe style
        (bool toeValid, string memory toeErrors) = checkStyle("toe", sock.toe, styleLookup[2].length - 1, sock.baseColorIndex);
        if (!toeValid) {
            errors = string.concat(errors, toeErrors);
        }
        
        // Check top style
        (bool topValid, string memory topErrors) = checkStyle("top", sock.top, styleLookup[3].length - 1, sock.baseColorIndex);
        if (!topValid) {
            errors = string.concat(errors, topErrors);
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

    function checkStyle(string memory name, Style memory style, uint256 maxIndex, uint8 baseColorIndex) internal view returns (bool isValid, string memory errors) {
        errors = "";
        
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
        if (style.colorIndex > colorPalette.length - 1) {
            errors = string.concat(errors, name, " color index too large; ");
        }
        
        isValid = bytes(errors).length == 0;
    }
}
