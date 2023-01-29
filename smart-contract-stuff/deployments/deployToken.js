const { ethers } = require("hardhat");

const main = async () => {
  // ether's abstraction of the contract
  const tokenFactory = await ethers.getContractFactory("ERC20Token");

  // get Signers
  const [treasury, teacher1, teacher2, student1, student2, student3, student4] =
    await ethers.getSigners();
  console.log(`Treasury address --> ${treasury.address}`);

  // deploys the contract
  const contract = await tokenFactory
    .connect(treasury)
    .deploy("DOJO Token", "DOJO", 10000, 2);
  console.log(`Token contract address --> ${contract.address}`);

  // add teachers
  await contract.connect(treasury).addTeacher("Alice", teacher1.address);
  await contract.connect(treasury).addTeacher("Bob", teacher2.address);

  // add students
  await contract.connect(teacher1).addStudent("Elijah", student1.address);
  await contract.connect(teacher1).addStudent("Sophia", student2.address);
  await contract.connect(teacher2).addStudent("Caden", student3.address);
  await contract.connect(teacher2).addStudent("Chelsea", student4.address);

  // add class
  await contract.connect(teacher1).createClass("Stats 101", 5);

  const classId = await contract.nextClassId();
  const thisTeacher = await contract.teachers(teacher2.address);
  console.log(thisTeacher[0]);
  console.log(classId);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
