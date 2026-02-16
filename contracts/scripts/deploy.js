const hre = require("hardhat");

async function main() {
  console.log("Deploying PokerGame contract...");

  const PokerGame = await hre.ethers.getContractFactory("PokerGame");
  const pokerGame = await PokerGame.deploy();
  await pokerGame.deployed();

  console.log("PokerGame deployed to:", pokerGame.address);

  // Save deployment address
  const fs = require("fs");
  const deploymentData = {
    contractAddress: pokerGame.address,
    deployedAt: new Date().toISOString(),
    network: hre.network.name,
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Deployment data saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
