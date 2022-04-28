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
        uint cost;
        address teacher;
    }

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;
    mapping(uint => Class) public classes;
    mapping(uint => address[]) public classAttendance;

    address public treasury;
    uint public nextClassId = 1;

    event ClassCreated(address indexed teacher, uint indexed classId, string indexed className);
    event TeacherAdded(string indexed name, address indexed wallet);
    event StudentAdded(string indexed name, address indexed wallet);

    constructor() {
        treasury = msg.sender;
    }

    function _addTeacher(string calldata name, address wallet) 
        internal onlyTreasury() isFreshWallet(wallet) returns(bool) {
            teachers[wallet] = Teacher(name, wallet);
            emit TeacherAdded(name, wallet);
            return true;
    }

    function _addStudent(string calldata name, address wallet)
        internal teacherOrTreasury() isFreshWallet(wallet) returns(bool) {
            students[wallet] = Student(name, wallet);
            emit StudentAdded(name, wallet);
            return true;
    }

    function _createClass(string calldata name, uint cost) 
        internal isTeacher() returns(uint) {
            uint classId = nextClassId;
            classes[classId] = Class(classId, name, cost, msg.sender);
            emit ClassCreated(msg.sender, classId, name);
            nextClassId++;
            return classId;
    }

    function _signUpForClass(address wallet, uint classId) internal isStudent() returns(bool) {
        classAttendance[classId].push(wallet);
        return true;
    }


    modifier isFreshWallet(address wallet) {
        require(teachers[wallet].wallet == address(0), "wallet is already associated with a teacher");
        require(students[wallet].wallet == address(0), "wallet is already associated with a student");
        require(wallet !=treasury, "wallet is already associated with the treasury");
        _;
    }

    modifier isTeacher() {
        require(teachers[msg.sender].wallet != address(0), "only teachers can access this function");
        _;
    }

    modifier isStudent() {
        require(students[msg.sender].wallet != address(0), "only students can access this function");
        _;
    }

    modifier onlyTreasury() {
        require(msg.sender == treasury, "only the treasury can access this function");
        _;
    }

    modifier teacherOrTreasury() {
        require((msg.sender == treasury) || (teachers[msg.sender].wallet != address(0)), "only teachers or the treasury can access this function");
        _;
    }
    
}