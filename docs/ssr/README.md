---
title: SSR(服务器渲染)
sidebarDepth: 0
tags:
  - SSR
---

[[toc]]
# SSR(服务器渲染)
>`SSR`: 服务端渲染 在服务器对`vue`页面进行渲染`HTML`文件 返回给浏览器

## SSR优点
> `SEO` : 不同于`SPA`的`HTML`只有一个无实际内容的`HTML`和一个`app.js`，`SSR`生成的`HTML`是有内容的，这让搜索引擎能够索引到页面内容。
>
>更快内容到达时间 传统的`SPA`应用是将`bundle.js`从服务器获取，然后在客户端解析并挂载到`dom`。而`SSR`直接将`HTML`字符串传递给浏览器。大大加快了首屏加载时间。