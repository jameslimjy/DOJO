// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Student teacher interaction faciliated with tokens
 * @author jameslimjy
 */
contract Dojo is AccessControl, ERC20 {
    address private principal;
    uint256 public numTeachers;
    uint256 public numStudents;
    uint256 public nextClassId;
    uint256 public nextConsultId;
    uint256 public nextAssignmentId;
    uint8 public constant STUDENT_STARTING_AMOUNT = 5;

    bytes32 public constant PRINCIPAL_ROLE = keccak256("PRINCIPAL_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    enum AssignmentApprovalState {
        PENDING_APPROVAL,
        APPROVED,
        COMPLETED
    }
    enum ConsultAttendance {
        NOT_SIGNED_UP,
        SIGNED_UP,
        ATTENDED
    }
    enum AssignmentParticipantState {
        NOT_SIGNED_UP,
        SIGNED_UP,
        PAID_OUT
    }

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
        mapping(uint256 => AssignmentParticipantState) assignments;
    }

    struct Class {
        uint256 classId;
        string name;
        uint8 cost;
        address teacher;
        address[] students;
    }

    struct Consult {
        uint256 consultId;
        address teacher;
        uint8 stake;
        uint8 capacity;
        address[] studentsSignedUp;
    }

    struct Assignment {
        uint256 assignmentId;
        string description;
        address teacher;
        uint8 bounty;
        address participant;
        AssignmentApprovalState state;
    }

    address[] public teacherAddresses;
    address[] public studentAddresses;

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;
    mapping(uint256 => Class) public classes;
    mapping(uint256 => Consult) public consults;
    mapping(uint256 => Assignment) public assignments;

    event TeacherCreated(string indexed name, address indexed wallet);
    event StudentCreated(string indexed name, address indexed wallet);
    event ClassCreated(uint256 classId, string indexed className, uint8 cost, address indexed teacher);
    event ConsultCreated(uint256 consultId, address indexed teacher, uint8 stake, uint8 capacity);
    event AssignmentCreated(uint256 assignmentId, address indexed teacher, uint8 bounty);

    constructor() ERC20("Dojo Token", "DOJO") {
        _setupRole(PRINCIPAL_ROLE, msg.sender);
        principal = msg.sender;
    }

    /**
     * @notice Mints tokens to the treasury
     * @param amount The amount of tokens to mint
     */
    function mint(uint256 amount) external onlyPrincipal {
        _mint(address(this), amount);
    }

    /**
     *
     * @notice To retrieve the information of a class
     * @param classId The classId of the class' info to return
     */
    function getClassInfo(uint256 classId)
        external
        view
        classExists(classId)
        returns (uint256, string memory, uint8, address, address[] memory)
    {
        Class memory _class = classes[classId];
        return (_class.classId, _class.name, _class.cost, _class.teacher, _class.students);
    }

    /**
     *
     * @notice To retrieve the information of a consult
     * @param consultId The consultId of the consult's info to return
     */
    function getConsultInfo(uint256 consultId)
        external
        view
        consultExists(consultId)
        returns (uint256, address, uint8, uint8, address[] memory)
    {
        Consult memory _consult = consults[consultId];
        return (_consult.consultId, _consult.teacher, _consult.stake, _consult.capacity, _consult.studentsSignedUp);
    }

    /**
     *
     * @notice To retrieve the information of an assignment
     * @param assignmentId The assignmentId of the assignment's info to return
     */
    function getAssignmentInfo(uint256 assignmentId)
        external
        view
        assignmentExists(assignmentId)
        returns (uint256, string memory, address, uint8, address, AssignmentApprovalState)
    {
        Assignment memory _assignment = assignments[assignmentId];
        return (
            _assignment.assignmentId,
            _assignment.description,
            _assignment.teacher,
            _assignment.bounty,
            _assignment.participant,
            _assignment.state
        );
    }

    /**
     * @notice To retrieve a list of teacher addresses
     */
    function getTeachers() external view returns (address[] memory) {
        return teacherAddresses;
    }

    /**
     * @notice To retrieve a list of student addresses
     */
    function getStudents() external view returns (address[] memory) {
        return studentAddresses;
    }

    /**
     * @notice For the principal to add a new teacher
     * @param name The teacher's name
     * @param wallet The teacher's wallet
     */
    function addTeacher(string calldata name, address wallet)
        external
        onlyPrincipal
        isFreshWallet(wallet)
        notEmptyString(name)
    {
        _setupRole(TEACHER_ROLE, wallet);
        Teacher storage _teacher = teachers[wallet];
        _teacher.name = name;
        _teacher.wallet = wallet;
        teacherAddresses.push(wallet);
        emit TeacherCreated(name, wallet);
        numTeachers++;
    }

    /**
     * @notice For the principal to add a new student
     * @param name The student's name
     * @param wallet The student's wallet
     */
    function addStudent(string calldata name, address wallet)
        external
        onlyPrincipal
        isFreshWallet(wallet)
        notEmptyString(name)
    {
        require(balanceOf(address(this)) >= STUDENT_STARTING_AMOUNT, "Treasury has insufficient balance");
        _transfer(address(this), wallet, STUDENT_STARTING_AMOUNT);
        _setupRole(STUDENT_ROLE, wallet);
        Student storage _student = students[wallet];
        _student.name = name;
        _student.wallet = wallet;
        studentAddresses.push(wallet);
        emit StudentCreated(name, wallet);
        numStudents++;
    }

    /**
     * @notice For a teacher to create a new class
     * @param name The title of the class
     * @param cost The amount of DOJO tokens it'll cost for a student to join the class
     */
    function createClass(string calldata name, uint8 cost) external onlyTeacher notEmptyString(name) {
        uint256 classId = nextClassId;
        Class storage _class = classes[classId];
        _class.name = name;
        _class.cost = cost;
        _class.teacher = msg.sender;
        Teacher storage _teacher = teachers[msg.sender];
        _teacher.classes.push(classId);
        emit ClassCreated(classId, name, cost, msg.sender);
        nextClassId++;
    }

    /**
     * @notice For a student to sign up for a class
     * @param classId The classID of the class the student wants to join
     */
    function signUpForClass(uint256 classId) external onlyStudent classExists(classId) {
        Class storage _class = classes[classId];
        _class.students.push(msg.sender);
        Student storage _student = students[msg.sender];
        _student.classes.push(classId);
    }

    /**
     * @notice For a teacher to create a consultation session
     * @param stake The amount of DOJO tokens a student will have to put up as stake, will be returned after attendance marking
     * @param capacity The maximum number of students allowed to join the consultation
     */
    function createConsult(uint8 stake, uint8 capacity) external onlyTeacher {
        uint256 consultId = nextConsultId;
        Consult storage _consult = consults[consultId];
        _consult.teacher = msg.sender;
        _consult.stake = stake;
        _consult.capacity = capacity;
        Teacher storage _teacher = teachers[msg.sender];
        _teacher.consults.push(consultId);
        emit ConsultCreated(consultId, msg.sender, stake, capacity);
        nextConsultId++;
    }

    /**
     * @notice For a student to join a consultation session
     * @param consultId The consultID of the consulation the student wants to join
     */
    function signUpForConsult(uint256 consultId) external onlyStudent consultExists(consultId) {
        Consult storage _consult = consults[consultId];
        require(_consult.studentsSignedUp.length < _consult.capacity, "Consult is already at maximum capacity");
        require(balanceOf(msg.sender) >= _consult.stake, "Student has insufficient balance");
        Student storage _student = students[msg.sender];
        require(_student.consults[consultId] == ConsultAttendance.NOT_SIGNED_UP, "Student has already signed up");
        _transfer(msg.sender, address(this), _consult.stake);
        _consult.studentsSignedUp.push(msg.sender);
        _student.consults[consultId] = ConsultAttendance.SIGNED_UP;
    }

    /**
     * @notice For the teacher that created the consultation session to mark attendance of students that attended
     * @param consultId The consultId of the consulation
     * @param studentAddr The wallet address of the student who's attendance is to be marked
     */
    function markConsultAttendance(uint256 consultId, address studentAddr)
        external
        onlyTeacher
        consultExists(consultId)
    {
        Student storage _student = students[studentAddr];
        require(_student.consults[consultId] == ConsultAttendance.SIGNED_UP, "Student did not sign up for consult");
        Consult storage _consult = consults[consultId];
        require(_consult.teacher == msg.sender, "Only the teacher hosting the consult can mark attendance");
        require(balanceOf(address(this)) >= _consult.stake, "Treasury has insufficient balance");
        _transfer(address(this), studentAddr, _consult.stake);
        _student.consults[consultId] = ConsultAttendance.ATTENDED;
    }

    /**
     * @notice For a teacher to create an assignment
     * @param bounty The amount of DOJO tokens to be paid out to the student on completion of the assignment
     * @param description A 1-liner description of the assignment
     */
    function createAssignment(uint8 bounty, string calldata description)
        external
        onlyTeacher
        notEmptyString(description)
    {
        uint256 assignmentId = nextAssignmentId;
        assignments[assignmentId] = Assignment(
            assignmentId, description, msg.sender, bounty, address(0), AssignmentApprovalState.PENDING_APPROVAL
        );
        nextAssignmentId++;
        emit AssignmentCreated(assignmentId, msg.sender, bounty);
    }

    /**
     * @notice For the principal to approve an assignment
     * @param assignmentId The assignmentID of the assignment to be approved
     */
    function approveAssignment(uint256 assignmentId) external onlyPrincipal assignmentExists(assignmentId) {
        Assignment storage _assignment = assignments[assignmentId];
        require(balanceOf(address(this)) >= _assignment.bounty, "Treasury has insufficient balance");
        _assignment.state = AssignmentApprovalState.APPROVED;
        _approve(address(this), _assignment.teacher, _assignment.bounty);
    }

    /**
     * @notice For a student to sign up for an approved assignment
     * @param assignmentId The assignmentId of the assignment to be signed up for
     */
    function signUpForAssignment(uint256 assignmentId) external onlyStudent assignmentExists(assignmentId) {
        Assignment storage _assignment = assignments[assignmentId];
        require(_assignment.state == AssignmentApprovalState.APPROVED, "Assignment not approved yet");
        require(_assignment.participant == address(0), "Assignment already has a participant");
        _assignment.participant = msg.sender;
        Student storage _student = students[msg.sender];
        _student.assignments[assignmentId] = AssignmentParticipantState.SIGNED_UP;
    }

    /**
     * @notice For a teacher to pay up the bounty of an assignment
     * @param assignmentId The assignmentId of the assignment to pay out
     */
    function payOutAssignment(uint256 assignmentId) external onlyTeacher assignmentExists(assignmentId) {
        Assignment storage _assignment = assignments[assignmentId];
        require(_assignment.state == AssignmentApprovalState.APPROVED, "Assignment not approved yet");
        require(_assignment.participant != address(0), "Assignment does not have a participant yet");
        require(_assignment.teacher == msg.sender, "Only the teacher that created the assignment can pay it out");
        _assignment.state = AssignmentApprovalState.COMPLETED;
        transferFrom(address(this), _assignment.participant, _assignment.bounty);
        Student storage _student = students[_assignment.participant];
        _student.assignments[assignmentId] = AssignmentParticipantState.PAID_OUT;
    }

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
        Class memory _class = classes[classId];
        require(!_isEmptyString(_class.name), "Class does not exist");
        _;
    }

    modifier consultExists(uint256 consultId) {
        Consult memory _consult = consults[consultId];
        require(_consult.teacher != address(0), "Consult does not exist");
        _;
    }

    modifier assignmentExists(uint256 assignmentId) {
        Assignment memory _assignment = assignments[assignmentId];
        require(_assignment.teacher != address(0), "Assignment does not exist");
        _;
    }

    modifier notEmptyString(string memory str) {
        require(!_isEmptyString(str), "String cannot be empty");
        _;
    }
}
