export const LINKT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_tippingTokenAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "videoId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "erc721Address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "publisher",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "md5Hash",
        type: "string",
      },
    ],
    name: "NewPublication",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tipper",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "erc721Address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Tipped",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "publisher",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "erc721Address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_erc721Addresses",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_tokenIds",
        type: "uint256[]",
      },
    ],
    name: "addUserTokenMapping",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_erc721Address",
        type: "address",
      },
    ],
    name: "getPublicationCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
    ],
    name: "getUserTokenMapping",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_erc721Address",
        type: "address",
      },
      {
        internalType: "address",
        name: "_requester",
        type: "address",
      },
    ],
    name: "listPublications",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "videoId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "publisher",
            type: "address",
          },
          {
            internalType: "string",
            name: "md5Hash",
            type: "string",
          },
          {
            components: [
              {
                internalType: "enum AudienceType",
                name: "audienceType",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
              },
            ],
            internalType: "struct Audience",
            name: "audience",
            type: "tuple",
          },
        ],
        internalType: "struct Linkt.PublicationInfo[]",
        name: "publicationInfos",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "publications",
    outputs: [
      {
        internalType: "uint256",
        name: "videoId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "publisher",
        type: "address",
      },
      {
        internalType: "string",
        name: "md5Hash",
        type: "string",
      },
      {
        internalType: "address",
        name: "erc721Address",
        type: "address",
      },
      {
        components: [
          {
            internalType: "enum AudienceType",
            name: "audienceType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        internalType: "struct Audience",
        name: "audience",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_videoId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_md5Hash",
        type: "string",
      },
      {
        internalType: "address",
        name: "_erc721Address",
        type: "address",
      },
      {
        components: [
          {
            internalType: "enum AudienceType",
            name: "audienceType",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        internalType: "struct Audience",
        name: "_audience",
        type: "tuple",
      },
    ],
    name: "publishVideo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_erc721Address",
        type: "address",
      },
    ],
    name: "tipContentCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "tippingToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "tips",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userErc721Addresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userTokenMappings",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_erc721Address",
        type: "address",
      },
    ],
    name: "withdrawTips",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
