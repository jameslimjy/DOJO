import { Link } from "react-router-dom";
import logo from "../images/logo.png";

import "../styles/Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} />
      </div>
      <div className="role">Teacher</div>
      <div className="address">0xkan128347ndl18b18nd9178f</div>
      <div className="connect-wallet">
        <button className="connect-wallet-button">Connect Wallet</button>
      </div>
    </div>
  );
};

export default Header;
