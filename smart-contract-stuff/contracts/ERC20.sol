// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import "./Academy.sol";

contract ERC20Token is IERC20, Academy {

    string public tokenName;
    string public tickerSymbol;
    uint public tokenTotalSupply;
    uint8 public decimals;
    uint constant public STARTINGAMOUNT = 5;

    mapping(address => uint) public balances;
    mapping(address => mapping(address=> uint)) public allowed;

    constructor(
        string memory _tokenName,
        string memory _tickerSymbol,
        uint _tokenTotalSupply,
        uint8 _decimals
    )  {
        tokenName = _tokenName;
        tickerSymbol = _tickerSymbol;
        tokenTotalSupply = _tokenTotalSupply;
        decimals = _decimals;
        balances[msg.sender] = _tokenTotalSupply;
    }

    function totalSupply() public override view returns(uint) {
        return tokenTotalSupply;
    }

    function balanceOf(address account) public override view returns(uint) {
        return balances[account];
    }

    function transfer(address recipient, uint amount) 
        public override hasSufficientBalance(msg.sender, amount) returns(bool) {
            balances[msg.sender] -= amount;
            balances[recipient] += amount;
            emit Transfer(msg.sender, recipient, amount);
            return true;
    }

    function approve(address spender, uint amount) 
        public override hasSufficientBalance(msg.sender, amount) returns(bool) {
            allowed[msg.sender][spender] = amount;
            emit Approval(msg.sender, spender, amount);
            return true;
    }

    function allowance(address owner, address spender) public override view returns(uint) {
        return allowed[owner][spender];
    }

    function transferFrom(address spender, address recipient, uint amount)
        public override hasSufficientBalance(spender, amount) returns(bool) {
            require(allowed[spender][msg.sender] >= amount, "insufficient allowed balance");
            allowed[spender][msg.sender] -= amount;
            balances[spender] -= amount;
            balances[recipient] += amount;
            emit Transfer(spender, recipient, amount);
            return true;
    }

    function addTeacher(string calldata name, address wallet) public {
        _addTeacher(name, wallet);
    }

    function addStudent(string calldata name, address wallet) public {
        _addStudent(name, wallet);
        require(balances[treasury] >= STARTINGAMOUNT, "treasury has insufficient funds");
        balances[wallet] += STARTINGAMOUNT;
        balances[treasury] -= STARTINGAMOUNT;
    }


    function createClass(string calldata name, uint cost) public returns(uint) {
        uint classId = _createClass(name, cost);
        return classId;
    }

    function signUpForClass(uint classId) public isStudent() {
        require(classes[classId].teacher != address(0), "class does not exist");
        Class storage _class = classes[classId];
        require(balances[msg.sender] >= _class.cost, "student has insufficient balance");
        balances[msg.sender] -= _class.cost;
        balances[_class.teacher] += _class.cost;
        _signUpForClass(msg.sender, classId);
    }


    function createConsult(uint stake, uint capacity) public returns(uint) {
        uint consultId = _createConsult(stake, capacity);
        return consultId;
    }

    function signUpForConsult(uint consultId) public isStudent() {
        require(consults[consultId].teacher != address(0), "consult does not exist");
        Consult storage _consult = consults[consultId];
        require(balances[msg.sender] >= _consult.stake, "student has insufficient balance");
        require(consultAttendanceList[consultId][msg.sender].signedUp == false, "student has already signed up for the consult");
        require(consults[consultId].currentPax < consults[consultId].capacity, "this consult is already at maximum capacity");
        balances[msg.sender] -= _consult.stake;
        balances[treasury] += _consult.stake;
        _signUpForConsult(msg.sender, consultId);
    }

    function markConsultAttendance(address wallet, uint consultId) public {
        require(consults[consultId].teacher != address(0), "consult does not exist");
        require(consults[consultId].teacher == msg.sender, "only the teacher who created the consult session can access this function");
        require(consultAttendanceList[consultId][wallet].signedUp == true, "this student did not sign up for the consult");
        require(consultAttendanceList[consultId][wallet].attended == false, "this student's attendance has already been marked");
        Consult storage _consult = consults[consultId];
        balances[wallet] += _consult.stake;
        balances[treasury] -= _consult.stake;
        _markConsultAttendance(wallet, consultId);
    }

    function createAssignment(uint bounty) public returns(uint) {
        uint assignmentId = _createAssignment(bounty);
        return assignmentId;
    }

    function approveAssignment(uint assignmentId) public onlyTreasury() {
        Assignment storage _assignment = assignments[assignmentId];
        require(_assignment.teacher != address(0), "assignment does not exist");
        require(_assignment.state == AssignmentState.PENDINGAPPROVAL, "this assignment has already been approved");
        approve(_assignment.teacher, _assignment.bounty);
        _approveAssignment(assignmentId);
    }

    function signUpForAssignment(uint assignmentId) public {
        _signUpForAssignment(assignmentId);
    }

    function payOutAssignment(uint assignmentId) public {
        Assignment storage _assignment = assignments[assignmentId];
        require(_assignment.teacher == msg.sender, "only the teacher who created this assignment can access this function");
        require(_assignment.participant != address(0), "no participant has signed up for this assignment yet");
        require(balances[treasury] >= _assignment.bounty, "treasury has insufficient funds");
        transferFrom(treasury, _assignment.participant, _assignment.bounty);
        _payOutAssignment(assignmentId);
    }


    modifier hasSufficientBalance(address account, uint amount) {
        require(balances[account] >= amount, "account has insufficient balance");
        _;
    }
    
}