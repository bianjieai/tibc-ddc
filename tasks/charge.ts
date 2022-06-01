import "@nomiclabs/hardhat-web3";
import { task } from "hardhat/config";
import { BigNumber } from "ethers";
const config = require('./config');


task("deployCharge", "Deploy Charge")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const charge = await chargeFactory.deploy();
            await charge.deployed();
            console.log("charge deployed to:", charge.address);
            env.contract.chargeAddress = charge.address
        }, true)
    });

task("getBalances", "Deploy ERC721Bank")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const charge = await chargeFactory.attach(env.contract.chargeAddressProxyAddress);
            const result = await charge.balanceOf("0x089A6AD0185FB277674CE3E99F9FDFDB85A48652");
            console.log(result);
        }, true)
    });

task("selfRecharge", "Deploy ERC721Bank")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const charge = await chargeFactory.attach(env.contract.chargeAddressProxyAddress);
            const result = await charge.selfRecharge(BigNumber.from("10000000000"));
            console.log(result);

        }, true)
    });

task("recharge", "Deploy ERC721Bank")
    .addParam("account", "recharge account")
    .addParam("amount", "recharge amount to account")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const charge = await chargeFactory.attach(env.contract.chargeAddressProxyAddress);
            const result = await charge.recharge(
                taskArgs.account,
                BigNumber.from(taskArgs.amount),
            )
            console.log(result);

        }, true)
    });

task("getBlancesFromCharge", "Deploy ERC721Bank")
    .addParam("account", "recharge account")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const charge = await chargeFactory.attach(env.contract.chargeAddressProxyAddress);
            const result = await charge.balanceOf(
                taskArgs.account
            )
            console.log(result);

        }, true)
    });