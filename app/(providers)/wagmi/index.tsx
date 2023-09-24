import React from "react";
import { connectorsForWallets, darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
// import { ChainId } from "@biconomy/core-types";
// import SmartAccount from "@biconomy/smart-account";
import { polygonMumbai, arbitrumGoerli, mainnet, polygon, gnosis, base, xdcTestnet, scrollTestnet, gnosisChiado } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { walletConnectWallet, rainbowWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { rainbowWeb3AuthConnector } from "./Web3RainbowKitConnector";
// import { IPaymaster, BiconomyPaymaster, IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from "@biconomy/paymaster";
// import { IBundler, Bundler } from "@biconomy/bundler";
// import { DEFAULT_ENTRYPOINT_ADDRESS, BiconomySmartAccountV2 } from "@biconomy/account";
// import { ChainId } from "@biconomy/core-types";
// import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    polygon,
    arbitrumGoerli,
    mainnet,
    gnosis,
    base,
    xdcTestnet,
    scrollTestnet,
    gnosisChiado,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [polygonMumbai] : []),
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

// const bundler: IBundler = new Bundler({
//   bundlerUrl: "https://bundler.biconomy.io/api/v2/137/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
//   chainId: ChainId.POLYGON_MAINNET,
//   entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
// });

// const paymaster: IPaymaster = new BiconomyPaymaster({
//   paymasterUrl: "https://paymaster.biconomy.io/api/v1/80001/Tpk8nuCUd.70bd3a7f-a368-4e5a-af14-80c7f1fcda1a",
// });

// const module = await ECDSAOwnershipValidationModule.create({
//   signer: wallet,
//   moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
// })

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
      <RainbowKitProvider theme={darkTheme({ accentColor: "#ff48a7" })} chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default WagmiProvider;
