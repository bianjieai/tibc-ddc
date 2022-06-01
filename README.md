# DDC 合约

## 准备工作

准备三个账户：

1. owner: 部署合约
2. operator: 设置权限
3. platform: 调用合约

```bash
# operator
irita keys add <operator_name> --keyring-backend file --keyring-dir mytestnet/node0/iritacli --algo eth_secp256k1

# platform
irita keys add  <platform_name> --keyring-backend file --keyring-dir mytestnet/node0/iritacli --algo eth_secp256k1


# 充值

echo 12345678 | irita tx bank send node0 <operator_iaa_addr> <amount> --keyring-backend file --keyring-dir mytestnet/node0/iritacli  --chain-id wenchangchain -b block -y 

echo 12345678 | irita tx bank send node0 <platform_iaa_addr>  <amount> --keyring-backend file --keyring-dir mytestnet/node0/iritacli  --chain-id wenchangchain -b block -y 

```

## 逻辑合约部署

**账户是部署者账户**

### 部署 `authority` 合约

**owner 账户操作** 

```bash
yarn hardhat deployAuthority --network testnet
```

### 部署 `charge` 合约

**owner 账户操作** 

```bash
yarn hardhat deployCharge --network testnet
```

### 部署` DDC721` 合约

**owner 账户操作** 

```bash
yarn hardhat deployDDC721Bank --network testnet
```

### 部署 `DDC1155`合约

**owner 账户操作** 

```
yarn hardhat deployDDC1155Bank --network testnet
```

## 代理合约部署

### 部署`authority` 合约的代理合约

**owner 账户操作** 

```bash
yarn hardhat deployERC1967ProxyForAuthority --network testnet
```

### 部署`charge` 合约的代理合约

**owner 账户操作** 

```bash
yarn hardhat deployERC1967ProxyForCharge --network testnet
```

### 部署`charge` 合约的代理合约

**owner 账户操作** 

```bash
yarn hardhat deployERC1967ProxyForDDC721 --network testnet
```

### 部署`charge` 合约的代理合约

**owner 账户操作** 

```bash
 yarn hardhat deployERC1967ProxyForDDC1155 --network testnet
```

## 合约授权

### 为合约设置调用 proxy 权限

**owner 账户操作** 

```bash
yarn hardhat setProxyAddressForAllLogic --network testnet

# 查看结果 等个几秒
yarn hardhat getTransactionReceiptForAll --network testnet

```

### 增加 `Operator`

**owner 账户操作** 

```bash
yarn hardhat addOperatorFromAuthority --account <operator_eth_addr> --account-name <operator_name> --account-did <operator_did> --network testnet

# 查看账户信息
yarn hardhat getAccountFromAuthority --account <operator_eth_addr> --network testnet

```

### 增加 `Platform`

**Operator 操作**

```bash
yarn hardhat addAccountByOperatorFromAuthority --account <platform_eth_addr> --account-name <platform_name> --account-did <platform_did>  --network testnet

# 查看账户信息
yarn hardhat getAccountFromAuthority --account <platform_eth_addr> --network testnet
```

### 为 Operator 设置调用权限

**账户是 operator 账户**

```bash
yarn hardhat setCallPermissionForRole --role 0 --network testnet

# 查看结果 等个几秒
yarn hardhat getTransactionReceiptForAll --network testnet
```

### 为 `platform` 设置调用权限

**Operator 操作**

```bash
yarn hardhat setCallPermissionForRole --role 1 --network testnet
# 查看结果 等个几秒
yarn hardhat getTransactionReceiptForAll --network testnet
```

### 为 `consumer` 设置调用权限

**Operator 操作**

```bash
yarn hardhat setCallPermissionForRole --role 2 --network testnet
# 查看结果 等个几秒
yarn hardhat getTransactionReceiptForAll --network testnet
```

### 为 721/1155 合约设置 Fee

**Operator 操作**

```bash
yarn hardhat setFeeForFunc --network testnet
# 查看结果 等个几秒
yarn hardhat getTransactionReceiptForAll --network testnet
```

## 充值

**Operator 操作**

### 自充值

```bash
yarn hardhat selfRecharge --network testnet

# 查询余额
yarn hardhat getBlancesFromCharge --account 0x089A6AD0185FB277674CE3E99F9FDFDB85A48652 --network testnet
```

### 为用户充值

