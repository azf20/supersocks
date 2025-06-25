//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './Renderer.sol';
import './PatternLib.sol';

contract Example is Renderer {

    constructor() {
        designs.push('');
        designs.push(PatternLib.optimism);
        designs.push(PatternLib.base);
        designs.push(PatternLib.across);
        designs.push(PatternLib.unisock);
    }
    
    function sock1() internal view returns (string memory) {
        return renderSock(Sock({
            baseColorIndex: 10,
            top: Top({
                offset: 1,
                stripes: 3,
                thickness: 1,
                gap: 1,
                colorIndex: 2
            }),
            design: Style({
                colorIndex: 9,
                index: 3
            }),
            heel: Style({
                colorIndex: 4,
                index: 0
            }),
            toe: Style({
                colorIndex: 14,
                index: 1
            })
        }), 1);
    }

    function sock2() internal view returns (string memory) {
        return renderSock(Sock({
            baseColorIndex: 0,
            top: Top({
                offset: 0,
                stripes: 0,
                thickness: 0,
                gap: 0,
                colorIndex: 0
            }),
            design: Style({
                colorIndex: 4,
                index: 1
            }),
            heel: Style({
                colorIndex: 0,
                index: 0
            }),
            toe: Style({
                colorIndex: 0,
                index: 0
            })
        }), 2);
    }

    function sock3() internal view returns (string memory) {
        return renderSock(Sock({
            baseColorIndex: 0,
            top: Top({
                offset: 1,
                stripes: 2,
                thickness: 1,
                gap: 1,
                colorIndex: 12
            }),
            design: Style({
                colorIndex: 12,
                index: 4
            }),
            heel: Style({
                colorIndex: 12,
                index: 1
            }),
            toe: Style({
                colorIndex: 0,
                index: 0
            })
        }), 3);
    }

    function example() external view returns (string memory) {
        string memory _sock1 = sock1();
        string memory _sock2 = sock2();
        string memory _sock3 = sock3();
    
        return string.concat(_sock1, _sock2, _sock3);
    }
    
}
