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
        tokenContract = await tokenContractFactory.deploy('DOJO Token', 'DOJO', 10000, 3);
    });

    describe("Deployment", function() {
        it("Should assign the treasury role to the msg.sender", async function() {
            expect(await tokenContract.treasury()).to.equal(owner.address);
        });
    });

    describe("Add teacher", function() {
        it("Should add a teacher", async function() {
            await tokenContract.addTeacher("Alice", addr1.address);
            const teacherName = await tokenContract.teachers(addr1.address);
            expect(teacherName[0]).to.equal("Alice");
        });

        it("Should revert if someone else other than the treasury adds a teacher", async function() {
            await tokenContract.addTeacher("Alice", addr1.address);
            await expect(tokenContract.connect(addr1).addTeacher("Bob", addr2.address)).to.be.revertedWith("only the treasury can access this function");
        });

        it("Should revert if the wallet has been registered before", async function() {
            // wallet associated with the treasury
            await expect(tokenContract.addTeacher("Alice", owner.address)).to.be.revertedWith("wallet is already associated with the treasury");

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
            // treasury adding a student
            await tokenContract.addStudent("Alice", addr1.address);
            const studentName = await tokenContract.students(addr1.address);
            expect(studentName[0]).to.equal("Alice");

            // check that student receives the starting amount of tokens
            const studentBal = await tokenContract.balanceOf(addr1.address);
            const startingAmount = await tokenContract.STARTINGAMOUNT();
            await expect(studentBal.toNumber()).to.equal(startingAmount);

            // teacher adding a student
            await tokenContract.addTeacher("Bob", addr2.address);
            await tokenContract.connect(addr2).addStudent("Bob", addr3.address);
            const newStudentName = await tokenContract.students(addr3.address);
            expect(newStudentName[0]).to.equal("Bob");
        });

        it("Should revert if someone else other than the treasury or a teacher adds a student", async function() {
            await expect(tokenContract.connect(addr1).addStudent("Alice", addr2.address)).to.be.revertedWith("only teachers or the treasury can access this function");
        });

        it("Should revert if the wallet has been registered before", async function() {
            // wallet associated with the treasury
            await expect(tokenContract.addStudent("Alice", owner.address)).to.be.revertedWith("wallet is already associated with the treasury");

            // wallet associated with another teacher
            await tokenContract.addTeacher("Alice", addr1.address);
            await expect(tokenContract.addStudent("Bob", addr1.address)).to.be.revertedWith("wallet is already associated with a teacher");

            // wallet associated with a student
            await tokenContract.addStudent("Alice", addr2.address);
            await expect(tokenContract.addStudent("Bob", addr2.address)).to.be.revertedWith("wallet is already associated with a student");
        });
    });


    describe("Classes", function() {
        it("Should create a class", async function() {
            // add teacher
            await tokenContract.addTeacher("Alice", addr1.address);

            // teacher creating a class
            const classId = await tokenContract.connect(addr1).createClass("Tokenomics 101", 2);
            const _class = await tokenContract.classes(1); // hardcoded this because keep getting error when using returned uint value but whyyy
            expect(_class[1]).to.equal("Tokenomics 101");
        });

        it("Should let a student sign up for a class", async function() {
            // add teacher + create class
            await tokenContract.addTeacher("Alice", addr1.address);
            const initialTeacherBal = await tokenContract.balanceOf(addr1.address);
            const classId = await tokenContract.connect(addr1).createClass("Tokenomics 101", 2);

            // add student
            await tokenContract.connect(addr1).addStudent("Bob", addr2.address);
            const initialStudentBal = await tokenContract.balanceOf(addr2.address);

            // student signs up for a class
            await tokenContract.connect(addr2).signUpForClass(1);

            // check balances of the teacher's and student's wallet
            expect(await tokenContract.balanceOf(addr1.address)).to.equal(initialTeacherBal + 2);
            expect(await tokenContract.balanceOf(addr2.address)).to.equal(initialStudentBal - 2);
            
            // check if student added to classAttendance 
            const firstStudentInClassAttendance = await tokenContract.classAttendance(1, 0);
            expect(firstStudentInClassAttendance).to.equal(addr2.address);
        });

        it("Should revert if not created by a teacher", async function() {
            await expect(tokenContract.createClass("Tokenomics 101", 2)).to.be.revertedWith("only teachers can access this function");
        });

        it("Should revert if student has insufficient balance", async function() {
            // add teacher + create class
            await tokenContract.addTeacher("Alice", addr1.address);
            const classId = await tokenContract.connect(addr1).createClass("Tokenomics 101", 6);

            // add student
            await tokenContract.connect(addr1).addStudent("Bob", addr2.address);
 
            // student attempts to sign up for a class
            await expect(tokenContract.connect(addr2).signUpForClass(1)).to.be.revertedWith("student has insufficient balance");
        });

        it("Should revert if student trying to join a class that doesn't exist", async function() {
            // add student
            await tokenContract.addStudent("Bob", addr1.address);

            // student attempts to sign up for a class
            await expect(tokenContract.connect(addr1).signUpForClass(1)).to.be.revertedWith("class does not exist");
 
        });

        it("Should revert if the wallet trying to join the class is not a student", async function() {
            // add teacher + create class
            await tokenContract.addTeacher("Alice", addr1.address);
            const classId = await tokenContract.connect(addr1).createClass("Tokenomics 101", 2);

            // non-student attempts to sign up for a class, non-students will have 0 balance since it's the default value
            await expect(tokenContract.connect(addr2).signUpForClass(1)).to.be.revertedWith("student has insufficient balance");
        });
    });

});
