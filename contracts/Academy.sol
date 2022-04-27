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

    function _addTeacher(string calldata name, address wallet) 
        internal onlyPrincipal() isFreshWallet(wallet) returns(bool) {
            teachers[wallet] = Teacher(name, wallet);
            emit TeacherAdded(name, wallet);
            return true;
    }

    function _addStudent(string calldata name, address wallet)
        internal teacherOrPrincipal() isFreshWallet(wallet) returns(bool) {
            students[wallet] = Student(name, wallet);
            emit StudentAdded(name, wallet);
            return true;
    }

    function _createClass(string calldata name, string[] memory topics) 
        internal isTeacher() returns(bool) {
            classes[nextClassId] = Class(nextClassId, name, topics, msg.sender);
            emit ClassCreated(msg.sender, nextClassId, name);
            nextClassId++;
            return true;
    }

    modifier isFreshWallet(address wallet) {
        require(teachers[wallet].wallet == address(0), "wallet is already associated with a teacher");
        require(students[wallet].wallet == address(0), "wallet is already associated with a student");
        require(wallet !=principal, "wallet is already associated with the principal");
        _;
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