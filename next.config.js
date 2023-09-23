/** @type {import('next').NextConfig} */

const Networks = {
  ETH_MAINNET: "eth-mainnet",
  ETH_ROPSTEN: "eth-ropsten",
  ETH_GOERLI: "eth-goerli",
  ETH_KOVAN: "eth-kovan",
  ETH_RINKEBY: "eth-rinkeby",
  ETH_SEPOLIA: "eth-sepolia",
  OPT_MAINNET: "opt-mainnet",
  OPT_KOVAN: "opt-kovan",
  OPT_GOERLI: "opt-goerli",
  ARB_MAINNET: "arb-mainnet",
  ARB_RINKEBY: "arb-rinkeby",
  ARB_GOERLI: "arb-goerli",
  MATIC_MAINNET: "polygon-mainnet",
  MATIC_MUMBAI: "polygon-mumbai",
  ASTAR_MAINNET: "astar-mainnet",
  POLYGONZKEVM_MAINNET: "polygonzkevm-mainnet",
  POLYGONZKEVM_TESTNET: "polygonzkevm-testnet",
  BASE_MAINNET: "base-mainnet",
  BASE_GOERLI: "base-goerli",
};

const deployedContractAddress = {
  MATIC_MAINNET: "0x07F0c0C9eFC242FaD26Ab0e91e38ea3D73cBd267",
  MATIC_MUMBAI: "0x53D877fcFA8C0D38F9551cB0437b42C54DB1D060",
};

const deployedContract = "0x07F0c0C9eFC242FaD26Ab0e91e38ea3D73cBd267";
const currentNodeEndpoint = "";

console.log(`Contract is -> ${deployedContract}`);
console.log(`Endpoint is -> ${currentNodeEndpoint}`);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    FEATURE_QUICKNODE_ENDPOINT: currentNodeEndpoint,
    FEATURE_ENABLE_GASLESS_TRANSACTIONS: false, // https://ethglobal.com/events/newyork2023/prizes#biconomy
    FEATURE_TARGET_NETWORK: Networks["MATIC_MAINNET"],
    FEATURE_ENABLE_QUICKNODE: false, // https://ethglobal.com/events/newyork2023/prizes/quicknode-64ekr
    FEATURE_ENABLE_ALCHEMY: false, // No bounty - but required for access to many chains ERC721 data
    FEATURE_ENABLE_AIRSTACK: true, // https://ethglobal.com/events/newyork2023/prizes#airstack

    FEATURE_ENABLE_TIPPING_TOKEN: false, // https://ethglobal.com/events/newyork2023/prizes/apecoin-dao-mu0vz
    FEATURE_ENABLE_TIPPING_TOKEN_ADDRESS: "", // What token will be used for tipping? -> https://ethglobal.com/events/newyork2023/prizes/apecoin-dao-mu0vz - https://ethglobal.com/events/newyork2023/prizes/aave-grants-dao-ac2mc
    NEXT_PUBLIC_FEATURE_DEPLOYED_CONTRACT_ADDRESS: deployedContract,

    FEATURE_ENABLE_STREAMING_ENDPOINT: "rtmps://b9e19e28061f.global-contribute.live-video.net:443/app/",
  },
  images: {
    // For anything other than a hackathon, lock this down..
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
