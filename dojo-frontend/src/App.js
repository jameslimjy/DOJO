import "./App.css";
import React, { useState, useEffect } from "react";
import contract from "./contracts/ERC20Token.json";
import { ethers } from "ethers";

const abi = contract.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  const SCAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log(currentAccount);

  return (
    <div className="App">
      <header className="App-header">
        <img src="dojo-pict.jpeg" width="500"></img>
        DOJO !!!
      </header>
      <body>hi</body>
    </div>
  );
}

export default App;
