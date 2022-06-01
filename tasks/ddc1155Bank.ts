import "@nomiclabs/hardhat-web3";
import { task } from "hardhat/config";
import { BigNumber } from "ethers";
const config = require('./config');


task("deployDDC1155Bank", "Deploy DDC1155Bank")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const bank = await ddc1155BankFactory.deploy();
            await bank.deployed();
            console.log("DDC1155Bank deployed to:", bank.address);
            env.contract.ddc1155BankAddress = bank.address
        }, true)
    });

task("mintDDCFromDDC1155", "mint NFT")
    .addParam("account", "NFT Account ")
    .addParam("amount", "NFT Account ")
    .addParam("ddcUri", "ddc URI ")
    .addParam("data", "ddc data")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155BankMnager = await ddc1155BankFactory.attach(env.contract.ddc1155BankProxyAddress);
            const result = await ddc1155BankMnager.safeMint(
                taskArgs.account,
                BigNumber.from(taskArgs.amount),
                taskArgs.ddcUri,
                Buffer.from(taskArgs.data),
            );
            console.log(result);
        }, true)
    });

task("getDDCURIFromDDC1155", "mint NFT")
    .addParam("ddcId", "ddc ID")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155BankMnager = await ddc1155BankFactory.attach(env.contract.ddc1155BankProxyAddress);

            const tokenID = BigNumber.from(taskArgs.ddcId)

            const result = await ddc1155BankMnager.ddcURI(tokenID);
            console.log(result);
        }, true)
    });

task("getBalanceFromDDC1155", "mint NFT")
    .addParam("owner", "ddc ID")
    .addParam("ddcId", "ddc ID")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155BankMnager = await ddc1155BankFactory.attach(env.contract.ddc1155BankProxyAddress);

            const tokenID = BigNumber.from(taskArgs.ddcId);
            

            const result = await ddc1155BankMnager.balanceOf(
                taskArgs.owner,
                tokenID,
            );
            console.log(result);
        }, true)
    });

task("setApprovedFromDDC1155", "mint NFT")
    .addParam("operator", "NFT operator ")
    .addParam("approved", "ddc ID")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155BankMnager = await ddc1155BankFactory.attach(env.contract.ddc1155BankProxyAddress);

            const result = await ddc1155BankMnager.setApprovalForAll(
                taskArgs.operator,
                taskArgs.approved,
            )
            console.log(result);
        }, true)
    });

task("getApprovedFromDDC1155", "mint NFT")
    .addParam("owner", "NFT operator ")
    .addParam("operator", "ddc ID")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155BankMnager = await ddc1155BankFactory.attach(env.contract.ddc1155BankProxyAddress);

            const result = await ddc1155BankMnager.isApprovedForAll(
                taskArgs.owner,
                taskArgs.operator,
            )
            console.log(result);
        }, true)
    });