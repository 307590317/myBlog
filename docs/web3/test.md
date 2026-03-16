---
title: web3 test
sidebarDepth: 0
---
[[toc]]
# web3 test

## Web3 前端和传统前端最大的差异是什么？

**差异：**

- **状态来源不同**：传统前端状态多来自后端/数据库；Web3 还需要处理链上状态。
- **交互是交易**：读取数据是 RPC call，写数据是交易。
- **身份是钱包地址**：用户通过钱包地址 + 签名作为身份。
- **失败模型不同**：交易可能 pending、revert、gas 不足。
- **安全模型更复杂**：需要防止恶意签名、钓鱼交易等。

## 什么是 EIP-1193？为什么重要？

EIP-1193 是以太坊 Provider 的标准接口规范。

钱包（如 MetaMask）通过 `window.ethereum` 向网页暴露能力。

**示例**

```javascript
await window.ethereum.request({ method: "eth_requestAccounts" });

const chainId = await window.ethereum.request({
  method: "eth_chainId"
});
```

**常见事件**
- `accountsChanged`
- `chainChanged`
- `disconnect`

DApp 不直接管理私钥，只能请求钱包签名/发送交易

**存在的问题：**
各个钱包插件会竞争性的将自己注入到window.ethereum，导致后加载的钱包覆盖先加载的钱包，用户唤起的不是自己想要交互的钱包；

EIP-6963的出现就是为了解决浏览器中多个钱包插件同时存在产生冲突的问题。
用户可以选择到自己想要操作的那个钱包，不再有冲突的问题。

## eth_call 和 eth_sendTransaction 的区别

**eth_call：**
- 只读调用
- 不会修改链状态
- 不消耗 gas

**eth_sendTransaction**
- 会修改链状态
- 需要用户签名
- 会消耗 gas
- 会生成 transaction hash

**为什么 eth_call 也可能失败？**

合约 revert、调用数据不对、读的区块状态不同、节点限制、需要 from/value 参数等。

## ethers.js vs viem

**ethers.js**
优点：

- 生态成熟
- 文档丰富

**viem：**

优点：

- TypeScript 类型更友好
- 性能、体积更优秀
- 与 wagmi 集成更好

选型建议：
- 新项目 + 强 TS + wagmi：优先 viem
- 老项目或团队熟悉：ethers 也完全 OK

---

## 什么是 ABI？

ABI (Application Binary Interface) 是描述合约接口的 JSON。

前端通过 ABI：

- 编码调用参数
- 解码返回值
- 解析事件

**函数选择器：**

函数选择器 = `keccak256(functionSignature)` 的前 4 个字节。

例如：

```jsx
0xa9059cbb.... = keccak256("transfer(address,uint256)")
// 函数选择器 = 0xa9059cbb
```

## 为什么不能用 JS number 处理链上金额？

JS number 最大安全整数：

```
2^53 - 1
```

而链上数值（余额、amount、nonce）通常是 `uint256`。

**正确做法:**

使用 `BigInt` 或 `BigNumber`。

示例：

```javascript
import { parseUnits, formatUnits } from "viem";

const amount = parseUnits("1.5", 18);

formatUnits(amount, 18);
```

## approve + transferFrom 流程

ERC20 常见授权流程：

1. 用户调用 `approve(spender, amount)`授权给合约（spender）
2. 合约调用 `transferFrom(user, to, amount)`

**注意：**

- 无限授权风险：  
  approve(spender, MaxUint256) 方便但风险大；前端应提示风险，支持精确授权。
- allowance 竞争问题：  
  改额度时可能遇到 race condition，解决方案：
  - 推荐使用 increaseAllowance/decreaseAllowance（如果支持）
  - 使用permit离线签名
- USDT（ERC-20）等非标准：  
  有些代币要求先 approve(0) 再 approve(amount)。而且不支持Permit。

## EIP712、personal_sign、eth_sign
**eth_sign：**  
签名任何数据，展示是一串乱码（16进制的字符串）

**personal_sign：**   
签名一段字符串/bytes，只能处理简单字符串，用户看到的提示较不结构化，容易被钓鱼混淆

**EIP-712（结构化数据签名标准）：**   
签名结构化数据，钱包可以展示字段，更可读、更安全、更适合授权/订单;  
原理：
- 类型定义：在前端定义JSON格式的数据结构
- Domain Separator（域分隔符）：包含chainId、verifyingContract等，防止各种重放
- HashStruct：将业务数据按顺序进行哈希
- 最终签名：将0x19、0x01、DomainHash、DataHash 拼接后进行签名

EIP-712 中 domain（name、version、chainId、verifyingContract）、nonce用于防重放。

优点：

- 可读性更好
- 更安全

## 什么是 permit（EIP-2612）

