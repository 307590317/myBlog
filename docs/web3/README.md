---
title: EVM、Bitcoin等链加速原理
sidebarDepth: 0
---
[[toc]]
# EVM、Bitcoin等链加速原理

## EVM系列
::: tip 原理
以太坊交易是基于账户模型的，每一笔交易都有一个唯一的 **nonce**。
如果你的交易卡住了（gas price 太低），你可以用相同的**nonce** + 更高的 `gasPrice/maxFeePerGas` 重新发一笔交易去"覆盖"原来的交易（称为 Replace by Fee,简称RBF）
:::
::: tip hash 是否改变
改变，因为交易内容中的 gas price 变了 → 交易哈希也会变。新的交易会覆盖旧的交易，旧的交易会被节点丢弃
:::

### gas 
::: tip gas
`gas`表示 **EVM执行交易或智能合约时所消耗的计算量单位**。

在以太坊中，每一种操作都会消耗一定数量的`gas`，例如：

- 普通转账：**21000 gas**
- ERC20转账：**约 50000 ~ 65000 gas**
- 复杂合约调用：可能 **100000+ gas**

可以理解为：

> gas 是衡量计算资源消耗的单位，而不是费用。

最终交易费用计算公式：交易费用 = `gasUsed` × `gasPrice`
其中：

- `gasUsed`：实际执行交易消耗的`gas`
- 如果交易逻辑复杂，`gasUsed`会更高
:::

### gasPrice
evm系列都有**gasPrice**，分为EIP-1559(伦敦升级)之前和之后：

#### 升级之前
::: tip gasPrice
完全是市场博弈——由用户自己出价、矿工选择最高价的交易打包。一般是钱包根据节点统计当前交易池中的交易所给的gasPrice，给出三个档位让用选择，或者让用户自己输入一个值。
- slow：5Gwei
- standard：15Gwei
- fast：30Gwei
:::

#### 升级之后
::: tip gasPrice = baseFee + priorityFee[praɪˈɔrəti]
改为了动态`baseFee` + `maxPriorityFee`的模型 
- `baseFee`:由协议自动计算，会根据上个区块的gas使用量自动调整
- `maxPriorityFee`:由用户决定，用来给矿工的小费，普通交易：1~2Gwei,高优先级：3~5Gwei,区块特别拥堵时会更高。
- `maxFeePerGas`:用户愿意支付的最大Gas价格，钱包一般会自动设置为`baseFee`×2 + `maxPriorityFee`，这样能保证你的交易即使下一两个区块baseFee上涨，也不会挂住。

升级后一般控制`gas`、`maxFeePerGas`、`maxPriorityFeePerGas`这三个值来保证交易完成。
:::

### gasLimit
::: tip gasLimit
`gasLimit`表示 **用户愿意为这笔交易最多提供多少gas上限**。
执行交易时：`gasUsed` ≤ `gasLimit`

如果执行过程中消耗的`gas` 超过`gasLimit`：
- 交易会 **失败（Out of Gas）**
- 已经消耗的gas **不会退还**

`gasLimit`主要用于：

- 防止智能合约 **无限循环消耗gas**
- 给交易设定 **计算资源上限**
- 保护用户不会消耗无限手续费
:::

#### 常见gasLimit参考
::: tip gasLimit
| 交易类型 | gasLimit |
|:---:|:---:|
| ETH转账 | 21000 |
| ERC20转账 | 60000 ~ 100000 |
| NFT mint | 150000+ |
| DeFi交易 | 200000 ~ 500000 |

一般钱包会 **自动估算`gasLimit`**，用户通常不需要手动设置。
:::

#### block gas limit
::: tip blockGasLimit
区块链还有一个 **区块gas限制**：一个区块中所有交易消耗的gas总和不能超过这个值。
block gas limit ≈ 30000000 gas
所以区块链的吞吐量本质上是：每个区块可容纳的gas总量
:::
### 为什么gasLimit不能无限大？
::: tip gasLimit
`gasLimit`的本质指的是`EVM`计算资源的硬约束，限制的是这笔交易最多可以执行多少`EVM`指令，区块打包时是按照`gasLimit`占用区块容量的，单个交易的`gasLimit`不能超过区块的`blockGasLimit`限制。如果允许`gasLimit`无限大，那么单比交易就会占满甚至超过区块容量，导致区块执行时间不可控，影响全网同步和公式安全，因此`gasLimit`不能无限大
:::

## Bitcoin
::: tip 原理
1、比特币基于 UTXO 模型，支持 RBF（Replace by Fee）机制。
将交易的`sequence`改小即可，要小于`0xffffffff`才表示支持RBF。
你可以发一笔 用同一个`输入`**(UTXO)** 的交易，更高的 fee rate（sats/vByte） 去覆盖旧交易。
或者使用矿池的“加速服务”，比如 ViaBTC、Mempool.space 支持矿工手动加速。

2、CPFP机制：如果原交易没开 RBF，用户可以用原来交易的`输出(未确认)`**UTXO**，构造一个子交易，子交易设置一个高 **fee**，矿工为了打包子交易，必须一并打包父交易，这种方式原交易 hash 不变，但通过子交易间接提速。
:::

::: tip hash 是否改变
只要任意交易字段变动（fee、输出数额、锁定时间等），都会导致交易哈希变, 原交易被节点丢弃。
构造子交易的原hash不变。
:::


## Solana原理
::: tip 原理
Solana 基于账户模型，但交易是按 block slot 的并行处理。
它并不支持传统意义上的“RBF”，你不能发相同 nonce 的交易去替换之前的。
但是可以重新构造一笔新交易，让节点优先广播或通过 RPC 送进 leader node。
:::

::: tip hash 是否改变
重发交易 == 构造一笔新交易 → hash 一定变。
:::
