//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

library PatternLib {

    // Top patterns
    string public constant topBig = '<path d="M 6 2 v 4 h 13 v -4 Z" class="outlineColor"/><path d="M 7 3 v 2 h 11 v -2 Z" class="topColor"/>';
    string public constant topStripeNoOffset = '<path d="M 8 3 v 3 h 10 v -3 Z" class="topColor"/>';
    string public constant topOne = '<path d="M 8 4 v 1 h 10 v -1 Z" class="topColor"/>';
    string public constant topTwo = '<path d="M 8 4 v 1 h 10 v -1 Z" class="topColor"/><path d="M 8 6 v 1 h 10 v -1 Z" class="topColor"/>';
    string public constant topStripeThin = '<path d="M 8 3 v 2 h 10 v -2 Z" class="topColor"/>';
    string public constant topVerticalStripes = '<path d="M8.5 3v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Z" class="topColor"/>';
    string public constant topVerticalWithHorizontal = '<path d="M8.5 3v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Z" class="topColor"/><path d="M 8 6 v 1 h 10 v -1 Z" class="topColor"/>';
    
    // Heel patterns
    string public constant heelBig = '<path d="M 14 20 v -4 h 1 v -1 h 1 v -1 h 2 v 5 h -1 v 1 Z" class="outlineColor"/><path d="M 15 20 v -4 h 1 v -1 h 2 v 3 h -1 v 1 h -1 v 1 Z" class="heelColor"/>';
    string public constant heel = '<path d="M 14 20 v -3 h 1 v -1 h 3 v 2 h -1 v 1 h -1 v 1 Z" class="outlineColor"/><path d="M 15 20 v -3 h 3 v 1 h -1 v 1 h -1 v 1 Z" class="heelColor"/>';
    
    // Toe patterns
    string public constant toeBig = '<path d="M 3 17 h 2 v 1 h 1 v 1 h 1 v 1 h1 v 1 h 1 v 1 h 1 v 1 h -5 v -1 h -1 v -1 h -1 v -4" class="outlineColor"/><path d="M 3 17 h 1 v 1 h 1 v 1 h 1 v 1 h 1 v 1 h 1 v 1 h 1 v 1 h -4 v -1 h -1 v -1 h -1 v -4" class="toeColor"/>';
    string public constant toe = '<path d="M 3 17 h 2 v 2 h 1 v 2 h 1 v 1 h 1 v 1 h -3 v -1 h -1 v -1 h -1 Z" class="outlineColor"/><path d="M 3 17 h 1 v 2 h 1 v 2 h 1 v 1 h 1 v 1 h -2 v -1 h -1 v -1 h -1 Z" class="toeColor"/>';
    
    // Design patterns
    string public constant designSmile = '<path d="M10.5 9v2h1v-2Zm0 3v1h1v-1Zm1 1v1h3v-1zm3 0h1v-1h-1Zm0-2h1v-2h-1Z" class="designColor"/>';
    string public constant designHeart = '<path d="M10 10v3h1v1h1v1h2v-1h1v-1h1v-3h-1v-1h-1.5v1h-1v-1h-1.5v1h-1" class="designColor"/>';
    string public constant designFrown = '<path d="M10.5 9v2h1v-2Zm0 4.5v1h1v-1Zm1-1v1h3v-1zm3 2h1v-1h-1Zm0-3.5h1v-2h-1Z" class="designColor"/>';
    string public constant designAcross = '<path d="M10.5 9l2 2m1 1 2 2m0-5-2 2m-1 1-2 2" class="designOutline"/>';
    string public constant designOP = '<path d="M9.5 9v5h3v-5Zm1 1v3h1v-3Zm3-1v5h1v-2h2v-3Zm1 1v1h1v-1Z" class="designColor"/>';
    
    // Legacy patterns (keeping for compatibility)
    string public constant optimism = '<path d="m10 15v3h2v-3Z" class="patternOutline"/><path d="m13.5 18.5v-3.5h2v2h-2" class="patternOutline"/><path d="m21 15v3h2v-3Z" class="patternOutline"/><path d="m24.5 18.5v-3.5h2v2h-2" class="patternOutline"/>';
    string public constant base = '<path d="m13 14h1v1h1v3h-1v1h-2v-1h-1v-1.25h2v-0.5h-2v-1.25h1v-1Z" class="patternFill"/><path d="m24 14h1v1h1v3h-1v1h-2v-1h-1v-1.25h2v-0.5h-2v-1.25h1v-1Z" class="patternFill"/>';
    string public constant across = '<path class="patternOutline" d="M25 16.5L26.6 14.9 M24 16.5L22.4 14.9 M25 17.5L26.6 19.1 M24 17.5L22.4 19.1 M13.2 16.5L14.8 14.9 M12.2 16.5L10.6 14.9 M13.2 17.5L14.8 19.1 M12.2 17.5L10.6 19.1"/>';
    string public constant unisock = '<path class="patternFill" d="m13.5 9 4.5 3v1l-4.5-3Zm0 0h3v1h-3v-1m5.5 3.5 10 6v1l-10-6Zm-11 10 4.5 3h1v-3h-1v2l-4.5-3Z"/><path class="patternOutline" style="stroke-width: 0.5; stroke-linejoin: round;" d="m10.5 15.5c0 3 1 4 4 4l-1-1m0 2 1-1m1-1c0-3-1-4-4-4l1-1m-1 1 1 1"/>';
    
}