permit 允许用户使用 **签名授权**（不上链，不消耗gas），而不是发一笔 approve 交易。

**流程：**
- 前端构建 Permit 结构（Typed Data）：   
  按照 EIP-712 标准构建结构化数据，包含：owner, spender, value, nonce（防止重放）, deadline（签名有效期）。
- 用户离线签名：  
  前端调用钱包（如 MetaMask）的 eth_signTypedData_v4 方法。此时用户只看到一个签名弹窗，不消耗 Gas。
- 发送业务交易：  
  前端将生成的签名（拆分为r, s, v三个参数）连同业务逻辑（如 swap 或 deposit）一起发送给你的业务合约。
- 合约自动授权：  
  业务合约在执行逻辑前，先调用代币的 permit 函数，用签名替用户完成授权，紧接着执行 transferFrom。

优点：

- 少一次交易
- 更好的用户体验
- 可以避免allowance 竞争问题（因为 permit 和 transferFrom 是在同一个以太坊交易（同一个Block，同一个 Transaction）里执行的。）


## 如何防止签名重放攻击？

需要在签名数据中加入：

- `nonce`
- `chainId`
- `deadline`
- `verifyingContract`

服务端/合约端校验 nonce 只用一次，过期拒绝。

这样可以避免签名被重复利用。

## 交易生命周期

常见状态：

```jsx
idle
wallet_prompt（弹钱包）
signed / submitted（拿到 tx hash）
pending（等待上链）
confirmed（>= N confirmations）
failed（revert / dropped / replaced / user rejected）
```

前端需要处理：

- 用户拒签
- 交易失败
- 交易替换

## 什么是 nonce？

nonce 是账户发送交易的序号（递增）。

每发送一笔交易就 +1。

**replacement transaction:**
用同一个nonce，发送新的交易时，一旦新的交易被打包，旧的交易会被网络丢弃。
可用来
- 加速交易：同一个nonce，更高的Gas费用
- 取消交易：同一个nonce，更高的Gas费用，转账金额为0且to为自己的交易。

常见错误：

- `nonce too low`：你发送的 nonce 已被用过（并发发送、缓存不一致、用户在别处发了交易）。
- `replacement Transaction underpriced`：同一 nonce 的替换交易 gas 不够高（EIP-1559 下是 maxFee/maxPriorityFee 不够高），通常新的交易Gas价格要比旧交易高出至少10%(取消交易也需要gas高出10%)，才能被节点替换


## EIP-1559 Gas 机制
gasPrice = baseFee + priorityFee

Gas 组成：

- `baseFee`：区块基础费（燃烧），由协议自动计算，会根据上个区块的gas使用量自动调整
- `maxPriorityFee`：由用户决定，用来给矿工的小费，普通交易：1~2Gwei,高优先级：3~5Gwei,区块特别拥堵时会更高。
- `maxFeePerGas`：你愿意支付的上限（包含 baseFee + priorityFee）。钱包一般会自动设置为baseFee × 2 + maxPriorityFee，这样能保证你的交易即使下一两个区块baseFee上涨，也不会挂住。

实际费用：

```jsx
effectiveGasPrice = min(maxFeePerGas, baseFee + maxPriorityFeePerGas)
```

## ERC-4337
ERC-4337（账户抽象，Account Abstraction），是一个将EOA钱包进化为智能合约钱包的协议，且不修改共识层。

核心是为了解决私钥管理问题：传统钱包私钥丢失无法找回，必须有ETH当Gas费。

核心组件：
- UserOperation：伪交易对象，包含用户的意图（不只是转账，还有验证逻辑）
- Bundler：专门的节点，收集 UserOps，打包成普通交易调起 EntryPoint。
- EntryPoint：全局唯一的中心合约，负责验证签名和执行所有 UserOps。
- Paymaster：
  允许第三方（如Dapp）为用户代付Gas,或者允许用户使用ERC-20直接支付Gas。  
  Paymaster相当于第三方支付机构，在构造 UserOperation 结构体时，有一个字段叫 paymasterAndData，选填;  
  如果Paymaster没钱了，EntryPoint 会直接在验证阶段 revert（回滚）整个 UserOp。

价值：
- 社交恢复：可以通过邮箱或好友找回钱包，不再依赖助记词。
- 免Gas交互：项目方可以补贴 Gas 费，降低新用户门槛。
- 交易批处理：一键完成“授权+换币+质押”，不再需要点三次确认。

缺点是：gas成本比EOA高

## 如何监听合约事件？

两种方式：

1. WebSocket 订阅 logs:实时但连接可能断、需要重连、移动端不稳定
2. 轮询 `getLogs`:稳定但延迟高，需要记 lastBlock

**注意：**

- 区块重组：事件可能“先出现后消失”，前端应等待 confirmations 或可回滚 UI
- 日志分页：需要分段查询，避免 provider 限制


