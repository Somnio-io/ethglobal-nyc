// SPDX-License-Identifier: Pepega
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721 {
    function owner() external view returns (address owner);

    function ownerOf(uint256 tokenId) external view returns (address owner);
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    function transfer(address recipient, uint256 amount) external returns (bool);
}
