import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  let linkt: Contract;
  let owner: SignerWithAddress;

  [owner] = await ethers.getSigners();

  const Linkt = await ethers.getContractFactory("Linkt");
  // Requires the tip token to be passed in during deployment

  const USDC = "0xa0d71b9877f44c744546d649147e3f1e70a93760";
  linkt = await Linkt.deploy(USDC);
  await linkt.deployed();
  console.log(`Linkt Deployed to -> ${linkt.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