## 为什么需要 The Graph

链上查询能力有限:
- 很难按用户维度、时间范围做复杂查询
- eth_getLogs 对历史大量数据很慢、还会被 RPC 限流
- 需要聚合、排序、分页、关联数据

Indexer 可以：

- 聚合数据
- 支持分页
- 提供 GraphQL 查询


## Web3 前端常见安全问题

### 钓鱼签名

诱导用户授权资产。  
防：签名内容清晰展示；对高危方法弹二次确认；显示 spender/合约地址；默认精确额度；提示 revoke。

### 错误链

用户在错误网络操作。  
防：给出错误提示。

### XSS 攻击

可能篡改交易参数。  
防：
- 严格 CSP(浏览器会检查CSP策略)：在Nginx上增加CSP头或者前端增加
  ```nginx
  server {
      # ... 其他配置
      
      # 添加 CSP 头
      add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';" always;
  }
  ```
  ```jsx
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self';">
  ```
- DOMPurify(第三方库)：用来过滤字符串或插入的DOM，去除包含恶意的HTML代码
- 避免 innerHTML：推荐使用 textContent 或 innerText
- 敏感信息不可被注入。


## 为什么必须校验 chainId

如果不校验：

- 用户在错误网络签名/发交易 → 资产/交互失败甚至损失
- 读到错误链数据导致 UI 误导

处理方法：

监听 `chainChanged` 并刷新应用。

## WalletConnect工作原理
WalletConnect 是 远程钱包连接协议。

DApp  
↓   
生成 包含中继服务器地址和临时对称密钥的 二维码  
↓   
手机钱包扫描  
↓   
通过指定的中继服务器（Relay Server）建立 websocket 连接。   
链接成功后，当在dapp上点击交易或签名时，RPC 请求通过 relay server 转发给钱包  
↓   
钱包确认签名  
↓   
通过中继服务器把结果返回给 DApp 

## wagmi / rainbowkit 的作用

提供：

- 抽象钱包连接、自动重连、网络切换、账户状态管理
- 处理 provider 差异、错误类型、UI 组件（RainbowKit）
- 提供方便前端使用的 hooks

例如：

- `useAccount`
- `useBalance`
- `useReadContract`

## 如何做交易模拟

在发送交易前使用：

```jsx
eth_call 或 simulateContract
```

可以提前发现失败原因。

## Token 精度处理

输入金额时：

- 使用字符串
- 根据decimals限制小数位

转换：

```jsx
// 链上使用 字符串 -> bigint
parseUnits(input, decimals) 
// 前端展示 bigint -> 字符串
formatUnits(value, decimals)
```

## DEX Swap 前端设计

核心逻辑：
quote来自 Router 的 getAmountsOut 或聚合器 API（1inch/0x/paraswap）

```
minAmountOut = quote * (1 - slippage)
```
交易时把 minAmountOut 写进 calldata（保护用户）
同时需要展示：

- price impact
- route

## Native Token vs ERC20

### Native Token
Native Token 没有合约地址（代码中用0x0000000000000000000000000000000000000000），转账走 value

### ERC20
ERC20 转账走 transfer(to, amount)，value=0


## 什么是multicall
Multicall 是一种智能合约模式，它允许将多个合约调用打包成一个请求执行，并一次性返回所有结果，从而减少 RPC 请求数量、降低 gas 成本，并保证数据一致性。

如果 Multicall 中有一个子调用失败了，整个交易会回滚吗？   
后来的版本（如 Multicall2 和 Multicall3）引入了 tryAggregate 或类似的机制，Multicall v2/v3中可以选择是否回滚：它允许用户传入一个布尔参数（如 requireSuccess），如果为false，即使部分子调用失败，整个交易依然可以成功上链，你可以拿到成功部分的数据。


## Web3 前端性能优化

常见优化：

- 减少 RPC 次数：batch/multicall、缓存 blockNumber、去重请求
- useEffect 依赖正确，避免无限刷新余额
- 大量地址/余额展示用虚拟列表
- 事件监听与轮询合并：只在需要页面开启订阅
- 使用 TanStack Query 的 staleTime/cacheTime 控制刷新节奏



## 地址校验
校验地址格式：0x + 40 hex   
checksum（EIP-55）能检测大小写错误，降低复制粘贴/手输出错率
推荐使用库：

```javascript
import { isAddress, getAddress } from "viem";
if (!isAddress(input)) throw new Error("Invalid address");
const checksum = getAddress(input);
```

## React 中封装 readContract

