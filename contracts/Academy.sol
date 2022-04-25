// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
* @notice Academy is a contract that's meant to be inherited by other contracts that wants these functionalities
*/

contract Academy {

    struct Teacher {
        string name;
        address wallet;
    }

    struct Student {
        string name;
        address wallet;
    }

    struct Class {
        uint id;
        string name;
        string[] topics;
        address teacher;
    }

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;
    mapping(uint => Class) public classes;

    address public principal;
    uint public nextClassId;

    event ClassCreated(address indexed teacher, uint indexed classId, string indexed className);
    event TeacherAdded(string indexed name, address indexed wallet);
    event StudentAdded(string indexed name, address indexed wallet);

    constructor() {
        principal = msg.sender;
    }

    function addTeacher(string calldata name, address wallet) 
        public onlyPrincipal() returns(bool) {
            if(_isUsedWallet(wallet)) {
                revert("this wallet is already in use");
            }
            teachers[wallet] = Teacher(name, wallet);
            emit TeacherAdded(name, wallet);
            return true;
    }

    function addStudent(string calldata name, address wallet)
        public teacherOrPrincipal() returns(bool) {
            if(_isUsedWallet(wallet)) {
                revert("this wallet is already in use");
            }
            students[wallet] = Student(name, wallet);
            emit StudentAdded(name, wallet);
            return true;
    }

    function createClass(string calldata name, string[] memory topics) 
        public isTeacher() returns(bool) {
            classes[nextClassId] = Class(nextClassId, name, topics, msg.sender);
            emit ClassCreated(msg.sender, nextClassId, name);
            nextClassId++;
            return true;
    }


    function _isUsedWallet(address wallet) internal view returns(bool) {
        if((teachers[wallet].wallet == address(0)) || (students[wallet].wallet == address(0))) {
            return true;
        }
        return false;
    }


    modifier isTeacher() {
        require(teachers[msg.sender].wallet != address(0), "only teachers can create a class");
        _;
    }

    modifier isStudent() {
        require(students[msg.sender].wallet != address(0), "only students can access this function");
        _;
    }

    modifier onlyPrincipal() {
        require(msg.sender == principal, "only the principal can access this function");
        _;
    }

    modifier teacherOrPrincipal() {
        require((msg.sender == principal) || (teachers[msg.sender].wallet != address(0)), "only teachers or the principal can access this function");
        _;
    }
    
}