import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  let linkt: Contract;
  let owner: SignerWithAddress;

  [owner] = await ethers.getSigners();

  const Linkt = await ethers.getContractFactory("Linkt");
  // Requires the tip token to be passed in during deployment

  linkt = await Linkt.deploy();
  await linkt.deployed();
  console.log(`Linkt Deployed to -> ${linkt.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
