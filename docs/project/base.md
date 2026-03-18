---
title: 项目优化
sidebarDepth: 0
---
[[toc]]
# 项目优化

## 钱包kit封装架构
```js
/* 
[ 业务应用层 (DApp/Internal Project) ] 
  封装业务Hooks或方法：
  - buildBtcSteps
  - buildBrc20Transfer
  - buildEvmSteps
  - buildErc20Transfer
---------------------------------------------------------
[ Wallet Kit 核心层 (Core) ]
  1、对外API（包含hook、非hook版）：
    - wallet(useWallets)
    - account(useAccount)
    - balance(useBalance)
    - connect(useConnect)
    - disconnect(useDisconnect)
    - chains(useChains)
    - tokens(useTokens)
  2、UI Components (统一的 Modal 弹窗, 错误提示, 加载动画)
---------------------------------------------------------
[ 链适配器层 (Adapters) ]
  不同链适配器不同，共有：
    - connectors(不同钱包连接器)
    - core(核心链方法：getBalance、getAccount、switchChain...)
    - hooks(useConnect、useDisconnect、useConnectors..)
    - state(当前链钱包的状态)
    - Provider(管理自动重连、账号监听、网络监听等)
---------------------------------------------------------
[ 协议抽象层 ]
  IConnector定义统一行为: (不同链有差异)
    - connect
    - requestAccounts
    - getBalance
    - switchNetwork
    ....
---------------------------------------------------------
[ 底层钱包 (Wallets) ]
    实现具体逻辑，抹平不同钱包不同链之间的差异化
*/
```

## 死链治理
问题：NFT图片存的都是带有CDN域名的完整链接，CDN域名失效不可用后就成了死链   
方案：APP侧出接口获取当前可用的CDN域名，前端自己拼接。   
NFT侧：调用后端转发的域名，拿到域名之后更换死链中的域名，之后展示。 

## NFT图片优化
图片太大，大的有1-2mb，访问太慢。   
方案：
- 1、上传之前本地压缩。
- 2、由于使用的域名是CDN，CDN有提供图片压缩服务，NFT侧试点之后针对不同的使用方给出不同的配置以供使用。之前访问3秒左右，优化后1秒以内

针对以上两点，开发NFT图片优化模块，传入参数（国内、国外,使用场景），自动给出对应的NFT图片连接（带有可访问CDN域名且图片已按对应场景压缩）

