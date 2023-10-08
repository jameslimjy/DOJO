import Header from "../components/Header";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import dojoPict from "../images/dojo-pict.jpeg";
import contract from "../contracts/Dojo.json";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import "../styles/TeacherMgmt.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const contractAddress = process.env.REACT_APP_SC_ADDRESS;
const abi = contract.abi;

const TeacherMgmtPage = () => {
  const [teachersInfo, setTeachersInfo] = useState("");
  const [hasFetchedTeacherInfo, setHasFetchedTeacherInfo] = useState(false);
  const [teacherToAddAddress, setTeacherToAddAddress] = useState("");
  const [teacherToAddName, setTeacherToAddName] = useState("");

  const handleTeacherToAddAddress = (event) => {
    setTeacherToAddAddress(event.target.value);
  };

  const handleTeacherToAddName = (event) => {
    setTeacherToAddName(event.target.value);
  };

  const getTeachers = async () => {
    try {
      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, abi, signer);

      const currentTeachersInfo = [];
      const teacherAddresses = await nftContract.getTeachers();
      for (let i = 0; i < teacherAddresses.length; i++) {
        const thisTeacher = {};
        thisTeacher["address"] = teacherAddresses[i];
        const bigNumberBal = await nftContract.balanceOf(teacherAddresses[i]);
        thisTeacher["balance"] = bigNumberBal.toString();
        currentTeachersInfo[i] = thisTeacher;
      }
      setTeachersInfo(currentTeachersInfo);
      console.log(teachersInfo);
    } catch (e) {
      console.log(e);
    }
  };

  const addTeacher = async () => {
    try {
      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, abi, signer);

      console.log("teacherToAddName:", teacherToAddName);
      console.log("teacherToAddAddress", teacherToAddAddress);
      await nftContract.addTeacher(teacherToAddName, teacherToAddAddress);
      toast("Added teacher!");

      // listen for event and update teachers
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!hasFetchedTeacherInfo) {
      getTeachers();
      setHasFetchedTeacherInfo(true);
    }
  }, [teachersInfo]);

  return (
    <div className="home-page">
      <Header />
      <ToastContainer />
      <div className="top-section">
        <img className="banner-pict" src={dojoPict} />
      </div>
      <div className="top-middle-section">Teacher Management Page</div>
      <div className="teacher-mgmt-bottom-section">
        <div className="teacher-mgmt-bottom-section-left">
          <h2>Teachers</h2>
          <ul>
            {teachersInfo.length != 0 &&
              teachersInfo.map((teacher, idx) => {
                return (
                  <div key={idx}>
                    <li>
                      {teacher["address"]} - {teacher["balance"]}
                    </li>
                  </div>
                );
              })}
          </ul>
        </div>
        <div className="teacher-mgmt-bottom-section-right">
          <div className="add-teacher-card">
            <div className="card-header">
              <h2>Add Teacher</h2>
            </div>
            <div className="card-body">
              <div className="body-left">
                <div className="body-left-top">
                  <input className="input-fields" type="text" value={teacherToAddName} onChange={handleTeacherToAddName} placeholder="Input name" />
                </div>
                <div className="body-left-bottom">
                  <input
                    className="input-fields"
                    type="text"
                    value={teacherToAddAddress}
                    onChange={handleTeacherToAddAddress}
                    placeholder="Input address"
                  />
                </div>
              </div>
              <div className="body-right">
                <button className="add-teacher-button" onClick={addTeacher}>
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

export default TeacherMgmtPage;
