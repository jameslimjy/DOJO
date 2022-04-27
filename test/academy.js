const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Academy contract", function() {

    let tokenContractFactory;
    let tokenContract;
    
    // re-deploy contract before each test
    beforeEach(async function() {
        // get ContractFactory
        tokenContractFactory = await ethers.getContractFactory("ERC20Token");

        // get Signers
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

        // deploy Contract
        tokenContract = await tokenContractFactory.deploy('DOJO Token', 'DOJO', 1000, 3);
    });

    describe("Deployment", function() {
        it("Should assign the principal role to the owner", async function() {
            expect(await tokenContract.principal()).to.equal(owner.address);
        });
    });

    describe("Add teacher", function() {
        it("Should add a teacher", async function() {
            await tokenContract.addTeacher("Alice", addr1.address);
            const teacherName = await tokenContract.teachers(addr1.address);
            expect(teacherName[0]).to.equal("Alice");
        });

        it("Should revert if someone else other than the principal adds a teacher", async function() {
            await tokenContract.addTeacher("Alice", addr1.address);
            await expect(tokenContract.connect(addr1).addTeacher("Bob", addr2.address)).to.be.revertedWith("only the principal can access this function");
        });

        it("Should revert if the wallet has been registered before", async function() {
            // wallet associated with the principal
            await expect(tokenContract.addTeacher("Alice", owner.address)).to.be.revertedWith("wallet is already associated with the principal");

            // wallet associated with another teacher
            await tokenContract.addTeacher("Alice", addr1.address);
            await expect(tokenContract.addTeacher("Bob", addr1.address)).to.be.revertedWith("wallet is already associated with a teacher");

            // wallet associated with a student
            await tokenContract.addStudent("Alice", addr2.address);
            await expect(tokenContract.addTeacher("Bob", addr2.address)).to.be.revertedWith("wallet is already associated with a student");
        });
    });

    describe("Add student", function() {
        it("Should add a student", async function() {
            // principal adding a student
            await tokenContract.addStudent("Alice", addr1.address);
            const studentName = await tokenContract.students(addr1.address);
            expect(studentName[0]).to.equal("Alice");

            // teacher adding a student
            await tokenContract.addTeacher("Bob", addr2.address);
            await tokenContract.connect(addr2).addStudent("Bob", addr3.address);
            const newStudentName = await tokenContract.students(addr3.address);
            expect(newStudentName[0]).to.equal("Bob");
        });

        it("Should revert if someone else other than the principal or a teacher adds a student", async function() {
            await expect(tokenContract.connect(addr1).addStudent("Alice", addr2.address)).to.be.revertedWith("only teachers or the principal can access this function");
        });

        it("Should revert if the wallet has been registered before", async function() {
            // wallet associated with the principal
            await expect(tokenContract.addStudent("Alice", owner.address)).to.be.revertedWith("wallet is already associated with the principal");

            // wallet associated with another teacher
            await tokenContract.addTeacher("Alice", addr1.address);
            await expect(tokenContract.addStudent("Bob", addr1.address)).to.be.revertedWith("wallet is already associated with a teacher");

            // wallet associated with a student
            await tokenContract.addStudent("Alice", addr2.address);
            await expect(tokenContract.addStudent("Bob", addr2.address)).to.be.revertedWith("wallet is already associated with a student");
        });
      
    });




});
