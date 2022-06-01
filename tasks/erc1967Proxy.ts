import "@nomiclabs/hardhat-web3";
import { task } from "hardhat/config";
import { BigNumber } from "ethers";
const config = require('./config');

const data = "0x8129fc1c";


task("deployERC1967ProxyForAuthority", "Deploy ERC1967Proxy For Authority")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            hre.ethers.getContractFactoryFromArtifact
            const erc1967ProxyFactory = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967Proxy = await erc1967ProxyFactory.deploy(env.contract.authorityAddress, data);
            await erc1967Proxy.deployed();
            console.log("authorityProxyAddress deployed to:", erc1967Proxy.address);
            env.contract.authorityProxyAddress = erc1967Proxy.address

        }, true)
    });


task("deployERC1967ProxyForCharge", "Deploy ERC1967Proxy For Charge")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const erc1967ProxyFactory = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967Proxy = await erc1967ProxyFactory.deploy(env.contract.chargeAddress, data);
            await erc1967Proxy.deployed();
            console.log("chargeAddressProxyAddress deployed to:", erc1967Proxy.address);
            env.contract.chargeAddressProxyAddress = erc1967Proxy.address

        }, true)
    });

task("deployERC1967ProxyForDDC721", "Deploy ERC1967Proxy For DDC721")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const erc1967ProxyFactory = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967Proxy = await erc1967ProxyFactory.deploy(env.contract.ddc721BankAddress, data);
            await erc1967Proxy.deployed();
            console.log("ddc721BankProxyAddress deployed to:", erc1967Proxy.address);
            env.contract.ddc721BankProxyAddress = erc1967Proxy.address

        }, true)
    });

task("deployERC1967ProxyForDDC1155", "Deploy ERC1967Proxy For DDC1155")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const erc1967ProxyFactory = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967Proxy = await erc1967ProxyFactory.deploy(env.contract.ddc1155BankAddress, data);
            await erc1967Proxy.deployed();
            console.log("ddc1155BankProxyAddress deployed to:", erc1967Proxy.address);
            env.contract.ddc1155BankProxyAddress = erc1967Proxy.address

        }, true)
    });