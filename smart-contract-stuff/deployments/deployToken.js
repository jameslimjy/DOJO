const { ethers } = require("hardhat");

const main = async () => {

    // ether's abstraction of the contract
    const tokenFactory = await ethers.getContractFactory("ERC20Token");

    // deployer of the contract
    const [deployer] = await ethers.getSigners();
    console.log(`address deploying the contract --> ${deployer.address}`);

    // deploys the contract
    const contract = await tokenFactory.deploy("DOJO Token", "DOJO", 10000, 2);

    console.log(`Token Contract address --> ${contract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });