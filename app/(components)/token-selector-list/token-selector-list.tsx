"use client";

import { useEffect, useState } from "react";
import { TokenSelector } from "../token-selector/token-selector";

interface TokenSelectorListProps {
  account: string;
}

// interface QNApiResponse {
//   tokens: QNToken[];
// }

// interface QNToken {
//   collectionName: string;
//   collectionTokenId: string;
//   collectionAddress: string;
//   name: string;
//   description: string;
//   imageUrl: string;
//   traits: any[];
//   chain: string;
//   network: string;
// }

interface AlchemyNFTResponse {
  tokens: AlchemyNFT[];
}

export interface AlchemyNFT {
  contract: Contract;
  tokenId: string;
  tokenType: string;
  title: string;
  description: string;
  timeLastUpdated: string;
  rawMetadata: RawMetadata;
  tokenUri: TokenUri;
  media: Media[];
  balance: number;
  metadataError?: string;
  spamInfo?: SpamInfo;
}

interface SpamInfo {
  isSpam: boolean;
  classifications?: string[];
}

interface Media {
  gateway: string;
  raw: string;
  format: string;
  thumbnail: string;
  bytes: number;
}

interface TokenUri {
  gateway: string;
  raw: string;
}

interface RawMetadata {
  name?: string;
  description?: string;
  image?: string;
  animation_url?: string;
  attributes?:
    | Attribute[]
    | any[]
    | Attributes3[]
    | Attributes4[]
    | Attributes5
    | Attributes6[];
  external_url?: string;
  image_details?: Imagedetails;
  image_url?: string;
  created_by?: string;
  edition?: number;
  provenance?: string;
  background_image?: string;
  last_request_date?: number;
  is_normalized?: boolean;
  version?: number;
  url?: string;
  metadata?: any[];
  thumbnail?: string;
  compiler?: string;
  symbol?: string;
  date?: number;
  author?: string;
  properties?: Properties;
}

interface Properties {
  name: string;
  number: number;
}

interface Imagedetails {
  format: string;
  width: number;
  sha256: string;
  bytes: number;
  height: number;
}

interface Attributes6 {
  display_type: string;
  value: number | string;
  trait_type: string;
}

interface Attributes5 {
  head: string;
  glasses: string;
  jewelry: string;
  ears: string;
  id_hash: number;
  body: string;
}

interface Attributes4 {
  value: string;
  trait_type: string;
}

interface Attributes3 {
  value: number | string;
  trait_type: string;
}

interface Attribute {
  value: number | string;
  trait_type: string;
  display_type?: string;
}

interface Contract {
  address: string;
  tokenType: string;
  openSea: OpenSea;
  contractDeployer: string;
  deployedBlockNumber: number;
  name?: string;
  symbol?: string;
  totalSupply?: string;
}

interface OpenSea {
  floorPrice?: number;
  collectionName?: string;
  safelistRequestStatus?: string;
  imageUrl?: string;
  description?: string;
  externalUrl?: string;
  twitterUsername?: string;
  discordUrl?: string;
  lastIngestedAt: string;
}

export interface FormattedCollections {
  [contractAddress: string]: AlchemyNFT[];
}

export function TokenSelectorList({ account }: TokenSelectorListProps) {
  const [loading, setLoading] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<AlchemyNFT[]>([]);
  const [content, setContent] = useState<FormattedCollections>({});

  // const formatCollections = (tokenData: AlchemyNFT[]) => {
  //   let result: FormattedCollections = {};

  //   const filteredTokenData = tokenData.filter((item: AlchemyNFT) => item.tokenType === "ERC721")

  //   for (const token of filteredTokenData) {
  //     if(!result[token.contract.address]) {
  //       result[token.contract.address] = [];
  //     }
  //     result[token.contract.address].push(token)
  //   }

  //   console.log("Result =>", result)

  //   return result;
  // }

  useEffect(() => {
    const _fetch = async () => {
      const data = await fetch(`/dashboard/api/tokens?account=${account}`, {
        method: "GET",
        headers: {},
      });
      const jsonData = await data.json();
      setContent(jsonData.tokens);
      setLoading(false);
    };
    _fetch();
  }, []);

  if (loading) {
    return <p>Loading..</p>;
  }

  console.log("Content => ", content);

  return (
    <>
      <div className={`max-h-[225px] overflow-y-scroll`}>
        {Object.values(content).length
          ? Object.values(content).map((tokens, i) => (
              <TokenSelector {...tokens} key={i} />
            ))
          : null}
      </div>
      <button className="mt-5 border border-white h-[50px]">SAVE</button>
    </>
  );
}