**Operator 操作**

```bash
yarn hardhat recharge --account 0xF6150FBDDC35E4B6AABD1E577956418BD128E486 --amount 10000000 --network testnet
# 查询余额
yarn hardhat getBlancesFromCharge --account 0xF6150FBDDC35E4B6AABD1E577956418BD128E486 --network testnet
```

# 跨链调用

## 721

### 增加用户

**Operator 操作**

把 **transferNFT** 的合约地址添加为 `platform`

```bash
yarn hardhat addAccountByOperatorFromAuthority --account <transferNFTAddr>  --account-name transferNF1 --account-did did:transferNFT1  --leader-did did:ddcPlatform01 --network testnet

# 获取账户信息
yarn hardhat getAccountFromAuthority --account <transferNFTAddr> --network testnet
```
### 充值

**Operator 操作**

```bash
yarn hardhat recharge --account <transferNFTAddr> --amount 10000000 --network testnet

# 查询余额
yarn hardhat getBlancesFromCharge --account <transferNFTAddr> --network testnet
```



### mint

**platfrom 操作**

```bash
yarn hardhat mintDDCFromDDC721 --account <plafrom_eth_addr>  --ddc-uri <ddc_uri>  --data "" --network testnet

# 查询 DDC 信息
yarn hardhat getDDCURIFromDDC721 --ddc-id <ddcId> --network testnet
```

### 资产授权给 `transferNFT`

**platfrom 操作**

```bash
# 授权
yarn hardhat setApprovedFromDDC721 --network testnet --ddc-id <ddcId> --operator <transferNFTAddr>

# 查看授权
yarn hardhat getApprovedFromDDC721 --ddc-id <ddcId> --network testnet
```



### 资产转移

**在TIBC项目中使用 platform 账户进行调用 transferNFT**

```bash
yarn hardhat transferNFT --dest-contract <ddc721BankProxyAddress> --nftid <ddcId> --destchain <destChainName> --sender <nftOwner> --receiver <destChainAddr> --network testnet

# 示例
yarn hardhat transferNFT --dest-contract 0x372bE5443CEc038A24EE1c7ec3A5cF19a35F55Ec --nftid 1 --destchain bsnhub-testnet --sender 0xF6150FBDDC35E4B6AABD1E577956418BD128E486 --receiver iaa17zmtz2zmxckqmrka5nyr6wpy8fdfvh8zm3rfm6 --network testnet
```

## 1155

### 增加用户

**Operator 操作**

**把 transferMT 的合约地址添加为 `platform`**

```bash
yarn hardhat addAccountByOperatorFromAuthority --account <transferMT>  --account-name transferMT1 --account-did did:transferMT1  --leader-did did:ddcPlatform01 --network testnet

# 获取账户信息
yarn hardhat getAccountFromAuthority --account <transferMT> --network testnet
```

**充值**

**Operator 操作** 

```bash
yarn hardhat recharge --account  <transferMT>  --amount 10000000 --network testnet

# 查询余额
yarn hardhat getBlancesFromCharge --account  <transferMT>  --network testnet
```

### mint

**platfrom 操作**

```bash
yarn hardhat mintDDCFromDDC1155 --account 0xF6150FBDDC35E4B6AABD1E577956418BD128E486 --amount 10 --ddc-uri http://114.55.124.92:8081/api/4  --data "" --network testnet
# 查询 DDC 信息
yarn hardhat getDDCURIFromDDC1155 --ddc-id 1 --network testnet

# 查询数量
yarn hardhat getBalanceFromDDC1155 --owner 0xF6150FBDDC35E4B6AABD1E577956418BD128E486 --ddc-id 1 --network testnet
```

### 资产授权给 `transferMT`

**platfrom 操作**

```bash
# 授权
yarn hardhat setApprovedFromDDC1155 --operator  <transferMT>  --approved true  --network testnet

# 查看授权
yarn hardhat getApprovedFromDDC1155 --owner  0xF6150FBDDC35E4B6AABD1E577956418BD128E486  --operator <transferMT> --network testnet
```



### 资产转移

在 `tibc-solidity` 项目执行

```bash
yarn hardhat transferMT --dest-contract <ddc1155_proxy_addr> --mtid <mt_id> --amount <amount> --destchain <dest_chain_name> --sender <mt_oprator> --receiver <dest_chain_reciver> --network <network>
```
