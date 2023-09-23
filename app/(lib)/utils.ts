import { EAudience } from "@/(components)/video/input-video-upload";
import { type ClassValue, clsx } from "clsx";
import { Dispatch, SetStateAction } from "react";
import { twMerge } from "tailwind-merge";
import { Contract, BrowserProvider } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ContentKey {
  id: string;
  name: string;
  description: string;
  data: Content;
}

export interface Content {
  url: string;
  created: Date | undefined;
  size: number | undefined;
  extension: string | undefined;
}

export interface Video {
  id: string;
  name: string;
  description: string;
  placeholderUrl: string;
  publisher: string;
  url: string;
  audience: EAudience;
}

interface IPrepareTransaction {
  address: `0x${string}`;
  abi: any;
}

export const uploadToS3 = (
  uploadUrl: string,
  fileData: File,
  contentType: string,
  setProgress: Dispatch<SetStateAction<number>>
) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve("Upload completed successfully.");
      } else {
        reject(new Error("Upload failed."));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("An error occurred while transferring the file."));
    });

    xhr.send(fileData);
  });
};

export const transformData = (originalData: any[]) => {
  // Array to hold transformed objects
  const transformedArray = [];

  // Loop over each key-value pair in the original object
  for (const [key, valueArray] of Object.entries(originalData)) {
    // Initialize fields for the new object
    let id = key;
    let name = "";
    let description = "";
    let placeholderUrl = "";
    let publisher = "";
    let url = "";
    let audience = "ALL"; // Default value

    // Iterate over the array of objects to populate the fields
    for (const item of valueArray) {
      if (item.name && item.description) {
        // Prefer items with name and description for these fields
        name = item.name;
        description = item.description;
      }
      publisher = item.publisher;
      if (item.audience) {
        audience = item.audience;
      }

      // Check the extension for url and placeholderUrl
      if (item.data.extension === "mp4") {
        url = item.data.url;
      } else if (!item.name && !item.description) {
        placeholderUrl = item.data.url;
      }
    }

    // Create a new object and push it to the transformed array
    transformedArray.push({
      id,
      name,
      description,
      placeholderUrl,
      publisher,
      url,
      audience,
    });
  }
  //  as TransformedResponse[]
  return transformedArray as unknown as Video[];
};

// export const prepareTransaction = async ({
//   address,
//   abi,
// }: IPrepareTransaction) => {
//   const provider = new BrowserProvider(window.ethereum);
//   const signer = await provider.getSigner();

//   const contract = new Contract(
//     process.env.FEATURE_DEPLOYED_CONTRACT_ADDRESS as string,
//     abi,
//     signer
//   );

//   // Prepare transaction
//   const txRequest = await contract.populateTransaction.doSomething(); // Replace with your method
//   const tx = await signer.signTransaction(txRequest);

//   // Send the signed transaction to your server
//   fetch("/api/sponsorTransaction", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ signedTransaction: tx }),
//   });
// };

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

export const BASE_URL =
  "https://q2p3u7dpgi.execute-api.us-east-1.amazonaws.com/prod";

export const LIVE_URL = `${BASE_URL}/live`;

export const CONTENT_URL = `${BASE_URL}/assets`;

export const UPLOAD_URL = `${BASE_URL}/upload`;

export const USER_URL = `${BASE_URL}/user`;
