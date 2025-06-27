//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './svg/SVG.sol';
import './svg/Utils.sol';

contract Renderer {

    // Color storage - efficient constant string approach
    string public constant COLORS = '------F1F5F9E2E8F0CBD5E194A3B864748B4755693341551E293BF5F5F4E7E5E4D6D3D1A8A29E78716C57534E44403C292524FEE2E2FECACAFCA5A5F87171EF4444DC2626B91C1C991B1BFFEDD5FED7AAFDBA74FB923CF97316EA580CC2410C9A3412FEF3C7FDE68AFCD34DFBBF24F59E0BD97706B4530992400EFEF9C3FEF08AFDE047FACC15EAB308CA8A04A16207854D0EECFCCBD9F99DBEF264A3E63584CC1665A30D4D7C0F3F6212DCFCE7BBF7D086EFAC4ADE8022C55E16A34A15803D166534D1FAE5A7F3D06EE7B734D39910B981059669047857065F46CCFBF199F6E45EEAD42DD4BF14B8A60D94880F766E115E59CFFAFEA5F3FC67E8F922D3EE06B6D40891B20E7490155E75E0F2FEBAE6FD7DD3FC38BDF80EA5E90284C70369A1075985DBEAFEBFDBFE93C5FD60A5FA3B82F62563EB1D4ED81E40AFE0E7FFC7D2FEA5B4FC818CF86366F14F46E54338CA3730A3EDE9FEDDD6FEC4B5FDA78BFA8B5CF67C3AED6D28D95B21B6F3E8FFE9D5FFD8B4FEC084FCA855F79333EA7E22CE6B21A8FAE8FFF5D0FEF0ABFCE879F9D946EFC026D3A21CAF86198FFCE7F3FBCFE8F9A8D4F472B6EC4899DB2777BE185D9D174DFFE4E6FECDD3FDA4AFFB7185F43F5EE11D48BE123C9F1239';

    // Extract 0-6 substring at spot within mega palette string
    function getColor(uint256 spot) public pure returns (string memory) {
        if (spot == 0) return 'FF000000';
        bytes memory strBytes = bytes(COLORS);
        bytes memory result = new bytes(6);
        for (uint256 i = (spot * 6); i < ((spot + 1) * 6); i++) result[i - (spot * 6)] = strBytes[i];
        return string(result);
    }

    // Get total number of colors available
    function getColorCount() public pure returns (uint256) {
        return bytes(COLORS).length / 6;
    }

    // 0 = designs
    // 1 = heels
    // 2 = toes
    // 3 = tops
    string[] public styleNames = ["design", "heel", "toe", "top"];
    mapping(uint8 => string[]) public styleLookup;

    function _addStyle(uint8 index, string memory _style) internal virtual {
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
        // No initialization needed - colors are stored in constant string
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
            getStyle(1, sock.heel.index),
            getStyle(2, sock.toe.index),
            getStyle(3, sock.top.index),
            getStyle(0, sock.design.index)
        );
    }

    function generateFillStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { fill: ', color, '; fill-rule: evenodd; } ');
    }

    function generateStrokeStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { stroke: ', color, '; fill: none; } ');
    }

    function generateStyles(Sock memory sock, string memory sockId) public view returns (string memory) {

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
}
