---
title: tree-shaking
sidebarDepth: 0
tags:
  - webpack
---
[[toc]]
# webpack中的tree-shaking
::: tip tree-shaking
`tree-shaking`通常用来描述移除`JS`上下文中未被引用的代码。
它依赖于`ES6 module（ES2015模块化）`语法的`静态结构`的特性。`tree-shaking`源自于`rollup`
借于`ES6 module`的静态分析，`tree-shaking`的实现才能成为可能。
在webpack中，`tree-shaking`指的就是按需加载，即没有被引用的模块在打包时不会被打包进来，减少我们的包大小，缩小应用的加载时间，呈现给用户更佳的体验
:::

## tree-shaking 原理
::: tip 原理
`tree-shaking`更关注于消除无用的模块，消除那些引用了但并没有被使用的模块。
`ES6 module`依赖关系是确定的，和运行时的状态无关，可以进行可靠的静态分析，这就是`tree-shaking`的基础
所谓静态分析就是不执行代码，从字面量上对代码进行分析，故而可以在编译时正确判断需要加载哪些代码，哪些代码需要删除。ES6之前的模块化，比如我们可以动态`require`一个模块，只有执行后才知道引用的什么模块，`require`语法就无法通过静态分析去做优化。
:::

## 哪些代码会被shaking
::: tip
- 1、没有被导入或使用的代码
- 2、代码执行的结果不会被用到
- 3、代码没有被执行，或者不可到达（条件为false中的代码）
- 4、代码中只写不读的变量。

有副作用的未被引用的函数无法被shaking掉（解决办法是将自己认为没有副作用的函数前面用/*@__PURE__*/声明）
https://segmentfault.com/a/1190000012794598
:::

