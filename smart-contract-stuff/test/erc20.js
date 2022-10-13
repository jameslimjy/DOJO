const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function() {

    let tokenContractFactory;
    let tokenContract;
    
    // re-deploy contract before each test
    beforeEach(async function() {
        // get ContractFactory
        tokenContractFactory = await ethers.getContractFactory("ERC20Token");

        // get Signers
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // deploy Contract
        tokenContract = await tokenContractFactory.deploy('DOJO Token', 'DOJO', 1000, 3);
    });

    describe("Deployment", function() {
        it("Should assign the total supply of tokens to the owner", async function() {
            const ownerBalance = await tokenContract.balanceOf(owner.address);
            expect(await tokenContract.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function() {
        it("Should transfer between two accounts", async function() {
            // transfer 50 tokens from owner to addr1
            await tokenContract.transfer(addr1.address, 50);
            const addr1Bal = await tokenContract.balanceOf(addr1.address);
            expect(addr1Bal).to.equal(50);

            // transfer 20 tokens from addr1 to addr2
            await tokenContract.connect(addr1).transfer(addr2.address, 20);
            const addr2Bal = await tokenContract.balanceOf(addr2.address);
            expect(addr2Bal).to.equal(20);
        });

        it("Should revert if sender doesn't have enough tokens", async function() {
            // try to send 1 token from addr2 to owner
            const initialOwnerBal = await tokenContract.balanceOf(owner.address);
            await expect(tokenContract.connect(addr2).transfer(owner.address, 1)).to.be.revertedWith("insufficientBalance");
            expect(await tokenContract.balanceOf(owner.address)).to.equal(initialOwnerBal);
        });
    });

    describe("Approvals", function() {
        it("Should allow transfer of funds via approval", async function() {
            // owner allow addr1 to send 50 tokens
            await tokenContract.approve(addr1.address, 50);
            const allowedAmount = await tokenContract.allowance(owner.address, addr1.address);
            expect(allowedAmount).to.equal(50);

            // addr1 send 20 of owner's tokens to addr2
            await tokenContract.connect(addr1).transferFrom(owner.address, addr2.address, 20);
            expect(await tokenContract.allowance(owner.address, addr1.address)).to.equal(allowedAmount - 20);
            expect(await tokenContract.balanceOf(owner.address)).to.equal(1000 - 20);
            expect(await tokenContract.balanceOf(addr2.address)).to.equal(20);
        });

        it("Should revert if insufficient allowed balance", async function() {
            // addr1 try to send 1 of owner's tokens to addr2
            await expect(tokenContract.connect(addr1).transferFrom(owner.address, addr2.address, 1)).to.be.revertedWith("insufficientBalance");
        });
        
    });
   


});