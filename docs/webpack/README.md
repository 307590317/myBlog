---
title: webpack基础
sidebarDepth: 0
tags:
  - webpack
---
[[toc]]
## webpack是什么
>`webpack` 是一个`JavaScript`静态模块打包器，当`webpack`处理应用程序时会递归构建一个依赖关系图，包含程序需要的每个模块，然后将这些模块打包成一个或者多个`budle`

## webpack核心概念
::: tip 核心
`webpack` 配置中需要理解的几个核心概念 ：**`Entry`**，**`Output`**，**`Loaders`**，**`Plugins`**，**`Chunk`**
- **`Entry`**：指定`webpack`开始构建的入口模块，从该模块开始构并计算出直接或间接依赖的模块或者库。
- **`Output`**：告诉`webpack`如何命名输出文件以及输出的目录
- **`Loaders`**：由于`webpack`只能处理`JavaScript`，所以我们需要将一些非`js`文件处理成`webpack`能够处理的模块，比如`.vue、.scss`等文件。
- **`Plugins`**：`plugin`有着很强的能力，从打包优化和压缩，一直到重新定义环境中的变量。辅助`webpack`更好的按照我们指定的方式打包代码。
- **`Chunk`**：`coding split`的产物，我们可以把一些代码打包成一个单独的`Chunk`，比如某些公共模块、组件、第三方包，更好的利用缓存。或者按需加载某些功能模块，优化加载时间。在`webpack3`中我们使用`CommonsChunkPlugin`将一些公共代码分割成一个`chuak`，实现单独加载。在webpack4中我们使用`SplitChunksPlugin`

### 
