import "@nomiclabs/hardhat-web3";
import { task } from "hardhat/config";
import { BigNumber } from "ethers";
import { time } from "console";
const config = require('./config');
const data = "0x8129fc1c";

// ddc721
const ddc721DictArr = [
    { "func": "BalanceOf", "sig": "0x70a08231", "fee": "0" },
    { "func": "DdcURI", "sig": "0x293ec97c", "fee": "0" },
    { "func": "GetApproved", "sig": "0x081812fc", "fee": "0" },
    { "func": "IsApprovedForAll", "sig": "0xe985e9c5", "fee": "0" },
    { "func": "Name", "sig": "0x06fdde03", "fee": "0" },
    { "func": "Owner", "sig": "0x8da5cb5b", "fee": "0" },
    { "func": "OwnerOf", "sig": "0x6352211e", "fee": "0" },
    { "func": "SupportsInterface", "sig": "0x01ffc9a7", "fee": "0" },
    { "func": "Symbol", "sig": "0x95d89b41", "fee": "0" },
    { "func": "Approve", "sig": "0x095ea7b3", "fee": "0" },
    { "func": "Burn", "sig": "0x42966c68", "fee": "20" },
    { "func": "Freeze", "sig": "0xd7a78db8", "fee": "0" },
    { "func": "Initialize", "sig": "0x8129fc1c", "fee": "0" },
    { "func": "Mint", "sig": "0xd0def521", "fee": "100" },
    { "func": "RenounceOwnership", "sig": "0x715018a6", "fee": "0" },
    { "func": "SafeMint", "sig": "0xf6dda936", "fee": "100" },
    { "func": "SafeTransferFrom", "sig": "0xb88d4fde", "fee": "0" },
    { "func": "SetApprovalForAll", "sig": "0xa22cb465", "fee": "0" },
    { "func": "SetAuthorityProxyAddress", "sig": "0xc5837d82", "fee": "0" },
    { "func": "SetChargeProxyAddress", "sig": "0x44d891df", "fee": "0" },
    { "func": "SetNameAndSymbol", "sig": "0x5a446215", "fee": "0" },
    { "func": "SetURI", "sig": "0x862440e2", "fee": "0" },
    { "func": "TransferFrom", "sig": "0x23b872dd", "fee": "30" },
    { "func": "TransferOwnership", "sig": "0xf2fde38b", "fee": "0" },
    { "func": "UnFreeze", "sig": "0xd302b0dc", "fee": "0" },
    { "func": "UpgradeTo", "sig": "0x3659cfe6", "fee": "0" },
    { "func": "UpgradeToAndCall", "sig": "0x4f1ef286", "fee": "0" },
]

// ddc1155
const ddc1155DictArr = [
    { "func": "BalanceOf", "sig": "0x4e1273f4", "fee": "0" },
    { "func": "BalanceOfBatch", "sig": "0x293ec97c", "fee": "0" },
    { "func": "DdcURI", "sig": "0xe985e9c5", "fee": "0" },
    { "func": "IsApprovedForAll", "sig": "0x8da5cb5b", "fee": "0" },
    { "func": "Owner", "sig": "0x01ffc9a7", "fee": "0" },
    { "func": "SupportsInterface", "sig": "0x9dc29fac", "fee": "0" },
    { "func": "Burn", "sig": "0xb2dc5dc3", "fee": "30" },
    { "func": "BurnBatch", "sig": "0xd7a78db8", "fee": "0" },
    { "func": "Freeze", "sig": "0x8129fc1c", "fee": "0" },
    { "func": "Initialize", "sig": "0x715018a6", "fee": "0" },
    { "func": "RenounceOwnership", "sig": "0x2eb2c2d6", "fee": "30" },
    { "func": "SafeBatchTransferFrom", "sig": "0xb55bc617", "fee": "100" },
    { "func": "SafeMint", "sig": "0x63570355", "fee": "100" },
    { "func": "SafeMintBatch", "sig": "0xf242432a", "fee": "30" },
    { "func": "SafeTransferFrom", "sig": "0xa22cb465", "fee": "0" },
    { "func": "SetApprovalForAll", "sig": "0xc5837d82", "fee": "0" },
    { "func": "SetAuthorityProxyAddress", "sig": "0x44d891df", "fee": "0" },
    { "func": "SetChargeProxyAddress", "sig": "0x685e8247", "fee": "0" },
    { "func": "SetURI", "sig": "0xf2fde38b", "fee": "0" },
    { "func": "TransferOwnership", "sig": "0xd302b0dc", "fee": "0" },
    { "func": "UnFreeze", "sig": "0x3659cfe6", "fee": "0" },
    { "func": "UpgradeTo", "sig": "0x4f1ef286", "fee": "0" },
]


