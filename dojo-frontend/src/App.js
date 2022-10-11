import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentStatusm, setCurrentStatus] = useState(null);
  const [chain, setChain] = useState(null);
  
  // check if metamask wallet exists
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("metamask not installed");
      return;
    } else {
      console.log("wallet exists! good to go");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log('found an account, address: ', account);
      setCurrentAccount(account);
      setCurrentStatus('wallet connected, ready to proceed!');
    } else {
      console.log('no account found');
    }
  }

  // connect metamask wallet
  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('please install metamask ser...');
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log('found an account, address: ', accounts[0]);
      setCurrentAccount(accounts[0]);
      console.log('this wallet is now connected: ', currentAccount)
    } catch (err) {
      console.log(err);
    }
  }

  // button for connecting wallet
  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler}>
        Connect Wallet
      </button>
    )
  }

  const checkNetwork = async () => {
    const { ethereum } = window;

    if(!ethereum) {
      alert('need to install metamask!');
    } else {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const chainId = await provider.getNetwork();
        console.log(`chain connected: ${chainId.name}`);
        setChain(chainId.name);
      } catch (err) {
        console.log(err)
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src='dojo-pict.jpeg' width='500'></img>
          DOJO !!!
          <div>
            {connectWalletButton()}
          </div>
      </header>
    </div>
  );
}

export default App;
