//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import './SVG.sol';
import './Utils.sol';

contract Renderer {
    function render(uint256 _tokenId) public pure returns (string memory) {
        return
            string.concat(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" style="background:#000">',
                svg.text(
                    string.concat(
                        svg.prop('x', '20'),
                        svg.prop('y', '40'),
                        svg.prop('font-size', '22'),
                        svg.prop('fill', 'white')
                    ),
                    string.concat(
                        svg.cdata('I delegated my EOA')
                    )
                ),
                svg.text(
                    string.concat(
                        svg.prop('x', '20'),
                        svg.prop('y', '90'),
                        svg.prop('font-size', '18'),
                        svg.prop('fill', 'white')
                    ), svg.cdata('And all I got was this lousy NFT')
                ),
                svg.rect(
                    string.concat(
                        svg.prop('fill', 'green'),
                        svg.prop('x', '20'),
                        svg.prop('y', '55'),
                        svg.prop('width', utils.uint2str(160)),
                        svg.prop('height', utils.uint2str(10))
                    ),
                    utils.NULL
                ),
                '</svg>'
            );
    }

    function example() external pure returns (string memory) {
        return render(1);
    }
}