task("deployAllLogic", "Deploy All For logic")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            // Authority
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authority = await authorityFactory.deploy();
            await authority.deployed();
            console.log("Authority deployed to:", authority.address);
            env.contract.authorityAddress = authority.address

            // charge
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const charge = await chargeFactory.deploy();
            await charge.deployed();
            console.log("charge deployed to:", charge.address);
            env.contract.chargeAddress = charge.address

            // DDC721
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721Bank = await ddc721BankFactory.deploy();
            await ddc721Bank.deployed();
            console.log("DDC721Bank deployed to:", ddc721Bank.address);
            env.contract.ddc721BankAddress = ddc721Bank.address

            // DDC1155
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155Bank = await ddc1155BankFactory.deploy();
            await ddc1155Bank.deployed();
            console.log("DDC1155Bank deployed to:", ddc1155Bank.address);
            env.contract.ddc1155BankAddress = ddc1155Bank.address

        }, true)
    });

task("deployAllProxy", "Deploy ERC1967Proxy For Authority")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const erc1967ProxyFactoryForauthority = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967ProxyForauthority = await erc1967ProxyFactoryForauthority.deploy(env.contract.authorityAddress, data);
            await erc1967ProxyForauthority.deployed();
            console.log("authorityProxyAddress deployed to:", erc1967ProxyForauthority.address);
            env.contract.authorityProxyAddress = erc1967ProxyForauthority.address

            // charge 合约
            const erc1967ProxyFactoryForCharge = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967ProxyForCharge = await erc1967ProxyFactoryForCharge.deploy(env.contract.chargeAddress, data);
            await erc1967ProxyForCharge.deployed();
            console.log("chargeAddressProxyAddress deployed to:", erc1967ProxyForCharge.address);
            env.contract.chargeAddressProxyAddress = erc1967ProxyForCharge.address

            // DDC721
            const erc1967ProxyFactoryForDDC721 = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967ProxyForDDC721 = await erc1967ProxyFactoryForDDC721.deploy(env.contract.ddc721BankAddress, data);
            await erc1967ProxyForDDC721.deployed();
            console.log("ddc721BankProxyAddress deployed to:", erc1967ProxyForDDC721.address);
            env.contract.ddc721BankProxyAddress = erc1967ProxyForDDC721.address

            //DDC1155
            const erc1967ProxyFactoryForDDC1155 = await hre.ethers.getContractFactory('ERC1967Proxy');
            const erc1967ProxyForDDC1155 = await erc1967ProxyFactoryForDDC1155.deploy(env.contract.ddc1155BankAddress, data);
            await erc1967ProxyForDDC1155.deployed();
            console.log("ddc1155BankProxyAddress deployed to:", erc1967ProxyForDDC1155.address);
            env.contract.ddc1155BankProxyAddress = erc1967ProxyForDDC1155.address

        }, true)
    });

task("getTransactionReceiptForAll", "Deploy Authority")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            let txs = env.txs;
            let resultTxs = []
            for (let index = 0; index < txs.length; index++) {
                const result = await hre.web3.eth.getTransactionReceipt(txs[index]["hash"]);
                if (!result.status) {
                    resultTxs.push(txs[index]);
                }
            }
            if (resultTxs.length == 0) {
                console.log("all tx is success")!
            }else {
                console.log("have tx is failed")!
            }
            env.txs = resultTxs;

        }, true)
    });



