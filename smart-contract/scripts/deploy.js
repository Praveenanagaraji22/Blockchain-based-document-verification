const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Contract = await ethers.getContractFactory("DocumentVerification");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("DocumentVerification deployed to:", address);
  console.log("Copy this address into your backend .env as CONTRACT_ADDRESS=", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
