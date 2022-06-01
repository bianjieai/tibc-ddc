import "@nomiclabs/hardhat-web3";
import { task } from "hardhat/config";
import { BigNumber } from "ethers";
const config = require('./config');


task("deployDDC721Bank", "Deploy ERC721Bank")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const bank = await ddc721BankFactory.deploy();
            await bank.deployed();
            console.log("DDC721Bank deployed to:", bank.address);
            env.contract.ddc721BankAddress = bank.address
        }, true)
    });


// 这个里请使用 ddcPlatform01 账户
task("mintDDCFromDDC721", "mint NFT")
    .addParam("account", "NFT Account ")
    .addParam("ddcUri", "ddc URI ")
    .addParam("data", "ddc data ")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721BankMnager = await ddc721BankFactory.attach(env.contract.ddc721BankProxyAddress);
            const result = await ddc721BankMnager.safeMint(
                taskArgs.account,
                taskArgs.ddcUri,
                Buffer.from(taskArgs.data)
            );
            console.log(result);
        }, true)
    });

task("getDDCURIFromDDC721", "mint NFT")
    .addParam("ddcId", "ddc ID")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721BankMnager = await ddc721BankFactory.attach(env.contract.ddc721BankProxyAddress);

            const tokenID = BigNumber.from(taskArgs.ddcId)

            const result = await ddc721BankMnager.ddcURI(tokenID);
            console.log(result);
        }, true)
    });

task("setApprovedFromDDC721", "mint NFT")
    .addParam("operator", "NFT operator ")
    .addParam("ddcId", "ddc ID")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721BankMnager = await ddc721BankFactory.attach(env.contract.ddc721BankProxyAddress);

            const tokenID = BigNumber.from(taskArgs.ddcId)
            const result = await ddc721BankMnager.approve(
                taskArgs.operator,
                tokenID
            )
            console.log(result);
        }, true)
    });

task("getTokenOwnerFromDDC721", "get Approved")
    .addParam("ddcId", "NFT ID ")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721BankMnager = await ddc721BankFactory.attach(env.contract.ddc721BankProxyAddress);

            const tokenID = BigNumber.from(taskArgs.ddcId);
            const result = await ddc721BankMnager.ownerOf(tokenID);
            console.log(result);
        }, true)
    });

task("getApprovedFromDDC721", "get Approved")
    .addParam("ddcId", "NFT ID ")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721BankMnager = await ddc721BankFactory.attach(env.contract.ddc721BankProxyAddress);

            const tokenID = BigNumber.from(taskArgs.ddcId)
            const result = await ddc721BankMnager.getApproved(
                tokenID
            );
            console.log(result);
        }, true)
    });
