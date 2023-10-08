import "./App.css";
import React, { useState, useEffect } from "react";
import contract from "./contracts/ERC20Token.json";
import { ethers } from "ethers";

const abi = contract.abi;

function App() {
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
