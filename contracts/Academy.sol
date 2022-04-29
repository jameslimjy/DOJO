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

    struct Consult {
        uint id;
        address teacher;
        uint stake;
        uint capacity;
        uint currentPax;
    }

    struct ConsultAttendance {
        bool signedUp;
        bool attended;
    }

    enum AssignmentState {
        PENDINGAPPROVAL,
        APPROVED,
        COMPLETED
    }

    struct Assignment {
        uint id;
        address teacher;
        uint bounty;
        address participant;
        AssignmentState state;
    }

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;

    mapping(uint => Class) public classes;
    mapping(uint => address[]) public classAttendance;

    mapping(uint => Consult) public consults;
    mapping(uint => mapping(address => ConsultAttendance)) public consultAttendanceList;

    mapping(uint => Assignment) public assignments;

    address public treasury;
    uint public nextClassId = 1;
    uint public nextConsultId = 1;
    uint public nextAssignmentId = 1;

    event TeacherAdded(string indexed name, address indexed wallet);
    event StudentAdded(string indexed name, address indexed wallet);
    event ClassCreated(address indexed teacher, uint indexed classId, string indexed className);
    event ConsultCreated(address indexed teacher, uint indexed consultId);
    event AssignmentCreated(address indexed teacher, uint indexed assignmentId);

    constructor() {
        treasury = msg.sender;
    }

    function _addTeacher(string calldata name, address wallet) internal onlyTreasury() isFreshWallet(wallet) returns(bool) {
            teachers[wallet] = Teacher(name, wallet);
            emit TeacherAdded(name, wallet);
            return true;
    }

    function _addStudent(string calldata name, address wallet) internal teacherOrTreasury() isFreshWallet(wallet) returns(bool) {
            students[wallet] = Student(name, wallet);
            emit StudentAdded(name, wallet);
            return true;
    }


    function _createClass(string calldata name, uint cost) internal isTeacher() returns(uint) {
            uint classId = nextClassId;
            classes[classId] = Class(classId, name, cost, msg.sender);
            emit ClassCreated(msg.sender, classId, name);
            nextClassId++;
            return classId;
    }

    function _signUpForClass(address wallet, uint classId) internal returns(bool) {
        classAttendance[classId].push(wallet);
        return true;
    }


    function _createConsult(uint stake, uint capacity) internal isTeacher() returns(uint) {
        uint consultId = nextConsultId;
        consults[consultId] = Consult(consultId, msg.sender, stake, capacity, 0);
        emit ConsultCreated(msg.sender, consultId);
        consultId++;
        return consultId;
    }

    function _signUpForConsult(address wallet, uint consultId) internal isStudent() {
        consults[consultId].currentPax++;
        consultAttendanceList[consultId][wallet].signedUp = true;
    }

    function _markConsultAttendance(address wallet, uint consultId) internal isTeacher() {
        consultAttendanceList[consultId][wallet].attended = true;
    }
    

    function _createAssignment(uint bounty) internal isTeacher() returns(uint) {
        uint assignmentId = nextAssignmentId;
        assignments[assignmentId] = Assignment(assignmentId, msg.sender, bounty, address(0), AssignmentState.PENDINGAPPROVAL);
        emit AssignmentCreated(msg.sender, assignmentId);
        nextAssignmentId++;
        return assignmentId;
    }

    function _approveAssignment(uint assignmentId) internal onlyTreasury() {
        assignments[assignmentId].state = AssignmentState.APPROVED;
    }

    function _signUpForAssignment(uint assignmentId) internal isStudent() {
        Assignment storage _assignment = assignments[assignmentId];
        require(_assignment.teacher != address(0), "assignment does not exist");
        require(_assignment.state == AssignmentState.APPROVED, "the assignment hasn't been approved yet");
        require(_assignment.participant == address(0), "this assignment already has a participant");
        _assignment.participant = msg.sender;
    }

    function _payOutAssignment(uint assignmentId) internal {
        assignments[assignmentId].state = AssignmentState.COMPLETED;
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