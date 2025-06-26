//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './svg/SVG.sol';
import './svg/Utils.sol';

contract Renderer {

    // Color mapping - we'll encode colors as uint8 indices
    string[] public colorPalette;
    string[] public designs;
    
    // Bit positions for encoding (from right to left)
    uint256 constant TOP_CONFIG_BITS = 3;    // 3 bits for each top property (0-7)
    uint256 constant COLOR_BITS = 8;         // 8 bits for each color (0-255)
    uint256 constant STYLE_INDEX_BITS = 4;   // 4 bits for style index (0-15) - heel/toe
    uint256 constant DESIGN_INDEX_BITS = 6;  // 6 bits for design index (0-63)
    
    // Bit positions (sock configuration starts from bit 0)
    uint256 constant BASE_COLOR_POS = 0;     // Base color first (logical foundation)
    uint256 constant TOP_OFFSET_POS = BASE_COLOR_POS + COLOR_BITS;
    uint256 constant TOP_STRIPES_POS = TOP_OFFSET_POS + TOP_CONFIG_BITS;
    uint256 constant TOP_THICKNESS_POS = TOP_STRIPES_POS + TOP_CONFIG_BITS;
    uint256 constant TOP_GAP_POS = TOP_THICKNESS_POS + TOP_CONFIG_BITS;
    uint256 constant TOP_COLOR_POS = TOP_GAP_POS + TOP_CONFIG_BITS;
    uint256 constant HEEL_COLOR_POS = TOP_COLOR_POS + COLOR_BITS;
    uint256 constant HEEL_INDEX_POS = HEEL_COLOR_POS + COLOR_BITS;
    uint256 constant TOE_COLOR_POS = HEEL_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant TOE_INDEX_POS = TOE_COLOR_POS + COLOR_BITS;
    uint256 constant DESIGN_COLOR_POS = TOE_INDEX_POS + STYLE_INDEX_BITS;
    uint256 constant DESIGN_INDEX_POS = DESIGN_COLOR_POS + COLOR_BITS;

    struct Style {
        uint8 colorIndex;  // Index into colorPalette
        uint256 index;
    }

    struct Top {
        uint8 offset;
        uint8 stripes;
        uint8 thickness;
        uint8 gap;
        uint8 colorIndex;  // Index into colorPalette
    }

    struct Sock {
        uint8 baseColorIndex;  // Index into colorPalette
        Top top;
        Style heel;
        Style toe;
        Style design;
    }

    constructor() {
        // Initialize color palette with common colors
        colorPalette = [
            "#FFFFFF", // 0 - White
            "#000000", // 1 - Black
            "#FF0000", // 2 - Red
            "#00FF00", // 3 - Green
            "#0000FF", // 4 - Blue
            "#FFFF00", // 5 - Yellow
            "#FF00FF", // 6 - Magenta
            "#00FFFF", // 7 - Cyan
            "#FFA500", // 8 - Orange
            "#800080", // 9 - Purple
            "#A52A2A", // 10 - Brown
            "#808080", // 11 - Gray
            "#FFC0CB", // 12 - Pink
            "#008000", // 13 - Dark Green
            "#000080", // 14 - Navy
            "#FFD700"  // 15 - Gold
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

    function validateStyle(string memory name, Style memory style, uint256 maxIndex, uint256 maxColorIndex, uint8 baseColorIndex) public pure {
        require(style.index <= maxIndex, string.concat(name, " index too large"));
        if(style.index == 0) {
            require(style.colorIndex == 0, string.concat(name, " color must be white if ", name, " index is 0"));
        } else {
            require(style.colorIndex != baseColorIndex, string.concat(name, " color must be different from base color if ", name, " index is not 0"));
        }
        require(style.colorIndex <= maxColorIndex, string.concat(name, " color index too large"));
    }

    function validateSock(Sock memory sock) public view returns (bool) {

        require(sock.baseColorIndex < colorPalette.length, "Base color index out of bounds");
        
        // Validate Top data
        if(sock.top.stripes == 0) {
            require(sock.top.offset + sock.top.gap + sock.top.thickness + sock.top.colorIndex == 0, "Everything must sum to 0 if stripes are 0");
        } else {
            require(sock.top.colorIndex < colorPalette.length, "Top color index out of bounds");
            require(sock.top.colorIndex != sock.baseColorIndex, "Top color must be different from base color");
            require(sock.top.thickness > 0, "Top must have a thickness of at least 1");
            if(sock.top.stripes == 1) {
                require(sock.top.gap == 0, "Top gap must be 0 if stripes are 1");
            } else {
                require(sock.top.gap > 0, "Top gap must be at least 1");
            }
            
            // Validate that stripes fit within the maximum height (14 units)
            uint256 totalHeight = (sock.top.stripes * sock.top.thickness) + sock.top.offset + ((sock.top.stripes - 1) * sock.top.gap);
            require(totalHeight <= 14, "Top stripes exceed maximum height");
        }
        
        // Validate style indices
        validateStyle("heel", sock.heel, 2, colorPalette.length - 1, sock.baseColorIndex);
        validateStyle("toe", sock.toe, 2, colorPalette.length - 1, sock.baseColorIndex);
        validateStyle("design", sock.design, designs.length - 1, colorPalette.length - 1, sock.baseColorIndex);
        
        return true;
    }

    function validateTokenId(uint256 tokenId) public view returns (bool) {
        Sock memory sock = decodeSock(tokenId);
        return validateSock(sock);
    }

    function encodeSock(Sock memory sock) public view returns (uint256) {
        uint256 encoded = 0; // Start with 0, no token count
        
        // Validate the sock
        validateSock(sock);
        
        // Encode Top data
        encoded |= uint256(sock.top.offset) << TOP_OFFSET_POS;
        encoded |= uint256(sock.top.stripes) << TOP_STRIPES_POS;
        encoded |= uint256(sock.top.thickness) << TOP_THICKNESS_POS;
        encoded |= uint256(sock.top.gap) << TOP_GAP_POS;
        
        // Encode colors
        encoded |= uint256(sock.baseColorIndex) << BASE_COLOR_POS;
        encoded |= uint256(sock.top.colorIndex) << TOP_COLOR_POS;
        encoded |= uint256(sock.heel.colorIndex) << HEEL_COLOR_POS;
        encoded |= uint256(sock.toe.colorIndex) << TOE_COLOR_POS;
        encoded |= uint256(sock.design.colorIndex) << DESIGN_COLOR_POS;
        
        // Encode style indices
        encoded |= uint256(sock.heel.index) << HEEL_INDEX_POS;
        encoded |= uint256(sock.toe.index) << TOE_INDEX_POS;
        encoded |= uint256(sock.design.index) << DESIGN_INDEX_POS;
        
        return encoded;
    }

    function decodeSock(uint256 encoded) public view returns (Sock memory sock) {
        // Decode the sock using helper functions
        sock = _decodeSockData(encoded);
    }

    function _decodeSockData(uint256 encoded) internal view returns (Sock memory sock) {
        // Extract Top data
        uint8 offset = uint8((encoded >> TOP_OFFSET_POS) & ((1 << TOP_CONFIG_BITS) - 1));
        uint8 stripes = uint8((encoded >> TOP_STRIPES_POS) & ((1 << TOP_CONFIG_BITS) - 1));
        uint8 thickness = uint8((encoded >> TOP_THICKNESS_POS) & ((1 << TOP_CONFIG_BITS) - 1));
        uint8 gap = uint8((encoded >> TOP_GAP_POS) & ((1 << TOP_CONFIG_BITS) - 1));
        
        // Extract colors
        uint8 baseColorIndex = uint8((encoded >> BASE_COLOR_POS) & ((1 << COLOR_BITS) - 1));
        uint8 topColorIndex = uint8((encoded >> TOP_COLOR_POS) & ((1 << COLOR_BITS) - 1));
        uint8 heelColorIndex = uint8((encoded >> HEEL_COLOR_POS) & ((1 << COLOR_BITS) - 1));
        uint8 toeColorIndex = uint8((encoded >> TOE_COLOR_POS) & ((1 << COLOR_BITS) - 1));
        uint8 designColorIndex = uint8((encoded >> DESIGN_COLOR_POS) & ((1 << COLOR_BITS) - 1));
        
        // Extract style indices
        uint256 heelIndex = (encoded >> HEEL_INDEX_POS) & ((1 << STYLE_INDEX_BITS) - 1);
        uint256 toeIndex = (encoded >> TOE_INDEX_POS) & ((1 << STYLE_INDEX_BITS) - 1);
        uint256 designIndex = (encoded >> DESIGN_INDEX_POS) & ((1 << DESIGN_INDEX_BITS) - 1);
        
        // Construct Sock struct
        sock = Sock({
            baseColorIndex: baseColorIndex,
            top: Top({
                offset: offset,
                stripes: stripes,
                thickness: thickness,
                gap: gap,
                colorIndex: topColorIndex
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
        validateSock(sock);
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
            _trait("Top Offset", utils.uint2str(sock.top.offset)), ',',
            _trait("Top Stripes", utils.uint2str(sock.top.stripes)), ',',
            _trait("Top Thickness", utils.uint2str(sock.top.thickness)), ',',
            _trait("Top Gap", utils.uint2str(sock.top.gap)), ',',
            _trait("Top Color", utils.uint2str(sock.top.colorIndex)), ',',
            _trait("Heel Color", utils.uint2str(sock.heel.colorIndex)), ',',
            _trait("Heel Style", utils.uint2str(sock.heel.index)), ',',
            _trait("Toe Color", utils.uint2str(sock.toe.colorIndex)), ',',
            _trait("Toe Style", utils.uint2str(sock.toe.index)), ',',
            _trait("Design Color", utils.uint2str(sock.design.colorIndex)), ',',
            _trait("Design Index", utils.uint2str(sock.design.index))
            ));
    }
    
    function addDesign(string memory _design) public {
        designs.push(_design);
    }

    function updateDesign(uint256 index, string memory _design) public {
        require(index < designs.length, "Design index out of bounds");
        designs[index] = _design;
    }

    function getDesign(uint256 index) public view returns (string memory) {
        require(index < designs.length, "Design index out of bounds");
        return designs[index];
    }

    function createRect(
        uint256 x,
        uint256 y,
        uint256 width,
        uint256 height,
        string memory colorClass
    ) internal pure returns (string memory) {
        return svg.rect(
            string.concat(
                svg.prop('x', utils.uint2str(x)),
                svg.prop('y', utils.uint2str(y)),
                svg.prop('width', utils.uint2str(width)),
                svg.prop('height', utils.uint2str(height)),
                svg.prop('class', colorClass)
            )
        );
    }

    function baseSock(string memory colorClass) public pure returns (string memory) {
        string memory d = string.concat(
            'm0 1 v25 h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h7v-1h1v-1h1v-3h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-22h-10'
        );
        return svg.path(
            string.concat(
                svg.prop('d', d),
                svg.prop('class', colorClass)
            )
        , utils.NULL);
    }

    function top(Top memory _top) public pure returns (string memory) {
        string memory result;
        for (uint8 i = 0; i < _top.stripes; i++) {
            uint256 y = 1 + (_top.gap + _top.thickness) * i + _top.offset;
            result = string.concat(
                result,
                createRect(0, y, 10, _top.thickness, 'topColor')
            );
        }
        return result;
    }

    function heel(bool big) public pure returns (string memory) {
        if(big) {
            return '<path d="m0 22v4h1v1h1v1h1v1h1v1h1v-4h-1v-1h-1v-1h-1v-1h-1v-1h-1" class="heelColor"></path>';
        } else {
            return '<path d="m0 23v3h1v1h1v1h1v-3h-1v-1h-1v-1h-1" class="heelColor"></path>';
        }
    }

    function toe(bool big) public pure returns (string memory) {
        if(big) {
            return '<path d="m9 34 h6v-1h1v-1h1v-3h-1v-1h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1" class="toeColor"/>';
        } else {
            return '<path d="m12 34 h3v-1h1v-1h1v-3h-2v1h-1v1h-1v1h-1v2" class="toeColor"/>';
        }
    }

    function drawSock(Sock memory sock) public pure returns (string memory) {
        return string.concat(
            baseSock('baseColor'),
            // Pattern
            sock.top.stripes > 0 ? top(sock.top) : '',
            // Toe
            sock.toe.index > 0 ? toe(sock.toe.index == 2) : '',
            // Heel
            sock.heel.index > 0 ? heel(sock.heel.index == 2) : '',
            baseSock('outline')
        );
    }

    function generateFillStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { fill: ', color, '; } ');
    }

    function generateStrokeStyle(string memory component, string memory sockId, string memory color) public pure returns (string memory) {
        return string.concat('#', sockId, ' .', component, ' { stroke: ', color, '; fill: none; } ');
    }

    function generateOutlineStyle(string memory sockId) public pure returns (string memory) {
        return string.concat('#', sockId, ' .outline { stroke: grey; stroke-width: 0.1; fill: none; } ');
    }

    function generateStyles(Sock memory sock, string memory sockId) public view returns (string memory) {
        string memory containerId = string.concat(sockId, '-container');
        return string.concat(
            generateFillStyle('baseColor', sockId, getColor(sock.baseColorIndex)),
            generateFillStyle('topColor', sockId, getColor(sock.top.colorIndex)),
            generateFillStyle('heelColor', sockId, getColor(sock.heel.colorIndex)),
            generateFillStyle('toeColor', sockId, getColor(sock.toe.colorIndex)),
            generateFillStyle('patternFill', containerId, getColor(sock.design.colorIndex)),
            generateStrokeStyle('patternOutline', containerId, getColor(sock.design.colorIndex)),
            generateOutlineStyle(sockId)
        );
    }

    function renderSock(Sock memory sock, uint256 id) public view returns (string memory) {
        string memory sockId = string.concat('sock-', utils.uint2str(id));
        return
            string.concat(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 37 37">',
                '<defs>',
                '<style>',
                generateStyles(sock, sockId),
                '</style>',
                '<symbol id="', sockId, '">',
                drawSock(sock),
                '</symbol>',
                '</defs>',
                '<g id="', sockId, '-container">',
                '<use href="#', sockId, '" transform="translate(19,0)"/>',
                '<use href="#', sockId, '" transform="scale(-1,1) translate(-18,0)"/>',
                designs[sock.design.index],
                '</g>',
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
        
        // Check Top data
        if(sock.top.stripes == 0) {
            if(sock.top.offset + sock.top.gap + sock.top.thickness + sock.top.colorIndex != 0) {
                errors = string.concat(errors, "Everything must sum to 0 if stripes are 0; ");
            }
        } else {
            if(sock.top.colorIndex >= colorPalette.length) {
                errors = string.concat(errors, "Top color index out of bounds; ");
            }
            if(sock.top.colorIndex == sock.baseColorIndex) {
                errors = string.concat(errors, "Top color must be different from base color; ");
            }
            if(sock.top.thickness == 0) {
                errors = string.concat(errors, "Top must have a thickness of at least 1; ");
            }
            if(sock.top.stripes == 1) {
                if(sock.top.gap != 0) {
                    errors = string.concat(errors, "Top gap must be 0 if stripes are 1; ");
                }
            } else {
                if(sock.top.gap == 0) {
                    errors = string.concat(errors, "Top gap must be at least 1; ");
                }
            }
            
            // Check that stripes fit within the maximum height (14 units)
            uint256 totalHeight = (sock.top.stripes * sock.top.thickness) + sock.top.offset + ((sock.top.stripes - 1) * sock.top.gap);
            if(totalHeight > 14) {
                errors = string.concat(errors, "Top stripes exceed maximum height; ");
            }
        }
        
        // Check style indices
        (bool heelValid, string memory heelErrors) = checkStyle("heel", sock.heel, 2, colorPalette.length - 1, sock.baseColorIndex);
        if (!heelValid) {
            errors = string.concat(errors, heelErrors);
        }
        
        (bool toeValid, string memory toeErrors) = checkStyle("toe", sock.toe, 2, colorPalette.length - 1, sock.baseColorIndex);
        if (!toeValid) {
            errors = string.concat(errors, toeErrors);
        }
        
        (bool designValid, string memory designErrors) = checkStyle("design", sock.design, designs.length - 1, colorPalette.length - 1, sock.baseColorIndex);
        if (!designValid) {
            errors = string.concat(errors, designErrors);
        }
        
        isValid = bytes(errors).length == 0;
    }

    function checkStyle(string memory name, Style memory style, uint256 maxIndex, uint256 maxColorIndex, uint8 baseColorIndex) internal pure returns (bool isValid, string memory errors) {
        errors = "";
        
        if(style.index > maxIndex) {
            errors = string.concat(name, " index too large; ");
        }
        if(style.index == 0) {
            if(style.colorIndex != 0) {
                errors = string.concat(errors, name, " colorIndex must be 0 if ", name, " index is 0; ");
            }
        } else {
            if(style.colorIndex == baseColorIndex) {
                errors = string.concat(errors, name, " colorIndex must be different from base color if ", name, " index is not 0; ");
            }
        }
        if(style.colorIndex > maxColorIndex) {
            errors = string.concat(errors, name, " color index too large; ");
        }
        
        isValid = bytes(errors).length == 0;
    }
}
