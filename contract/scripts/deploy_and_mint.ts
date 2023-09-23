import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  let linkt: Contract;
  let simpleErc721: Contract;
  let owner: SignerWithAddress;

  [owner] = await ethers.getSigners();

  const Linkt = await ethers.getContractFactory("Linkt");
  const SimpleErc721 = await ethers.getContractFactory("ERC721Mock");
  // Requires the tip token to be passed in during deployment

  const tippingToken = ethers.constants.AddressZero;
  simpleErc721 = await SimpleErc721.deploy("Faux Pass", "FAUXP");
  linkt = await Linkt.deploy(tippingToken);

  await simpleErc721.deployed();
  await linkt.deployed();

  console.log(`SimpleErc721 Deployed to -> ${simpleErc721.address}`);
  console.log(`Linkt Deployed to -> ${linkt.address}`);

  const sWallet = "0x7baB11bECD925413eae49b9278fae3476aD17EDd";
  const cWallet = "0x9325ED3fe17893b8eA8B8507427A8c07f14d0E03";

  await simpleErc721.mint(sWallet, 1);
  await simpleErc721.mint(cWallet, 1);
  console.log(`Minted a Token each to S/C`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
