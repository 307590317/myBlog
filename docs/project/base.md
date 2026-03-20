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
  3、Provider(不同链适配器的Provider，方便用户根据选择自己嵌套)
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
- 2、由于使用的域名是CDN，CDN有提供图片压缩服务
  - webp图片压缩（问号传参开启）：画质无损的前提下，将平均单图片体积压缩了30%-50%。
  - 图片缩放（问号传参开启）：等比压缩，图片传输体积降低70%。   
  NFT侧试点之后针对不同场景给出不同的配置以供使用。之前访问3秒左右，优化后1秒以内

针对以上两点，开发NFT图片优化模块，传入参数（国内、国外，使用场景），自动给出对应的NFT图片连接（带有可访问CDN域名且图片已按对应场景压缩）

## 钱包SDK适配器
问题：H5 页面在 钱包App 内调用原生方法（JSBridge）时的回调版本兼容性、注入时机问题。 
老版本的callJS需要H5业务方在页面中用下面代码做字符串回调的兼容处理（只要用到就需要写）：
```js
/* 老的调用方式 */
  rewriteCB() {
      // ios
      if (platform.platform === 8) {
          if (window.hbWallet) {
              window.hbWallet.callJS = ({ param, method }) => {
                  this.dealCallback(method, param);
              };
              return;
          }
      } else if (platform.platform === 9 && window.WebViewJavascriptBridge) { // 安卓
          window.WebViewJavascriptBridge.registerHandler('callJS', (str) => {
              const { param, method } = JSON.parse(str);
              this.dealCallback(method, param);

          });
          return;
      }
  },
  // 处理回调
  dealCallback(method, data) {
      if (method === 'callback_270192') {
          this.getDeviceIdRes_old = data;
      } else if (method === 'callback_270193') {
          this.getIsRootRes_old = data;
      } else if (method === 'callback_270201') {
          this.getAppVersionRes_old = data;
      }
  },
```
解决方案：封装SDK适配器做中间层，统一解决回调兼容性以及注入时机问题。

根据版本判断兼容性，业务侧改为统一传递函数而不是字符串回调。  
如果是低版本：  
- 1、通过cookie缓存版本状态，避免重复检测。
- 2、劫持callAPI，根据action + Date.now()生成字符串作为回调函数的key，并把传入的回调函数放入内部变量callbackMaps中，由于是老版本，需要把key当成回调传给原生。
  const callbackName = action + Date.now()
  callbackMaps[callbackKey] = callback
  callAPI(action, params, callbackName)

- 3、劫持callJS，根据传回的callbackName，去callbackMaps字典里找到对应的匿名函数并执行传入得到的data，执行完之后删除，释放内存
- 4、通过重试机制（代码通过 setTimeout 轮询（最多 5 次）），确保原生调用对象前，已经成功注入。

解决了从“字符串回调”向“函数回调”过渡期间的架构断层。让业务不需要关注app当前是什么版本，统一传递回调即可。