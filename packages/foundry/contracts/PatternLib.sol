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
    string public constant designAcross = '<path d="M10.5 9l2 2m1 1 2 2m0-5-2 2m-1 1-2 2" class="designOutline" stroke-width="1"/>';
    string public constant designOP = '<path d="M9.5 9v5h3v-5Zm1 1v3h1v-3Zm3-1v5h1v-2h2v-3Zm1 1v1h1v-1Z" class="designColor"/>';
    string public constant designCircle = '<path d="M9.5 10h1v-1h1v-1h3v1h1v1h1v3h-1v1h-1v1h-3v-1h-1v-1h-1v-3" class="designColor"/>';
    string public constant designRing = '<path d="M9.5 9h1v-1h1v-1h3v1h1v1h1v3h-1v1h-1v1h-3v-1h-1v-1h-1Zm2 0h3v3h-3Z" class="designColor"/>';
    string public constant designDog = '<path d="M11 8h-1v1h-1v1h2v3h-1v1h2v-2h3v1h-1v1h2v-4h1v-1h-1v1h-4v-3h-1v1Z" class="designColor"/>';
    string public constant designBG = '<path d="M9.5 10v4h2.5v-2h2v2h2.5v-4h-2v1h-1v-1h-1v1h-1v-1Zm3-0.5h2v-1h-1v-1h-1Z" class="designColor"/>';
    
    string public constant designStar = '<path d="M12.9969 8.1094 14.0109 10.2664 16.3914 10.2664 14.5009 11.9679 15.2828 14.2969 12.9969 12.9219 10.7109 14.2969 11.493 11.9679 9.6024 10.2664 11.9828 10.2664Z" class="designColor"/>';
    string public constant designDiamond = '<path d="M10.025 10.05 11.5437 8.5 14.5813 8.5 16.1 10.05 13.0625 14ZM11.5437 8.5 13.0625 10.05 14.5813 8.5M10.025 10.05 13.0625 10.05 16.1 10.05M13.0625 10.05 13.0625 14" class="designColor"/>';
    string public constant designWave = '<path d="M10.5 8.9C11.1 8 12 9.8 12.9 8.9S14.7 8 15.6 8.9M10.5 10.25C11.1 9.35 12 11.15 12.9 10.25S14.7 9.35 15.6 10.25M10.5 11.6C11.1 10.7 12 12.5 12.9 11.6S14.7 10.7 15.6 11.6" class="designColor"/>';
    string public constant designSun = '<path d="M13 7.7H13.4V9.4H13ZM13 13H13.4V14.7H13ZM9.7 11H11.4V11.4H9.7ZM15 11H16.7V11.4H15ZM15.4 9 15.7 9.3 14.6 10.2 14.3 9.9ZM11.8 12.2 12.1 12.5 10.9 13.8 10.6 13.5ZM14.6 12.2 15.6 13.3 15.3 13.6 14.3 12.5ZM10.5 9.3 10.8 9 12.1 9.9 11.8 10.2ZM13.2 10A1.2 1.2 90 1113.19 10Z" class="designColor"/>';
    string public constant designMoon = '<path d="M15.39 9.24A3.08 3.08 90 1015.39 13.86 3.08 2.31 90 1115.39 9.24Z" class="designColor" />'; 
    string public constant designPaw = '<path d="M11.516 10.576a.864.72 90 101.44 0 1.008.72 90 10-1.44 0M10.364 11.872a.72.576 90 101.296 0 .864.576 90 10-1.296 0M13.1 12.16c-1.152.144-1.584 1.152-1.728 1.296-.288 1.152.864 1.584 1.728 1.152.864.432 2.016 0 1.728-1.152-.144-.144-1.008-1.296-1.728-1.296zM14.396 11.872a.72.576 90 101.296 0 .864.576 90 10-1.296 0M13.1 10.576a.864.72 90 101.44 0 1.008.72 90 10-1.44 0" class="designColor"/>';

    // Legacy patterns (keeping for compatibility)
    string public constant optimism = '<path d="m10 15v3h2v-3Z" class="patternOutline"/><path d="m13.5 18.5v-3.5h2v2h-2" class="patternOutline"/><path d="m21 15v3h2v-3Z" class="patternOutline"/><path d="m24.5 18.5v-3.5h2v2h-2" class="patternOutline"/>';
    string public constant base = '<path d="m13 14h1v1h1v3h-1v1h-2v-1h-1v-1.25h2v-0.5h-2v-1.25h1v-1Z" class="patternFill"/><path d="m24 14h1v1h1v3h-1v1h-2v-1h-1v-1.25h2v-0.5h-2v-1.25h1v-1Z" class="patternFill"/>';
    string public constant across = '<path class="patternOutline" d="M25 16.5L26.6 14.9 M24 16.5L22.4 14.9 M25 17.5L26.6 19.1 M24 17.5L22.4 19.1 M13.2 16.5L14.8 14.9 M12.2 16.5L10.6 14.9 M13.2 17.5L14.8 19.1 M12.2 17.5L10.6 19.1"/>';
    string public constant unisock = '<path class="patternFill" d="m13.5 9 4.5 3v1l-4.5-3Zm0 0h3v1h-3v-1m5.5 3.5 10 6v1l-10-6Zm-11 10 4.5 3h1v-3h-1v2l-4.5-3Z"/><path class="patternOutline" style="stroke-width: 0.5; stroke-linejoin: round;" d="m10.5 15.5c0 3 1 4 4 4l-1-1m0 2 1-1m1-1c0-3-1-4-4-4l1-1m-1 1 1 1"/>';
    
}