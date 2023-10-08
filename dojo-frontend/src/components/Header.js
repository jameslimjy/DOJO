import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/Header.css";

const Header = () => {
  const [defaultAccount, setDefaultAccount] = useState("");

  const connect = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        signer.getAddress().then(setDefaultAccount);
        window.ethereum.on("accountsChanged", changeConnectedAccount);
        console.log("defaultAccount:", defaultAccount);

        // if (defaultAccount != currentAccount) {
        //   toast.success("Account connected!", {
        //     position: toast.POSITION.TOP_LEFT,
        //     autoClose: 1000,
        //   });
        // }
      } catch (e) {
        console.log(e);
      }
    } else {
      toast("Need to MetaMask before proceeding!");
    }
  };

  const changeConnectedAccount = async (newAddress) => {
    try {
      newAddress = Array.isArray(newAddress) ? newAddress[0] : newAddress;
      setDefaultAccount(newAddress);
    } catch (e) {
      console.log(e);
    }
  };

  const changeAccountButton = () => {
    return (
      <button className="connect-wallet-button" onClick={connect}>
        Connect Wallet
      </button>
    );
  };

  useEffect(() => {
    connect();
  }, [defaultAccount]);

  return (
    <div className="header">
      <ToastContainer />
      <div className="logo">
        <img src={logo} />
      </div>
      <div className="role">Teacher</div>
      <div className="address">{defaultAccount}</div>
      <div className="connect-wallet">{changeAccountButton()}</div>
    </div>
  );
};

export default Header;
