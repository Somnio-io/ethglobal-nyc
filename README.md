# Eth Global 23 NYC Hackathon (Linkt.tv)

- nvm use
- bun/npm install
- bun/npm run dev

# Ok what the hell are we building?

Linkt.tv allows content creators to connect with their fans and share unique video and live streaming experiences while allowing the market to determine the value of their content.

Content Creators create a collection of ERC721 passes on any all-in-one collection generation site _(such as Metafuse)_. They can set limit of passes that can be minted, initial minting price plus many more options that suit their business model. They then connect their collection in Linkt.tv and can upload or go live to their holders within seconds.

Only holders of the content creators collection will be able to see the content posted from the creator. Furthermore, the content creator can push content on a granular level to a specific pass, or a set of traits from their collection. The platform supports tipping and opens up the potential for various revenue streams such as advertising and product placement.

We build mobile first for the generation of users.

# How are we doing Live Streaming?

For live streaming we use Amazon IVS, its the same backend that powers platforms such as Twitch.tv.

When thinking of how to best build Linkt.tv we wanted to ensure we stood on the shoulders of platforms that came before us, such as Twitch, OnlyFans or Kick. For these platforms to offer low latency, global scale streaming with high quality they require the proven cloud technology. Live streaming with Amazon IVS for us is a suitable trade off between user experience and decentralization.

# How are we working with Video Content?

For the best user experience its critical that a performant content delivery network is used to serve video data, for this we use Amazon S3 with AWS Cloudfront. This allows us to take advantage of the same streaming reliability and quality of platforms like Network and Amazon Prime. Built for scale and user experience.

# Public URL

- https://ethglobal-nyc-nu.vercel.app/

# Minting Sites

- https://onlyfrenz.metafuse.me/ (0x45a08295157432b83f08742a1c91c0009defc0f7) -> Owner 0x8c8117d3e0Ce36884bf611927F39af0f62138BeC

# Opensea Example Collection

- https://opensea.io/collection/onlyfrenz-1

# Etherscan Link (Polygon, Scroll, Arbitrum, XDC mainnet)

- https://polygonscan.com/address/0x07F0c0C9eFC242FaD26Ab0e91e38ea3D73cBd267
- https://blockscout.scroll.io/address/0xa4CCeB9C8E614Ce30449Aa2c6850C56450249ea3
- https://goerli.arbiscan.io/address/0xb11F270e3b77855F751ce9c70379CEf4965873Ab
- https://explorer.xinfin.network/address/0x39A02239e680C35f4867BDc86a7771D74001CfBe#transactions

# Overview (rough sketch)

![overview](/images/idea.png)
