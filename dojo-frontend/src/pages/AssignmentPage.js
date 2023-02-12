import Header from "../components/Header";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import dojoPict from "../images/dojo-pict.jpeg";

const AssignmentPage = () => {
  return (
    <div className="home-page">
      <Header />
      <div className="top-section">
        <img className="banner-pict" src={dojoPict} />
      </div>

      <div className="top-middle-section">Assignment Page</div>
    </div>
  );
};

export default AssignmentPage;