// 此操作为 owner
task("setProxyAddressForAllLogic", "Deploy Charge")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            // charge
            console.log("Set proxy contract(authorityProxyAddress) call permission for charge ");
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const chargeManager = await chargeFactory.attach(env.contract.chargeAddressProxyAddress);

            const chargeResult = await chargeManager.setAuthorityProxyAddress(env.contract.authorityProxyAddress);
            console.log("charge: setAuthorityProxyAddress tx hash = ", chargeResult.hash);
            let chargeTxMap = {
                "hash": chargeResult.hash,
                "moudle": "setCallPermissionForRoleCharge",
                "func": "setAuthorityProxyAddress"
            }
            env.txs.push(chargeTxMap);


            // DDC721
            console.log("Set proxy contract(authorityProxyAddress & chargeAddressProxyAddress) call permission for DDC721 ");
            const ddc721BankFactory = await hre.ethers.getContractFactory('DDC721');
            const ddc721BankMnager = await ddc721BankFactory.attach(env.contract.ddc721BankProxyAddress);

            const ddc721Result1 = await ddc721BankMnager.setAuthorityProxyAddress(env.contract.authorityProxyAddress);
            console.log("721: setAuthorityProxyAddress tx hash = ", ddc721Result1.hash);

            let ddc721Result1TxMap = {
                "hash": ddc721Result1.hash,
                "moudle": "setCallPermissionForRole721",
                "func": "setAuthorityProxyAddress"
            }
            env.txs.push(ddc721Result1TxMap);

            const ddc721Result2 = await ddc721BankMnager.setChargeProxyAddress(env.contract.chargeAddressProxyAddress);
            console.log("721: setChargeProxyAddress tx hash = ", ddc721Result2.hash);

            let ddc721Result2TxMap = {
                "hash": ddc721Result2.hash,
                "moudle": "setCallPermissionForRole721",
                "func": "setChargeProxyAddress"
            }
            env.txs.push(ddc721Result2TxMap);

            // DDC1155
            console.log("Set proxy contract(authorityProxyAddress & chargeAddressProxyAddress) call permission for DDC1155 ");
            const ddc1155BankFactory = await hre.ethers.getContractFactory('DDC1155');
            const ddc1155BankMnager = await ddc1155BankFactory.attach(env.contract.ddc1155BankProxyAddress);

            const ddc1155Result1 = await ddc1155BankMnager.setAuthorityProxyAddress(env.contract.authorityProxyAddress);
            console.log("1155: setChargeProxyAddress tx hash = ", ddc1155Result1.hash);

            let ddc1155Result1TxMap = {
                "hash": ddc1155Result1.hash,
                "moudle": "setCallPermissionForRole1155",
                "func": "setAuthorityProxyAddress"
            }
            env.txs.push(ddc1155Result1TxMap);

            const ddc1155Result2 = await ddc1155BankMnager.setChargeProxyAddress(env.contract.chargeAddressProxyAddress);
            console.log("1155: setChargeProxyAddress tx hash = ", ddc1155Result2.hash);

            let ddc1155Result2TxMap = {
                "hash": ddc1155Result2.hash,
                "moudle": "setCallPermissionForRole1155",
                "func": "setChargeProxyAddress"
            }
            env.txs.push(ddc1155Result2TxMap);

        }, true)
    });

// 从此函数开始操作全是 operator
task("setCallPermissionForRole", "Set call permissions for roles")
    .addParam("role", "account role")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const authorityFactory = await hre.ethers.getContractFactory('Authority');
            const authorityManager = await authorityFactory.attach(env.contract.authorityProxyAddress);

            // 721
            console.log("Start setting permissions for the methods of the DDC721 contract...");
            for (let index = 0; index < ddc721DictArr.length; index++) {
                let result = await authorityManager.addFunction(
                    taskArgs.role,
                    env.contract.ddc721BankProxyAddress,
                    Buffer.from(ddc721DictArr[index]["sig"].slice(2), "hex"),
                );
                // 
                let txMap = {
                    "hash": result.hash,
                    "moudle": "setCallPermissionForRole721",
                    "func": ddc721DictArr[index]["func"]
                }
                env.txs.push(txMap);

            };

            // 1155
            console.log("Start setting permissions for the methods of the DDC1155 contract...");
            for (let index = 0; index < ddc1155DictArr.length; index++) {
                let result = await authorityManager.addFunction(
                    taskArgs.role,
                    env.contract.ddc1155BankProxyAddress,
                    Buffer.from(ddc1155DictArr[index]["sig"].slice(2), "hex"),
                );
                let txMap = {
                    "hash": result.hash,
                    "moudle": "setCallPermissionForRole1155",
                    "func": ddc721DictArr[index]["func"]
                }
                env.txs.push(txMap);
            };

            console.log("Done!")
        }, true)
    });

task("setFeeForFunc", "Set call permissions for roles")
    .setAction(async (taskArgs, hre) => {
        await config.load(async function (env: any) {
            const chargeFactory = await hre.ethers.getContractFactory('Charge');
            const chargeManager = await chargeFactory.attach(env.contract.chargeAddressProxyAddress);

            //721
            console.log("Start setting up fees for the methods of the DDC721 contract...");
            for (let index = 0; index < ddc721DictArr.length; index++) {
                let result = await chargeManager.setFee(
                    env.contract.ddc721BankProxyAddress,
                    Buffer.from(ddc721DictArr[index]["sig"].slice(2), "hex"),
                    BigNumber.from(ddc721DictArr[index]["fee"]),
                );

                let txMap = {
                    "hash": result.hash,
                    "moudle": "setFeeForFunc721",
                    "func": ddc721DictArr[index]["func"]
                }
                env.txs.push(txMap);

            };

            console.log("Start setting up fees for the methods of the DDC1155 contract...");
            for (let index = 0; index < ddc1155DictArr.length; index++) {
                let result = await chargeManager.setFee(
                    env.contract.ddc1155BankProxyAddress,
                    Buffer.from(ddc1155DictArr[index]["sig"].slice(2), "hex"),
                    BigNumber.from(ddc1155DictArr[index]["fee"]),
                );

                let txMap = {
                    "hash": result.hash,
                    "moudle": "setFeeForFunc1155",
                    "func": ddc1155DictArr[index]["func"]
                }
                env.txs.push(txMap);
            };
            console.log("Done!")
        }, true)
    });