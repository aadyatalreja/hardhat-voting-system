require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");

module.exports = {
  solidity: "0.8.28",
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "d4ea4554-3cca-46d6-b46a-03fe94ae8d89",
    gasPriceApi: `https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=${process.env.API_KEY}`
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};