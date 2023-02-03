require("@nomiclabs/hardhat-waffle");
require('dotenv').config({path: __dirname+'/.env'})
require("@nomiclabs/hardhat-etherscan");


module.exports = {
  defaultNetwork: "goerli",
  networks: {
    hardhat: {
    },
    goerli: {
      url: process.env.ALCHEMY_API_KEY,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    }
  },
  solidity: {
    version: "0.8.14",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
}