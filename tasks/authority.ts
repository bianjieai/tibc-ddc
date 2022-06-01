import "@nomiclabs/hardhat-web3";
import { task, types } from "hardhat/config";
import { BigNumber } from "ethers";
const config = require('./config');


task("deployAuthority", "Deploy Authority")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authority = await authorityFactory.deploy();
            await authority.deployed();
            console.log("Authority deployed to:", authority.address);
            env.contract.authorityAddress = authority.address
        }, true)
    });

// 合约拥有者调用
// owner 账户
task("addOperatorFromAuthority", "Deploy Authority")
    .addParam("account", "operator to grant role")
    .addParam("accountName", "account name in authority")
    .addParam("accountDid", "account did in authority")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            const result = await authorityManager.addOperator(
                taskArgs.account,
                taskArgs.accountName,
                taskArgs.accountDid
            );
            console.log(result);
        }, true)
    });

// 这个是 Operator 调用
// 增加的是平台账户
task("addAccountByOperatorFromAuthority", "Deploy Authority")
    .addParam("account", "operator to grant role")
    .addParam("accountName", "")
    .addParam("accountDid", "")
    .addParam("leaderDid", "", "", types.string, true)
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            const result = await authorityManager.addAccountByOperator(
                taskArgs.account,
                taskArgs.accountName,
                taskArgs.accountDid,
                taskArgs.leaderDid
            );
            console.log(result);
        }, true)
    });


// 这个是 平台账户 调用 
// 增加的是普通用户
task("addAccountByPlatformFromAuthority", "Deploy Authority")
    .addParam("account", "operator to grant role")
    .addParam("accountName", "")
    .addParam("accountDid", "")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            const result = await authorityManager.addAccountByPlatform(
                taskArgs.account,
                taskArgs.accountName,
                taskArgs.accountDid
            );
            console.log(result);
        }, true)
    });

// 跨平台调用授权
// operator 调用
task("crossPlatformApproval", "Deploy Authority")
    .addParam("from", "operator to grant role")
    .addParam("to", "operator to grant role")
    .addParam("approved", "operator to grant role")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            
            const result = await authorityManager.crossPlatformApproval(
                taskArgs.from,
                taskArgs.to,
                taskArgs.approved,
            );
            console.log(result);
        }, true)
    });

task("onePlatformCheck", "Deploy Authority")
    .addParam("first", "operator to grant role")
    .addParam("second", "operator to grant role")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            const result = await authorityManager.onePlatformCheck(
                taskArgs.first,
                taskArgs.second,
            );
            console.log(result);
        }, true)
    });

// 跨平台检测授权
// operator 调用
task("crossPlatformCheck", "Deploy Authority")
    .addParam("from", "operator to grant role")
    .addParam("to", "operator to grant role")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            
            const result = await authorityManager.crossPlatformCheck(
                taskArgs.from,
                taskArgs.to,
            );
            console.log(result);
        }, true)
    });

task("getAccountFromAuthority", "Deploy Authority")
    .addParam("account", "operator to grant role")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            const result = await authorityManager.getAccount(taskArgs.account);
            console.log(result);
        }, true)
    });

    

task("hasFunctionPermission", "Deploy Authority")
    .addParam("account", "operator to grant role")
    .addParam("contractAddress", "operator to grant role")
    .addParam("sig", "operator to grant role")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);
            const result = await authorityManager.hasFunctionPermission(
                taskArgs.account,
                taskArgs.contractAddress,
                Buffer.from(taskArgs.sig, "hex")
            );
            console.log(result);
        }, true)
    });