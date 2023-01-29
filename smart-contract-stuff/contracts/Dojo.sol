// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dojo is AccessControl, ERC20 {
    address private principal;
    uint256 public numTeachers;
    uint256 public numStudents;
    uint256 public nextClassId;
    uint256 public nextConsultId;
    uint8 public constant STUDENT_STARTING_AMOUNT = 5;

    bytes32 public constant PRINCIPAL_ROLE = keccak256("PRINCIPAL_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    struct Teacher {
        string name;
        address wallet;
        uint256[] classes;
        uint256[] consults;
    }

    struct Student {
        string name;
        address wallet;
        uint256[] classes;
        mapping(uint256 => ConsultAttendance) consults;
    }

    struct Class {
        uint256 classId;
        string name;
        uint8 cost;
        address teacher;
        address[] students;
    }

    struct ConsultAttendance {
        bool signedUp;
        bool attended;
    }

    struct Consult {
        uint256 consultId;
        address teacher;
        uint8 stake;
        uint8 capacity;
        address[] studentsSignedUp;
    }

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;
    mapping(uint256 => Class) public classes;
    mapping(uint256 => Consult) public consults;

    event TeacherCreated(string indexed name, address indexed wallet);
    event StudentCreated(string indexed name, address indexed wallet);
    event ClassCreated(uint256 classId, string indexed className, uint8 cost, address indexed teacher);
    event ConsultCreated(uint256 consultId, address indexed teacher, uint8 stake, uint8 capacity);

    constructor() ERC20("Dojo Token", "DOJO") {
        _setupRole(PRINCIPAL_ROLE, msg.sender);
        principal = msg.sender;
    }

    function mint(uint256 amount) public onlyPrincipal {
        _mint(address(this), amount);
    }

    function addTeacher(
        string calldata name,
        address wallet
    ) public onlyPrincipal isFreshWallet(wallet) notEmptyString(name) {
        _setupRole(TEACHER_ROLE, wallet);
        Teacher storage _teacher = teachers[wallet];
        _teacher.name = name;
        _teacher.wallet = wallet;
        emit TeacherCreated(name, wallet);
        numTeachers++;
    }

    function addStudent(
        string calldata name,
        address wallet
    ) public onlyPrincipal isFreshWallet(wallet) notEmptyString(name) {
        require(balanceOf(address(this)) >= STUDENT_STARTING_AMOUNT, "Treasury has insufficient balance");
        _transfer(address(this), wallet, STUDENT_STARTING_AMOUNT);
        _setupRole(STUDENT_ROLE, wallet);
        Student storage _student = students[wallet];
        _student.name = name;
        _student.wallet = wallet;
        emit StudentCreated(name, wallet);
        numStudents++;
    }

    function createClass(string calldata name, uint8 cost) public onlyTeacher notEmptyString(name) returns (uint256) {
        uint256 classId = nextClassId;
        Class storage _class = classes[classId];
        _class.name = name;
        _class.cost = cost;
        _class.teacher = msg.sender;
        Teacher storage _teacher = teachers[msg.sender];
        _teacher.classes.push(classId);
        emit ClassCreated(classId, name, cost, msg.sender);
        nextClassId++;
        return classId;
    }

    function signUpForClass(uint256 classId) public onlyStudent classExists(classId) {
        Class storage _class = classes[classId];
        _class.students.push(msg.sender);
        Student storage _student = students[msg.sender];
        _student.classes.push(classId);
    }

    function createConsult(uint8 stake, uint8 capacity) public onlyTeacher returns (uint256) {
        uint256 consultId = nextConsultId;
        Consult storage _consult = consults[consultId];
        _consult.teacher = msg.sender;
        _consult.stake = stake;
        _consult.capacity = capacity;
        Teacher storage _teacher = teachers[msg.sender];
        _teacher.consults.push(consultId);
        emit ConsultCreated(consultId, msg.sender, stake, capacity);
        nextConsultId++;
        return consultId;
    }

    function signUpForConsult(uint256 consultId) public onlyStudent consultExists(consultId) {
        Consult storage _consult = consults[consultId];
        require(_consult.studentsSignedUp.length < _consult.capacity, "Consult is already at maximum capacity");
        require(balanceOf(msg.sender) >= _consult.stake, "Student has insufficient balance");
        _transfer(msg.sender, address(this), _consult.stake);
        _consult.studentsSignedUp.push(msg.sender);
        Student storage _student = students[msg.sender];
        _student.consults[consultId].signedUp = true;
    }

    function markConsultAttendance(uint256 consultId) public onlyTeacher consultExists(consultId) {}

    function _isEmptyString(string memory str_) internal pure returns (bool) {
        bytes memory bytesStr = bytes(str_);
        return bytesStr.length == 0;
    }

    modifier onlyPrincipalOrTeacher() {
        require(
            hasRole(PRINCIPAL_ROLE, msg.sender) || hasRole(TEACHER_ROLE, msg.sender),
            "Caller is neither the principal nor a teacher"
        );
        _;
    }

    modifier onlyPrincipal() {
        require(hasRole(PRINCIPAL_ROLE, msg.sender), "Caller is not the principal");
        _;
    }

    modifier onlyTeacher() {
        require(hasRole(TEACHER_ROLE, msg.sender), "Caller is not a teacher");
        _;
    }

    modifier onlyStudent() {
        require(hasRole(STUDENT_ROLE, msg.sender), "Caller is not a student");
        _;
    }

    modifier isFreshWallet(address wallet) {
        require(!hasRole(PRINCIPAL_ROLE, wallet), "Wallet already has principal role");
        require(!hasRole(TEACHER_ROLE, wallet), "Wallet already has the teacher role");
        require(!hasRole(STUDENT_ROLE, wallet), "Wallet already has the student role");
        _;
    }

    modifier classExists(uint256 classId) {
        Class memory class = classes[classId];
        require(!_isEmptyString(class.name), "Class does not exist");
        _;
    }

    modifier consultExists(uint256 consultId) {
        Consult memory consult = consults[consultId];
        require(consult.teacher != address(0), "Consult does not exist");
        _;
    }

    modifier notEmptyString(string memory str) {
        require(!_isEmptyString(str), "String cannot be empty");
        _;
    }
}
