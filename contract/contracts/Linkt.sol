// SPDX-License-Identifier: Pepega
// Tons of great inspiration from https://github.com/Vectorized/solady
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

enum AudienceType {
    ALL,
    HOLDERS,
    TRAITS,
    TOKEN
}

struct Audience {
    AudienceType audienceType;
    uint256 tokenId;
}

contract Linkt is Ownable {
    struct Publication {
        uint256 videoId;
        address publisher;
        string md5Hash;
        address erc721Address;
        Audience audience;
    }

    IERC20 public tippingToken;

    event NewPublication(uint256 indexed videoId, address indexed erc721Address, address publisher, string md5Hash);
    event Tipped(address indexed tipper, address indexed erc721Address, uint256 amount);
    event Withdrawn(address indexed publisher, address indexed erc721Address, uint256 amount);

    mapping(address => uint256) public tips;
    mapping(address => Publication[]) public publications;
    mapping(address => mapping(address => uint256)) public userTokenMappings;
    mapping(address => address[]) public userErc721Addresses;

    constructor(address _tippingTokenAddress) {
        tippingToken = IERC20(_tippingTokenAddress);
    }

    modifier onlyERC721Owner(address _erc721Address) {
        IERC721 erc721 = IERC721(_erc721Address);
        require(erc721.owner() == msg.sender, "You must be the owner of the ERC721 contract");
        _;
    }
}
