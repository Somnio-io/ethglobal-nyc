import { NextRequest, NextResponse } from "next/server";
//@ts-ignore
import { Core } from "@quicknode/sdk";
import { Network, Alchemy } from "alchemy-sdk";
import { fetchQuery, init } from "@airstack/node";

interface FormattedTraits {
  [contractAddress: string]: string[];
}

export async function GET(request: NextRequest) {
  // const account = request.nextUrl.searchParams.get("account");
  let response = [];

  // if (!account) {
  //   return NextResponse.json({ message: "Missing account param" }, { status: 400 });
  // }

  // if (process.env.FEATURE_ENABLE_QUICKNODE) {
  //   let network = process.env.FEATURE_TARGET_NETWORK as Network | string;

  //   if (!(network === "eth-mainnet" || network === "polygon-mainnet")) {
  //     return NextResponse.json({
  //       message: "Unsupported network - Quicknode supports ethereum or polygon",
  //     });
  //   }

  //   const core = new Core({
  //     endpointUrl: process.env.FEATURE_QUICKNODE_ENDPOINT,
  //     config: {
  //       addOns: {
  //         nftTokenV2: true,
  //       },
  //     },
  //   });
  //   const _response = await core.client.qn_fetchNFTs({
  //     wallet: account,
  //     perPage: 10,
  //   });
  //   response = _response.assets;
  // }
  // if (process.env.FEATURE_ENABLE_ALCHEMY) {
  //   // Optional Config object, but defaults to demo api-key and eth-mainnet.
  //   const settings = {
  //     apiKey: process.env.ALCHEMY_API_KEY as string,
  //     network: process.env.FEATURE_TARGET_NETWORK as Network,
  //   };

  //   const alchemy = new Alchemy(settings);
  //   const _response = await alchemy.nft.getNftsForOwner(account);
  //   response = _response.ownedNfts;

  //   // well, we only care about erc721's firstly.. and only ones that are published on our platform.
  //   // so filter reponse based on that.
  // }
  if (process.env.FEATURE_ENABLE_AIRSTACK) {
    let network = process.env.FEATURE_TARGET_NETWORK as Network | string;

    if (!(network === "eth-mainnet" || network === "polygon-mainnet")) {
      return NextResponse.json({
        message: "Unsupported network - Airstack supports ethereum or polygon",
      });
    }

    if (network === "eth-mainnet") {
      network = "ethereum";
    } else {
      network = "polygon";
    }

    init(process.env.FEATURE_ENABLE_AIRSTACK_API_KEY as string, "dev");

    const listNftsForAddress = `query MyQuery {
      Ethereum: TokenBalances(
        input: {filter: {tokenAddress: {_eq: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"}, tokenType: {_eq: ERC721}}, blockchain: ethereum, limit: 50}
      ) {
        TokenBalance {
          token {
            tokenTraits
          }
        }
      }
      Polygon: TokenBalances(
        input: {filter: {tokenAddress: {_eq: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"}, tokenType: {_eq: ERC721}}, blockchain: polygon, limit: 50}
      ) {
        TokenBalance {
          token {
            tokenTraits
          }
        }
      }
    }`;
    //console.log(listNftsForAddress);

    const { data, error } = await fetchQuery(listNftsForAddress);
    console.log("Data / Error => ", data, error);
    //console.log("Data", data.Ethereum.TokenBalance);

    let result: FormattedTraits = {};

    for (const [key, value] of Object.entries(data.Ethereum.TokenBalance[0].token.tokenTraits)) {
      //console.log("Key Value => ", key);
      //console.log("Key Value => ", Object.keys(value as {}));

      result[key] = Object.keys(value as {});
      // if (!result[key]) {
      //   result[key] = [];
      // }
      //   console.log("Token => ", token);
      //   const _token: FormattedToken = {
      //     name: token.token.name,
      //     address: token.tokenAddress,
      //     id: token.tokenId,
      //     image: token.tokenNfts.contentValue.image ? token.tokenNfts.contentValue.image.small : "",
      //     thumbnail: token.tokenNfts.contentValue.image ? token.tokenNfts.contentValue.image.small : "",
      //   };
      // result[key].push(value);
    }

    console.log("Result =>", result);

    response = result as any;
  }

  return NextResponse.json({ tokens: response });
}
