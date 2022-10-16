const { ethers } = require("hardhat");

const main = async () => {

    // ether's abstraction of the contract
    const tokenFactory = await ethers.getContractFactory("ERC20Token");

    // get Signers
    const [treasury, teacher1, teacher2, student1, student2, student3, student4, student5] = await ethers.getSigners();
    console.log(`Treasury address --> ${treasury.address}`);

    // deploys the contract
    const contract = await tokenFactory.connect(treasury).deploy("DOJO Token", "DOJO", 10000, 2);
    console.log(`Token contract address --> ${contract.address}`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });