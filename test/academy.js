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
        [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();

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
        describe("Create class", function() {
            it("Should create a class", async function() {
                // add teacher
                await tokenContract.addTeacher("Alice", addr1.address);
    
                // teacher creating a class
                const classId = await tokenContract.connect(addr1).createClass("Tokenomics 101", 2);
                const _class = await tokenContract.classes(1); // hardcoded this because keep getting error when using returned uint value but whyyy
                expect(_class[1]).to.equal("Tokenomics 101");
            });

            it("Should revert if not created by a teacher", async function() {
                await expect(tokenContract.createClass("Tokenomics 101", 2)).to.be.revertedWith("only teachers can access this function");
            });

        });

        describe("Sign up for class", async function() {
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
    
                // non-student attempts to sign up for a class
                await expect(tokenContract.connect(addr2).signUpForClass(1)).to.be.revertedWith("only students can access this function");
            });
        });
    });


    describe("Consults", function() {
        describe("Create consult", function() {
            it("Should create a consult", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 5);
                const _consult = await tokenContract.consults(1);
                expect(_consult[1]).to.equal(addr1.address);
                expect(_consult[2]).to.equal(2);
            });
    
            it("Should revert if a non-teacher created a consult", async function() {
                await expect(tokenContract.createConsult(2,5)).to.be.revertedWith("only teachers can access this function");
            });
        });

        describe("Sign up for consult", function() {
            it("Should sign up for a consult", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 5);
                await tokenContract.addStudent("Bob", addr2.address);
                const initialStudentBal = await tokenContract.balanceOf(addr2.address);
                const initialTreasuryBal = await tokenContract.balanceOf(tokenContract.treasury());
                await tokenContract.connect(addr2).signUpForConsult(1);
    
                const _consult = await tokenContract.consults(1);
                expect(_consult[4]).to.equal(1);
                
                const _consultAttendance = await tokenContract.consultAttendanceList(1, addr2.address);
                expect(_consultAttendance[0]).to.equal(true);
                expect(_consultAttendance[1]).to.equal(false);

                const finalStudentBal = await tokenContract.balanceOf(addr2.address);
                const finalTreasuryBal = await tokenContract.balanceOf(tokenContract.treasury());
                expect(finalStudentBal).to.equal(initialStudentBal.toNumber() - _consult[2].toNumber());
                expect(finalTreasuryBal).to.equal(initialTreasuryBal.toNumber() + _consult[2].toNumber());
            })
    
            it("Should revert if a non-student trys to join a consult", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 5);
                await expect(tokenContract.connect(addr2).signUpForConsult(1)).to.be.revertedWith("only students can access this function");
            });
    
            it("Should revert if a student trys to join a consult that doesn't exist", async function() {
                await tokenContract.addStudent("Alice", addr1.address);
                await expect(tokenContract.connect(addr1).signUpForConsult(1)).to.be.revertedWith("consult does not exist");
            });
    
            it("Should revert if the student has insufficient balance", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(6, 5);
                await tokenContract.addStudent("Bob", addr2.address);
                await expect(tokenContract.connect(addr2).signUpForConsult(1)).to.be.revertedWith("student has insufficient balance");
            });
    
            it("Should revert if the student has already signed up for the consult", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 5);
                await tokenContract.addStudent("Bob", addr2.address);
                await tokenContract.connect(addr2).signUpForConsult(1);
                await expect(tokenContract.connect(addr2).signUpForConsult(1)).to.be.revertedWith("student has already signed up for the consult");
            });
    
            it("Should revert if the consult is already at maximum capacity", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 2);
                await tokenContract.addStudent("Bob", addr2.address);
                await tokenContract.addStudent("Carl", addr3.address);
                await tokenContract.connect(addr2).signUpForConsult(1);
                await tokenContract.connect(addr3).signUpForConsult(1);
    
                await tokenContract.addStudent("Dom", addr4.address);
                await expect(tokenContract.connect(addr4).signUpForConsult(1)).to.be.revertedWith("this consult is already at maximum capacity");
            });
        });

        describe("Mark consult attendance", function() {
            it("Should mark consult attendance", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 2);
                await tokenContract.addStudent("Bob", addr2.address);
                const initialStudentBal = await tokenContract.balanceOf(addr2.address);
                const initialTreasuryBal = await tokenContract.balanceOf(addr2.address);

                await tokenContract.connect(addr2).signUpForConsult(1);
                await tokenContract.connect(addr1).markConsultAttendance(addr2.address, 1);

                const _consultAttendance = await tokenContract.consultAttendanceList(1, addr2.address);
                expect(_consultAttendance[0]).to.equal(true);
                expect(_consultAttendance[1]).to.equal(true);
                
                const finalStudentBal = await tokenContract.balanceOf(addr2.address);
                const finalTreasuryBal = await tokenContract.balanceOf(addr2.address);
                expect(initialStudentBal).to.equal(finalStudentBal);
                expect(initialTreasuryBal).to.equal(finalTreasuryBal);
            });

            it("Should revert if consult does not exist", async function() {
                await tokenContract.addStudent("Alice", addr1.address);
                await expect(tokenContract.connect(addr1).signUpForConsult(1)).to.be.revertedWith("consult does not exist");
            });

            it("Should revert if someone else other than the teacher who created the consult attempts to mark attendance", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 2);
                await tokenContract.addStudent("Bob", addr2.address);
                await tokenContract.connect(addr2).signUpForConsult(1);

                await tokenContract.addTeacher("Carl", addr3.address);
                await expect(tokenContract.connect(addr3).markConsultAttendance(addr2.address, 1)).to.be.revertedWith("only the teacher who created the consult session can access this function");
            });

            it("Should revert if the student did not sign up for the consult", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 2);
                await tokenContract.addStudent("Bob", addr2.address);
                await tokenContract.connect(addr2).signUpForConsult(1);
                await tokenContract.addStudent("Carl", addr3.address);
                await expect(tokenContract.connect(addr1).markConsultAttendance(addr3.address, 1)).to.be.revertedWith("this student did not sign up for the consult");
            });

            it("Should revert if the student's attendance has already been marked", async function() {
                await tokenContract.addTeacher("Alice", addr1.address);
                await tokenContract.connect(addr1).createConsult(2, 2);
                await tokenContract.addStudent("Bob", addr2.address);
                await tokenContract.connect(addr2).signUpForConsult(1);
                await tokenContract.connect(addr1).markConsultAttendance(addr2.address, 1);
                await expect(tokenContract.connect(addr1).markConsultAttendance(addr2.address, 1)).to.be.revertedWith("this student's attendance has already been marked");
            });

        });
        
    });

});