用 TanStack Query（wagmi 内部就是）：
- queryKey = [chainId, contractAddress, fnName, args]:会转成字符串（序列化）
-	staleTime（数据保持新鲜的时间） 控制频率
- 监听 blockNumber 时才 invalidate（可选）
  ```jsx
  // 假设你正在使用 wagmi 的监听钩子
  useWatchBlocks({
    onBlock(block) {
      // 当新区块产生时，让特定的 queryKey 失效
      queryClient.invalidateQueries({
        queryKey: [chainId, contractAddress, fnName, args]
      })
    }
  })
  ```

这样可以避免重复请求。


## setApprovalForAll 为什么危险？
ERC721/1155 的全量授权，可能允许对方转走你所有 NFT。前端必须高危提示，并显示 operator 地址。

## 为什么 DApp 需要等待 confirmations
DApp 需要等待 confirmations（确认数），主要是为了确保交易真正被网络接受且不可逆。如果不等待确认，交易可能会被回滚或替换。

当你发送一笔交易时：
1.	交易先进入 mempool（待打包池）
2.	矿工 / 验证者把交易打包进一个 区块
3.	区块被加入链上

但刚被打包时，这个区块还不一定是最终链的一部分。
因为可能出现：
-	Fork（分叉）
- 竞争区块
-	网络延迟

bitcoin：通常需要确认6个区块才认为绝对安全   
ethereum: 2-6个区块

**总结：**  
confirmations 是为了让交易在区块链上“稳定下来”，防止分叉回滚导致状态错误或资金风险。

## birdge的跨链流程
### bitcoin L1 -> bitcoin L2
::: tip 
用户发起跨链交易:
- 1、交易上链，BTC 被锁定在 L1
- 2、服务端扫块任务发现交易，等待Bitcoin confirmations
- 3、服务端验证交易
- 4、桥的 signer（EOA、多签或阈值签名账户）在L2 mint BTC
- 5、用户在L2收到资产

Bitcoin L1 没有智能合约系统，无法让链自动验证跨链消息。
:::

### evm L1 -> evm L2
目前市场上的L2主要有两派“分流方案”：
- Optimistic Rollups（乐观派）：  
  先默认交易都是真的，直接过。如果有人觉得某笔账不对，有 7 天时间可以“挑战”。代表：Arbitrum, Optimism, Base。

- ZK-Rollups（零知识证明派）：     
  利用高级数学（零知识证明）给每批交易出具一份“数学证明”，L1 秒验。更安全、提现更快，但技术极难。代表：zkSync, Starknet, Scroll。

::: tip 官方桥
L1：Ethereum  -> L2：Arbitrum, Optimism, Base、 zkSync、Scroll、Polygon zkEVM
L1：BNB Chain -> L2：opBNB

用户发起跨链交易:
- 1、交易上链，ETH 被锁定在 L1
- 2、L1 bridge 合约触发 deposit 事件，将一笔包含“铸造请求”的消息写入 L1 的一个特殊存储区域。
- 3、L2节点/序列器(Sequencer)捕捉到L1发出铸造请求消息。
- 4、L2 mint ETH
- 5、用户在L2收到资产。随后，序列器会将包含此笔操作的批次（Batch）提交回 L1 存证。
:::

::: tip 第三方桥
用户发起跨链交易:
- 1、交易上链，ETH 被锁定在 L1
- 2、服务端扫块任务发现L1的跨链事件，等待区块确认
- 3、桥的 signer（EOA、多签或阈值签名账户）发起一笔L2交易，调用L2上的资金池合约
  - 注意：这里通常不是 Mint 新币，而是从 L2 现有的流动性池里直接转账（Transfer）给用户。
- 4、用户在 L2 收到资产
- 5、桥的 signer拿着 L1 的存款凭证，在一段时间后（或通过批量证明）向桥的协议申领返还他在 L2 垫付的资金，并赚取手续费
:::

:::tip 原生桥 vs 第三方桥
| 维度 | 原生桥| 第三方桥 |
|---|---|---|
| 例子 | Arbitrum Bridge、Optimism Portal | Across、LayerZero |
| 部署者 | L2项目方（Arbitrum / Optimism 等） | 独立第三方（Across / Stargate 等） |
| 信任对象 | 只信任 L1 共识与算法（数学/代码） | 需要信任桥的项目方 |
| 资金流向 | 资产锁定在 L1 Bridge 合约，在 L2 Mint | 资产进入桥的流动性池，从目标链池子 Transfer |
| 资产来源 | 官方Mint的代币 | 从L2池子Transfer官方资产或Mint包装币 |
| 扫块主体 | L2 序列器 / 协议级消息系统 | 项目方中继器 / Relayer（应用层） |
| 速度 | 较慢：受 L1 确认和 L2 机制限制 | 很快：通常几分钟，因为有流动性池或中继者先行垫付 |
| 安全性 | 极高：继承 L1 安全性 | 取决于桥的签名机制或流动性池安全 |
:::