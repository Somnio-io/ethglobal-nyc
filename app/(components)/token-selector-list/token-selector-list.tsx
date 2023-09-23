"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { LINKT_ABI } from "@/(lib)/utils";
import { FormattedToken } from "@/dashboard/api/tokens/route";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

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
  attributes?: Attribute[] | any[] | Attributes3[] | Attributes4[] | Attributes5 | Attributes6[];
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

interface FormattedSelection {
  contracts: string[];
  tokens: string[];
}

export function TokenSelector(tokens: any[]) {
  const [selected, setSelected] = useState<FormattedToken>();
  const _tokens = Object.values(tokens);

  //console.log("Collection =>", _tokens)

  if (!_tokens) {
    return <p>Loading...</p>;
  }

  if (!_tokens.length) return null;

  return (
    <div
      className={`flex items-center gap-10 hover:opacity-50 h-[50px] cursor-pointer stroke-primary stroke-2 bg-transparent border ${
        selected ? "border-green-500" : "border-red-500"
      }`}
    >
      {/* <Checkbox /> */}
      <DropdownMenu>
        <DropdownMenuTrigger className={`w-full m-5`} asChild>
          <span>
            {_tokens[0].name} {selected ? selected.id : null}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {_tokens.map((token) => (
            <DropdownMenuItem key={token.id} onClick={() => setSelected(token)}>
              <Image unoptimized={true} src={token.thumbnail} height={50} width={50} alt={token.id} />
              {token.id}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function TokenSelectorList({ account }: TokenSelectorListProps) {
  const [loading, setLoading] = useState(true);
  const [selectedTokens, setSelectedTokens] = useState<FormattedSelection>({ contracts: [], tokens: [] });
  const [content, setContent] = useState<FormattedCollections>({});

  useEffect(() => {
    const _fetch = async () => {
      const data = await fetch(`/dashboard/api/tokens?account=${account}`, {
        method: "GET",
        headers: {},
      });

      if (data.ok) {
        console.log("API: ", data);
        const jsonData = await data.json();
        setContent(jsonData.tokens);
      }

      setLoading(false);
    };
    _fetch();
  }, []);

  useContractRead({
    abi: LINKT_ABI,
    enabled: Boolean(true),
    functionName: "getUserTokenMapping",
    onSuccess(data: any) {
      console.log("DATAAAAA ::::", data);
      setSelectedTokens({ contracts: data[0], tokens: data[1] });
    },
    args: [account],
    address: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS as `0x${string}`,
  }) as any;

  if (loading) {
    return <p>Loading..</p>;
  }

  console.log("Content => ", content);

  return (
    <>
      <div className={`max-h-[225px] overflow-y-scroll`}>
        {Object.values(content).length ? Object.values(content).map((tokens, i) => <TokenSelector key={i} {...tokens} />) : null}
      </div>
      <button className="mt-5 border border-white h-[50px]">SAVE</button>
    </>
  );
}
