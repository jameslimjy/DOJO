import Header from "../components/Header";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import dojoPict from "../images/dojo-pict.jpeg";
import contract from "../contracts/Dojo.json";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "../styles/StudentMgmt.css";

const contractAddress = process.env.REACT_APP_SC_ADDRESS;
const abi = contract.abi;

const StudentMgmtPage = () => {
  const [studentsInfo, setStudentsInfo] = useState("");
  const [hasFetchedStudentInfo, setHasFetchedStudentInfo] = useState(false);
  const [studentToAddAddress, setStudentToAddAddress] = useState("");
  const [studentToAddName, setStudentToAddName] = useState("");

  const handleStudentToAddAddress = (event) => {
    setStudentToAddAddress(event.target.value);
  };

  const handleStudentToAddName = (event) => {
    setStudentToAddName(event.target.value);
  };

  const getStudents = async () => {
    try {
      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, abi, signer);

      const currentStudentsInfo = [];
      const studentAddresses = await nftContract.getStudents();
      for (let i = 0; i < studentAddresses.length; i++) {
        const thisStudent = {};
        thisStudent["address"] = studentAddresses[i];
        const bigNumberBal = await nftContract.balanceOf(studentAddresses[i]);
        thisStudent["balance"] = bigNumberBal.toString();
        currentStudentsInfo[i] = thisStudent;
      }
      setStudentsInfo(currentStudentsInfo);
      console.log(currentStudentsInfo);
    } catch (e) {
      console.log(e);
    }
  };

  const addStudent = async () => {
    try {
      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, abi, signer);

      await nftContract.addStudent(studentToAddName, studentToAddAddress);
      toast("Added student!");

      // clear input fields
      setStudentToAddAddress("");
      setStudentToAddName("");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(contractAddress, abi, signer);

    if (!hasFetchedStudentInfo) {
      getStudents();
      setHasFetchedStudentInfo(true);
    }

    // listen for StudentCreated event
    const onStudentAdded = (name, wallet) => {
      getStudents();
    };

    nftContract.on("StudentCreated", onStudentAdded);

    // clean up listener when the component is unmounted
    return () => {
      nftContract.off("StudentCreated", onStudentAdded);
    };
  }, [studentsInfo]);

  return (
    <div className="home-page">
      <Header />
      <ToastContainer />
      <div className="top-section">
        <img className="banner-pict" src={dojoPict} />
      </div>

      <div className="top-middle-section">Student Management Page</div>
      <div className="student-mgmt-bottom-section">
        <div className="student-mgmt-bottom-section-left">
          <h2>Students</h2>
          <ul>
            {studentsInfo.length != 0 &&
              studentsInfo.map((student, idx) => {
                return (
                  <div key={idx}>
                    <li>
                      {student["address"]} - {student["balance"]}
                    </li>
                  </div>
                );
              })}
          </ul>
        </div>
        <div className="student-mgmt-bottom-section-right">
          <div className="add-student-card">
            <div className="card-header">
              <h2>Add Student</h2>
            </div>
            <div className="card-body">
              <div className="body-left">
                <div className="body-left-top">
                  <input className="input-fields" type="text" value={studentToAddName} onChange={handleStudentToAddName} placeholder="Input name" />
                </div>
                <div className="body-left-bottom">
                  <input
                    className="input-fields"
                    type="text"
                    value={studentToAddAddress}
                    onChange={handleStudentToAddAddress}
                    placeholder="Input address"
                  />
                </div>
              </div>
              <div className="body-right">
                <button className="add-student-button" onClick={addStudent}>
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMgmtPage;
