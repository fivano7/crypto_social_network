const fs = require('fs');
const { ethers } = require('hardhat');
async function main() {
  const [deployer, user1] = await ethers.getSigners();

  //Dohvaćamo contract
  const CryptoSocialNetwork = await ethers.getContractFactory("CryptoSocialNetwork");

  // deployamo ga
  const cyptoSocialNetworkInstance = await CryptoSocialNetwork.deploy();
  
  // kreiramo folder za podatke o contractu na frontendu
  const contractsDir = __dirname + "/../src/contractsData";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const deploymentAdrese = {}

  deploymentAdrese[31337] = {address: cyptoSocialNetworkInstance.address}
  deploymentAdrese[5] = {address: "0x13d968f77f3Ef3ba79962fc70F6ADa29aA1c5883"}

  //Spremamo adresu
  fs.writeFileSync(
    
    contractsDir + `/cryptoSocialNetwork-address.json`,
    JSON.stringify(deploymentAdrese, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync("CryptoSocialNetwork");

  //Spremamo ABI
  fs.writeFileSync(
    contractsDir + `/cryptoSocialNetwork.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log("CryptoSocialNetwork deployed to:", cyptoSocialNetworkInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
