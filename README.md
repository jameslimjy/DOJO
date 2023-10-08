# DOJO
<p align="center">
    <img width="1000" alt="yeeted-dojo-img" src="https://i.pinimg.com/originals/45/ac/eb/45acebf685f5b11ff13b01df5c539cd8.jpg">
</p>

DOJO is a dapp that facilitates student-teacher interactions using DOJO (an ERC20 token).

There are 3 entities involved: Student, Teacher & Treasury.

There are 3 types of activities in this dapp: Classes, Consults & Assignments.

## Quick start:
Terminal 1 - Start Local Hardhat Network
```
npx hardhat node
```

Terminal 2 - Deploy SC
```
npx hardhat run deployments/deploy.js --network localhost
```

Terminal 3 - Start React Frontend
```
npm start
```


## Tokenomics ##
* Students' POV
  * given 5 DOJO when enrolling for the first time
  * use DOJO to pay for classes
  * stake DOJO when signing up for consults
  * earn DOJO by participating in assignments
* Teacher's POV
  * start with 0 DOJO
  * DOJO is used to determine how much work a teacher as done, i.e. accumulate more tokens = have done more work
  * DOJO can be traded in to the treasury in exchange for fiat (teachers' salary)
* Treasury's POV
  * used to track how much work each teacher has been doing


## Activities ##
* Classes
  * teachers create classes
  * students pay DOJO to attend the classes
* Consults
  * teachers create consult sessions
  * students stake DOJO to indicate their interest in attending (staked DOJO is locked up in treasury)
  * when the consult is over, the teacher will confirm the students' attendance and the staked DOJO will be returned
* Assignments
  * teachers can submit assignments to the treasury
  * after the treasury verifies it, students can apply to join
  * when the teacher verifies that the assignment has been completed by the student, the teacher can issue the assignment's bounty to the student (paid out from the treasury)

## Unit Tests ##

<p align="center">
    <img width="1000" alt="ss-of-terminal–output" src="https://user-images.githubusercontent.com/56946413/166108151-00735568-d251-4cc3-9f7f-e4e98f77ff39.png">
</p>
