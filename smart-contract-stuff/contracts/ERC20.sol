// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
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
            if(allowed[spender][msg.sender] < amount) { revert insufficientBalance(); }
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
        if(balances[treasury] < STARTINGAMOUNT) { revert insufficientBalance(); }
        balances[wallet] += STARTINGAMOUNT;
        balances[treasury] -= STARTINGAMOUNT;
    }


    function createClass(string calldata name, uint cost) public returns(uint) {
        uint classId = _createClass(name, cost);
        return classId;
    }

    function signUpForClass(uint classId) public isStudent() {
        if(classes[classId].teacher == address(0)) { revert classDontExist(); }
        Class storage _class = classes[classId];
        if(balances[msg.sender] < _class.cost) { revert insufficientBalance(); }
        balances[msg.sender] -= _class.cost;
        balances[_class.teacher] += _class.cost;
        _signUpForClass(msg.sender, classId);
    }


    function createConsult(uint stake, uint capacity) public returns(uint) {
        uint consultId = _createConsult(stake, capacity);
        return consultId;
    }

    function signUpForConsult(uint consultId) public isStudent() {
        if(consults[consultId].teacher == address(0)) { revert consultDontExist(); }
        Consult storage _consult = consults[consultId];
        if(balances[msg.sender] < _consult.stake) { revert insufficientBalance(); }
        require(consultAttendanceList[consultId][msg.sender].signedUp == false, "already signed up");
        require(consults[consultId].currentPax < consults[consultId].capacity, "maximum capacity");
        balances[msg.sender] -= _consult.stake;
        balances[treasury] += _consult.stake;
        _signUpForConsult(msg.sender, consultId);
    }

    function markConsultAttendance(address wallet, uint consultId) public {
        if(consults[consultId].teacher == address(0)) { revert consultDontExist(); }
        if(consults[consultId].teacher != msg.sender) { revert noAccessRights(); }
        require(consultAttendanceList[consultId][wallet].signedUp == true, "did not sign up");
        require(consultAttendanceList[consultId][wallet].attended == false, "attendance already marked");
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
        if(_assignment.teacher == address(0)) { revert assignmentDontExist(); }
        require(_assignment.state == AssignmentState.PENDINGAPPROVAL, "assignment already approved");
        approve(_assignment.teacher, _assignment.bounty);
        _approveAssignment(assignmentId);
    }

    function signUpForAssignment(uint assignmentId) public {
        _signUpForAssignment(assignmentId);
    }

    function payOutAssignment(uint assignmentId) public {
        Assignment storage _assignment = assignments[assignmentId];
        if(_assignment.teacher != msg.sender) { revert noAccessRights(); }
        require(_assignment.participant != address(0), "no participant signed up");
        if(balances[treasury] < _assignment.bounty) { revert insufficientBalance(); }
        transferFrom(treasury, _assignment.participant, _assignment.bounty);
        _payOutAssignment(assignmentId);
    }


    modifier hasSufficientBalance(address account, uint amount) {
        if(balances[account] < amount) { revert insufficientBalance(); }
        _;
    }
    
}