import Header from "../components/Header";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import dojoPict from "../images/dojo-pict.jpeg";
import classPict from "../images/class.png";
import consultPict from "../images/consult.png";
import assignmentPict from "../images/assignment.png";
import studentMgmtPict from "../images/student.png";
import teacherMgmtPict from "../images/teacher.png";
import treasuryMgmtPict from "../images/treasury.png";

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <div className="top-section">
        <img className="banner-pict" src={dojoPict} />
      </div>

      <div className="top-middle-section">Dojo</div>

      <div className="middle-section">
        <Link to="/class">
          <button className="class-button">
            <img className="button-pict" src={classPict} />
            Class
          </button>
        </Link>
        <Link to="/consult">
          <button className="consult-button">
            <img className="button-pict" src={consultPict} />
            Consult
          </button>
        </Link>
        <Link to="/assignment">
          <button className="assignment-button">
            <img className="button-pict" src={assignmentPict} />
            Assignment
          </button>
        </Link>
      </div>

      <div className="middle-section">
        <Link to="/teachermgmt">
          <button className="class-button">
            <img className="button-pict" src={teacherMgmtPict} />
            Teacher Mgmt
          </button>
        </Link>
        <Link to="/studentmgmt">
          <button className="consult-button">
            <img className="button-pict" src={studentMgmtPict} />
            Student Mgmt
          </button>
        </Link>
        <Link to="/treasurymgmt">
          <button className="assignment-button">
            <img className="button-pict" src={treasuryMgmtPict} />
            Treasury Mgmt
          </button>
        </Link>
      </div>

      <div className="bottom-section">Activity Feed</div>
    </div>
  );
};

export default HomePage;
