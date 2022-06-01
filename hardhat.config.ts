import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";
import "@openzeppelin/hardhat-defender";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "solidity-coverage";

import "./tasks/ddc721Bank";
import "./tasks/ddc1155Bank";
import "./tasks/authority";
import "./tasks/erc1967Proxy";
import "./tasks/charge";
import "./tasks/all";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    testnet: {
      url: 'http://127.0.0.1:8545',
      gasPrice: 1,
      chainId: 1223,
      gas: 4000000,
      // 这个是 owner 账户
      accounts: ['820BFE6664E4D529453410AA1A17C56851B68412A954772655267CCC092FAF73'],
      // 这个是 Operator 账户
      // accounts: ['EFAD6219AA5BE69717003189963E934BB62A43D1FF0E58C0828F04B74CF0FD1E'],
      // 这个是 ddcPlatform01 账户
      // accounts: ['DFD55CDE653ECD9EC0EFCB9443610550CA966970B44AA553C042903010211025']
    },
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    }
  },
  gasReporter: {
    enabled: true,
    showMethodSig: true,
    maxMethodDiff: 10,
    currency: 'USD',
    gasPrice: 127,
    coinmarketcap: '5a0938c9-7912-438b-9baa-fcd71007b3d0'
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    spacing: 2
  }
};

export default config;
