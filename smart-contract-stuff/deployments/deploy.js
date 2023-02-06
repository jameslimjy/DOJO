const { ethers } = require("hardhat")

// initialize starting data
const dojoStartingAmount = 1000
const teacherNames = ["Alice", "Bob"]
const studentNames = ["Elijah", "Sophia", "Caden", "Chelsea"]
const classes = [
    ["Introduction to Economics", 2],
    ["Psychology 101", 1],
    ["Machine learning with Python", 3],
]

const main = async () => {
    // get signers
    const [principal, teacher1, teacher2, student1, student2, student3, student4] = await ethers.getSigners()
    console.log(`Principal address --> ${principal.address}`)

    // deploys the contract
    const dojoFactory = await ethers.getContractFactory("Dojo")
    const dojo = await dojoFactory.connect(principal).deploy()
    console.log(`Dojo contract address --> ${dojo.address}`)

    // mint tokens
    await dojo.connect(principal).mint(dojoStartingAmount)

    // add teachers
    await dojo.connect(principal).addTeacher(teacherNames[0], teacher1.address)
    await dojo.connect(principal).addTeacher(teacherNames[1], teacher2.address)

    // add students
    await dojo.connect(principal).addStudent(studentNames[0], student1.address)
    await dojo.connect(principal).addStudent(studentNames[1], student2.address)
    await dojo.connect(principal).addStudent(studentNames[2], student3.address)
    await dojo.connect(principal).addStudent(studentNames[3], student4.address)

    // create classes
    await dojo.connect(teacher1).createClass(classes[0][0], classes[0][1])
    await dojo.connect(teacher1).createClass(classes[1][0], classes[1][1])
    await dojo.connect(teacher2).createClass(classes[2][0], classes[2][1])

    // sign up for classes
    await dojo.connect(student1).signUpForClass(0)
    await dojo.connect(student2).signUpForClass(1)
    await dojo.connect(student3).signUpForClass(1)
    await dojo.connect(student2).signUpForClass(2)
    await dojo.connect(student3).signUpForClass(2)
    await dojo.connect(student4).signUpForClass(2)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
