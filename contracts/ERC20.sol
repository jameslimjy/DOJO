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
    }

    function createClass(string calldata name, string[] memory topics) public {
        _createClass(name, topics);
    }

    
    modifier hasSufficientBalance(address account, uint amount) {
        require(balances[account] >= amount, "account has insufficient balance");
        _;
    }
    
}