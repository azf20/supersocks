//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

library PatternLib {

    // Top patterns
    string public constant topBig = '<path d="M 6 2v4h13v-4Z" class="outlineColor"/><path d="M 7 3v2h11v-2Z" class="topColor"/>';
    string public constant topStripeNoOffset = '<path d="M 8 3v3h10v-3Z" class="topColor"/>';
    string public constant topOne = '<path d="M 8 4v1h10v-1Z" class="topColor"/>';
    string public constant topTwo = '<path d="M 8 4v1h10v-1Z" class="topColor"/><path d="M 8 6v1h10v-1Z" class="topColor"/>';
    string public constant topStripeThin = '<path d="M 8 3v2h10v-2Z" class="topColor"/>';
    string public constant topVerticalStripes = '<path d="M8.5 3v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Z" class="topColor"/>';
    string public constant topVerticalWithHorizontal = '<path d="M8.5 3v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Zm2 0v3h1V3Z" class="topColor"/><path d="M 8 6v1h10v-1Z" class="topColor"/>';
    
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
    string public constant designStar = '<path d="M13 8h.25v.25h.25v.5h.25v.5h.25v.5h1.5v.25h.25v.25h-.25 0v.25h-.25v.25h-.25v.25h-.25 0v.25h-.25 0v.5h.25v.5h.25v.5h.25v.75h-.75v-.25h-.5v-.25h-.5 0v-.25h-1v.25h-.5v.25h-.5v.25h-.75v-.75h.25v-.5h.25v-.5h.25v-.5h-.25v-.25h-.25v-.25h-.25v-.25h-.25v-.25h-.25v-.25h.25v-.25h1.5v-.5h.25v-.5h.25v-.5h.25v-.25h.25" class="designColor"/>';
    string public constant designDiamond = '<path d="M13 15h.5v-.5h.5v-.5h.5v-.5h.5v-.5h.5v-.5h.5v-.5h.5v-.5h.5v-.5h0 0v-.5h-.5v-.5h-.5v-.5h-.5-2.5m0 5.5h0v-.5h-.5v-.5h-.5v-.5h-.5v-.5h-.5v-.5h-.5v-.5h-.5v-.5h-.5v-1h.5v-.5h.5v-.5h2.5" class="designColor"/>';
    string public constant designSun = '<path d="M12.75 7.5h.4v.4h.4v.4h.4v.4h-2v-.4h.4v-.4h.4v-.4m-.4 1.6h1.2v.4h.8v.4h.4v.4.4h.4v1.2h-.4v.8h-.4v.4h-.8v.4h-1.2v-.4h-.8v-.4h-.4v-.8h-.4v-1.2h.4v-.8h.4v-.4h.8v-.4m2-.4h1.2v1.2h-.4v-.4h-.4v-.4h-.4v0-.4m1.2 1.6h.4v.4h.4v.4h.4v.4h-.4v.4h-.4v.4h-.4v-2m0 2.4h0v1.2h-1.2v-.4h.4v-.4h.4v-.4h.4m-1.6 1.2h-2v.4h.4v.4h.4v.4h.4v-.4h.4v-.4h.4v-.4m-2.4 0v-.4h-.4v-.4h-.4v-.4h-.4v1.2h1.2m-1.2-1.6v-2h-.4v.4h-.4v0h0v.4h-.4v.4h.4v.4h.4v.4h.4m1.2-3.6v.4h0v0h-.4v.4h-.4v.4h-.4v-1.2h1.2" class="designColor"/>';
    string public constant designMoon = '<path d="M12 8.5h2v.5h1v.5h.5v1h-.5v-.5h-2v.5h-.5v.5h-.5v1h.5v.5h.5v.5h2v-.5h.5v1h-.5v.559h-1v.441h-2v-.5h-1v-.5h-.5v-1h-.5v-2h.5v-1h.5v-.5h1v-.5" class="designColor" />'; 
    string public constant designPaw = '<path d="M12.25 10.75h1.5v.5h.5v.5h.5v.5h.5v.5 0h.5v1h-.5v.5h-.5v.5h-1.5v-.5h-.5 0v.5h-1.5 0v-.5h-.5v-.5h-.5v-1h.5v-.5h.5v-.5h.5v-.5h.5v-.5m-1 0h0v.5h-.5v.5h-1v-1.5h.5v-.5h.5v.5h.5v.5m.5-.5v-.5h-.5v-1.5h.5v-.5h.5v.5h.5v1.5h-.5v.5h-.5m1.5-2h.5v-.5h.5v.5h.5v1.5h-.5v.5h-.5v-.5h-.5v-1.5m1.5 2h.5v-.5h.5v.5h.5v1.5h-1v-.5h-.5v-1" class="designColor"/>';
    string public constant designUmbrella = '<path d="M12.5 8h.75v.75h.75v.75h1.5v.75h.75v2.25h-.75v-.75h-.75v.75h-.75v-.75h-.75v3.75h-1.5v-.75h.75v-3h-.75v.75h-.75v-.75h-.75v.75h-.75v-2.25h.75v-.75h1.5v-.75h.75v-.75" class="designColor"/>';
    string public constant designWarrior = '<path d="M12.5 9h1.65v.66h-1.65v-.66m0 .66h0v1.32h.66v-.33h0 0v-.66h-.33v-.33m1.32 0h0v1.32h-.66 0v0h-.33v-.33h.33v-.66h.33v-.33m-1.65.33v0h-.33v.33h-.33v.99 0h.33v.66h.33v.33h2.31v-.33h.33v-.66 0h.33v-.99h-.33v-.33h-.33v1.32h-2.31 0v-1.32m0 2.64h2.31v1.65h-.99v-.99h-.33v.99h-.99v-1.65m2.64-.33h.33v-.66h.33v1.32h-.66v-.66m-3.2957.0129h-.6643v.3171h-.33v-.33h-.33v-.99h.33 0v-1.98h-.33v.33h-.33v-1.32h.33v.33h.33v-.33h.33v.33h.33v-.33h.33v1.32h-.33v-.33h-.33v1.98h.33v.33 0h.33v.66" class="designColor"/>';
    string public constant designWarrior2 = '<path d="M12.1 8.4h1.6v.4h.4v.4h.4v-1.2h.4v1.6 0h-.4-.4-2.4-.8v-1.6h.4v1.2h.4v-.4h.4v-.4m-.4 1.2v.4h.4v-.4m.4.4v-.4h.4v.4h-.4m.8-.4v.4h.8 0v-.4m-2.4.4v1.2h-.4v.4h-.4v-1.6h-.4v1.6h-.4v.4h.4v.4h.8v-.4h.4v-.4h.4v1.2h-.4v.4h.4v1.6h.4v-1.6h.8v1.6h.4v-1.6h.4v-.4h-.4v-1.6h.4v-1.2h-2.4m2.4 1.2h1.6v1.6h-1.6v-1.6" class="designColor"/>';
    string public constant designMagician = '<path d="M11.9 10h2.1.42v-.42h-.42v-2.1h-2.1v2.1h-.42v.42h.42.84v.42h.42v-.42h.42m-1.68.42v-.42h.42v.42h-.42m1.68 0v-.42h.42v.42h-.42m-1.68 0v0h2.1v.42h-.42v.42h-1.26v-.42h-.42v-.42m0 .42h-.42 0v2.1h.42v1.26h.42v.42h.42v-.42h.42v.42h.42v-.42h.42v-1.26h.42v-2.1h-.42v.42h-.42 0v.42h-1.26v-.42h-.42" class="designColor"/>';
    string public constant designSunGlasses = '<path d="M13.25 12h4v-.5h-4-.5-4v.5h4 .5m-4 0h0v.5h.5v-.5h-.5m.5.5h.5v.5h-.5v-.5m.5-.5v.5h2.5 0v-.5h-2.5m0 1v.5h.5v-.5m-.5 0v0h.5v0m0-.5h0v1h1v-.5h.5v-.5h-1.5m2.5-.5v.5h.5v-.5h-.5m.5.5v.5 0h.5v-.5h-.5m.5-.5v.5h2.5v-.5h-2.5m0 1v.5h1.25v-.5h-1.25m.5-.5h0v.5h1.5v-.5h-1.5" class="designColor"/>';
    string public constant designLightningBolt = '<path d="M12.5 8h3v.5h-.5v.5h-.5v.5h-.5v.5h-.5v.5h1.5v.5h-.5v.5h-.5v.5h-.5v.5h-.5v.5h-.5v.5 0h-.5v.5h-.5v-1h.5v-1h.5v-1h-1.5v-.5h.5v-1h.5v-1h.5v-.5m-1.5 6h.5v.5h-.5v-.5" class="designColor"/>';
    string public constant designKey = '<path d="M10 9.5h1.8v.6h-1.8v-.6m0 .6h.6v.6h-.6v.6h.6v1.2h-.6v-.6h-.6v-1.8h.6m.6 1.8v.6 0h1.2v-.6h.6v-.6h-1.2v.6h-.6m.6-1.8v.6h.6v.6h.6v-.6h0v-.6h-.6m.6.6h1.8 2.4v.6h-.6v1.2h-.6v-.6h-.6v.6h-.6v-1.2h-1.8v-.6" class="designColor"/>';
    string public constant designNotes = '<path d="M10.7 8.8h1.08v.36h.36v.36h.36v.72h-.36v.36h-.36v-.72h-.36v-.36h-.36v1.8h0v1.08h-.36v.36h-.72v-.36h-.36v-.72h.36v-.36h.72v-2.52m1.08 1.8h-.36v.36h.36v-.36m.36.72h2.16v.36h-2.16v-.36m0 .36v.36h.36v-.36m1.44 0h0v.36h.36v-.36m-2.16.36h2.16 0v2.52h-.36v.36h-.72v-.36h-.36v-.72h.36v-.36h.72v-1.08h-1.44v2.16h-.36v.36h-.72v-.36h-.36v-.72h.36v-.36h.72v-1.44m3.24-.72h.72v-2.52h.36v3.6h-.36v.36h-.72v-.36h-.36v-.72h.36v-.36" class="designColor"/>';
    string public constant designOctopus = '<path d="M11.5 7.625h3v.75h.75v.75h.75v.75h-6v-.75h.75v-.75h.75v-.75m-1.5 2.25h1.5v.75h-1.5v-.75m2.25.75v-.75h1.5v.75h-1.5m2.25 0v-.75h1.5v.75h-1.5m-3.75 0h0v.75h.75v.75h-.75v.75h-.75v.75h1.5v-.75h.75v.75h1.5v-.75h.75v.75h1.5v-.75h-.75v-.75h-.75v-.75h.75v-.75h-4.5" class="designColor"/>';
    string public constant designSquid = '<path d="M10.9 12h4.2v-.7h.7v-1.4h-.7v-.7h-.7v-.7h-.7-2.1v.7h-.7v.7h-.7v1.4h.7v.7m0 0h0v.7h.7v-.7h-.7m1.4 0v.7h1.4v-.7h-1.4m2.1 0v.7h.7v-.7h-.7m-2.8.7h2.8v.7h-.7v.7h-1.4v-.7h-.7v-.7m0 .7h-.7v.7h.7v-.7m2.8 0v.7h.7v-.7h-.7" class="designColor"/>';
    string public constant designMonster = '<path d="M10.6 10h4.8v-.8h-.8v-.8h-.8-2.4v.8h-.8 0v.8h-.8v1.6h.8v.8h.8v-2.4m.8 0v.8h1.6v-.8h-1.6m2.4.8h0v-.8h1.6v1.6h-.8v.8h-.8v.8h-.8v-1.6h-1.6v1.6 0h-.8v-2.4h3.2m-3.2-2.4v-.8h-.8v.8h.8m3.2 0v-.8h.8v.8h-.8m-4 4h-.8v1.6h.8v-1.6m4.8 0v1.6h.8v-1.6h-.8" class="designColor"/>';
    string public constant designDaimo = '<path d="M9.75 8H10V7.75H10.25V7.5H11V7.25H12V7H14V7.25H15V7.5H15.75V7.75H16.25V8.25H15.5V8H15.25V7.75H14.5V7.5H11.5V7.75H10.75V8H10.5V8.25H9.75V8M10 8.25V8.75H10.25V9H10.5V9.5H10.75V9.75H10.75V10H11V10.5H11.25V10.75H11.5V11 11.25H11.75V11.75H12V12.25H12.25V11.5 11.5H12.25 12V11H11.75V10.5H11.5V10H11.25V9.5H11V9.25H10.75V8.75H10.5V8.25H10M12.25 11.5V11H12V10.25H11.75V9.25H11.5V8.5H11.25V8.25H11.5V8H11.75V8H12V7.75H13.25V8H14.25V8.25H15.5 15.5 15.5V8.75H14.25V8.5H13.5V8.25H11.75V8.75H12V9.5H12.25V10.5H12.5V11H12.75V12.25H13V12.75 13.5H12.75V13H12.5V12.5H12.25V12.25M15.5 8.75H15.25V9.25H15V9.5H14.75V10H14.5V10.5H14.25 14.25V11H14V11.25H13.75V11.75H13.5V12.25H13.25V12.75H13V13.5H13.25V13H13.5V12.5H13.75V12.25H14V11.75H14.25V11.5 11.25H14.5V10.75H14.75V10.5H15V10.25 10H15.25V9.5H15.5V9.25H15.75V9 8.75H16V8.5 8.25" class="designColor"/>';

    // Legacy patterns (keeping for compatibility)
    string public constant optimism = '<path d="m10 15v3h2v-3Z" class="patternOutline"/><path d="m13.5 18.5v-3.5h2v2h-2" class="patternOutline"/><path d="m21 15v3h2v-3Z" class="patternOutline"/><path d="m24.5 18.5v-3.5h2v2h-2" class="patternOutline"/>';
    string public constant base = '<path d="m13 14h1v1h1v3h-1v1h-2v-1h-1v-1.25h2v-0.5h-2v-1.25h1v-1Z" class="patternFill"/><path d="m24 14h1v1h1v3h-1v1h-2v-1h-1v-1.25h2v-0.5h-2v-1.25h1v-1Z" class="patternFill"/>';
    string public constant across = '<path class="patternOutline" d="M25 16.5L26.6 14.9 M24 16.5L22.4 14.9 M25 17.5L26.6 19.1 M24 17.5L22.4 19.1 M13.2 16.5L14.8 14.9 M12.2 16.5L10.6 14.9 M13.2 17.5L14.8 19.1 M12.2 17.5L10.6 19.1"/>';
    string public constant unisock = '<path class="patternFill" d="m13.5 9 4.5 3v1l-4.5-3Zm0 0h3v1h-3v-1m5.5 3.5 10 6v1l-10-6Zm-11 10 4.5 3h1v-3h-1v2l-4.5-3Z"/><path class="patternOutline" style="stroke-width: 0.5; stroke-linejoin: round;" d="m10.5 15.5c0 3 1 4 4 4l-1-1m0 2 1-1m1-1c0-3-1-4-4-4l1-1m-1 1 1 1"/>';
    
}