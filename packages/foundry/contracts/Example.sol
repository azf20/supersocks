//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './NewRenderer.sol';
import './PatternLib.sol';

contract Example is Renderer {

    constructor() {
        // Design patterns (index 0)
        addStyle(0, ''); // Empty design
        addStyle(0, PatternLib.designSmile);
        
        // Heel patterns (index 1)
        addStyle(1, ''); // Empty heel
        addStyle(1, PatternLib.heel);
        addStyle(1, PatternLib.heelBig);
        
        // Toe patterns (index 2)
        addStyle(2, ''); // Empty toe
        addStyle(2, PatternLib.toe);
        addStyle(2, PatternLib.toeBig);
        
        // Top patterns (index 3)
        addStyle(3, ''); // Empty top
        addStyle(3, PatternLib.topOne);
        addStyle(3, PatternLib.topTwo);
        addStyle(3, PatternLib.topStripeNoOffset);
        addStyle(3, PatternLib.topStripeThin);
        addStyle(3, PatternLib.topBig);
        addStyle(3, PatternLib.topVerticalStripes);
        addStyle(3, PatternLib.topVerticalWithHorizontal);
    }
    
    function sock1() internal view returns (string memory) {
        return renderSock(Sock({
            baseColorIndex: 4,
            outlineColorIndex: 11,
            top: Style({
                colorIndex: 2,
                index: 7
            }),
            design: Style({
                colorIndex: 1,
                index: 1
            }),
            heel: Style({
                colorIndex: 0,
                index: 2
            }),
            toe: Style({
                colorIndex: 14,
                index: 2
            })
        }), 1);
    }

    function sock2() internal view returns (string memory) {
        return renderSock(Sock({
            baseColorIndex: 1,
            outlineColorIndex: 2,
            top: Style({
                colorIndex: 2,
                index: 1
            }),
            design: Style({
                colorIndex: 9,
                index: 0
            }),
            heel: Style({
                colorIndex: 4,
                index: 1
            }),
            toe: Style({
                colorIndex: 14,
                index: 1
            })
        }), 2);
    }

    function example() external view returns (string memory) {
        string memory _sock1 = sock1();
        string memory _sock2 = sock2();
    
        return string.concat(_sock1, _sock2);
    }
    
}
