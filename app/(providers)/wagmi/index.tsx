import React from "react";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
// import { ChainId } from "@biconomy/core-types";
// import SmartAccount from "@biconomy/smart-account";
import {
  polygonMumbai,
  goerli,
  arbitrum,
  mainnet,
  optimism,
  polygon,
  gnosis,
  base,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import {
  walletConnectWallet,
  rainbowWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { rainbowWeb3AuthConnector } from "./Web3RainbowKitConnector";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    polygonMumbai,
    polygon,
    arbitrum,
    goerli,
    mainnet,
    optimism,
    gnosis,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [goerli, polygonMumbai]
      : []),
  ],
  [publicProvider()]
);

const connectorProps = {
  chains,
  projectId: "992ba7401ca2e5a28d14133ea026b30b", // Wallet Connect ProjectId
};

const connectors = connectorsForWallets([
  {
    groupName: "Linkt",
    wallets: [
      rainbowWallet(connectorProps),
      walletConnectWallet(connectorProps),
      metaMaskWallet(connectorProps),
      rainbowWeb3AuthConnector(connectorProps),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// const options = {
//   activeNetworkId: ChainId.POLYGON_MUMBAI,
//   supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
//   networkConfig: [
//     {
//       chainId: ChainId.POLYGON_MUMBAI,
//       dappAPIKey: process.env.FEATURE_ENABLE_BICONOMY_API_KEY as string,
//       // providerUrl: process.env.FEATURE_ENABLE_BICONOMY_PAYMASTER_URL as string,
//     },
//   ],
// };

// let smartAccount = new SmartAccount(provider, options);
// smartAccount = await smartAccount.init();

const WagmiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WagmiProvider;
