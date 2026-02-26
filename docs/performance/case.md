---
title: 性能优化
sidebarDepth: 0
tags:
  - performance
---
[[toc]]
# 前端性能优化
前端性能一般可以分三层：加载、渲染、运行时

## Load Performance（加载性能）
::: tip 加载优化
- 减少bundle体积
- 代码拆分
- CDN缓存
- gzip压缩
:::

## Render Performance（渲染性能）
::: tip 渲染优化
- 减少重排重绘（变量缓存）
- 虚拟列表
- transform 代替 top（css属性）
:::

## Runtime Performance（运行时性能）
::: tip 运行时优化
- JS 执行效率
- 主线程阻塞
- 大量计算
- 长任务（任务拆分，使用setTimeout/postTask实现异步）
:::

## 打包优化
::: tip
在基于 Vite 的 React 项目中，如果 JSbundle 体积过大，会用lazy 配合 Suspense 实现组件级和路由级的动态加载，同时对于 echarts、loadsh、ethers 等体积较大的第三方库采用动态 import 的方式延迟加载，并结合 Vite 的 rollupOptions.manualChunks 对 node_modules 进行 vendor 拆分，避免单一主包过大阻塞主线程解析，从而减少首屏 JS 执行时间并提升可交互时间。
:::

## 运行时优化
::: tip
- 长列表虚拟滚动
- 防抖节流
- web Worker
- 长任务拆分
:::

## 优化case
::: tip 问题
简历项目中，我的简历页面，当用户简历比较多（200条以上时）首次进入会有明显卡顿，大概会有1-2秒无法响应。

通过Chrome Performance 面板做了性能分析，接口返回之后，有120ms的长任务。
进一步分析发现，主要消耗在前端对数据的transform处理上，占用主线程导致页面渲染和交互被阻塞

**优化过程：**
采用任务切片（scheduler.yield）方式优化，每处理20条后通过`scheduler.yield`主动让出线程执行权。
scheduler.yield() 之所以可以“让出主线程”，是因为：

它把当前连续执行的 JS 任务拆成多个宏任务（macrotask），让浏览器有机会在两个任务之间执行渲染和处理用户输入。

**优化结果：**
主线程占用时间从原来的120ms降为单次不超过15ms）

**为什么不用`Web Worker`?**
- 1、任务规模没有上升到必须用worker，引入worker消耗大：额外文件、构建配置、消息通信成本等等
- 2、worker有通信成本
- 3、worker会增加项目整体复杂度：声明周期、打包构建等都需要改动

**什么时候用worker**
- 1、1000+以上的复杂计算时
- 2、富文本解析等复杂功能时
- 3、图片处理
- 4、markdown转ast
总结：计算时间超过200ms，且属于纯计算型任务，会优先考虑worker。
:::

