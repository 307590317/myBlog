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

## Bitcoin
::: tip 原理
1、比特币基于 UTXO 模型，支持 RBF（Replace by Fee）机制。
你可以发一笔 **相同输入(UTXO)** 的交易，更高的 fee rate（sats/vByte） 去覆盖旧交易。
或者使用矿池的“加速服务”，比如 ViaBTC、Mempool.space 支持矿工手动加速。

2、如果原交易没开 RBF，用户可以用原来交易的**输出UTXO**，构造一个子交易，子交易设置一个高 **fee**，矿工为了打包子交易，必须一并打包父交易，这种方式原交易 hash 不变，但通过子交易间接提速。
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
