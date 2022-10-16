require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: {
    version: "0.8.4"
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
    }
  }
}
