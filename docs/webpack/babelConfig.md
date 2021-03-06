---
title: babel配置
sidebarDepth: 0
tags:
  - webpack
---
[[toc]]
## babel是什么
>`babel` 是一个`JavaScript`编译器，主要作用是将`ECMAScript2015+` 版本的`js`代码转换为向后兼容的`js`语法，以便能够运行在当前和旧版本的浏览器环境中

## babel核心概念
::: tip babel
`babel` 能做什么？
- 语法转换
- 通过`Polyfill`方式垫平不同浏览器或者不同环境下的差异,让新的内置函数、实例方法等在低版本浏览器中也可以使用。（`@babel/polyfill`模块）
- 源码转换
:::
### 核心库 @babel/core
>`Babel`的核心功能包含在`@babel/core`模块中，不安装`@babel/core`则无法使用
### @babel/cli
>`Babel`提供的命令行工具，主要是提供`babel`这个命令，适合安装在项目里。
## babel 插件
::: tip 插件
`Babel`构建在插件之上，使用插件可以组成一个转换通道，`Babel`的插件分为两种:

- 语法插件：只允许`babel`解析特定类型的语法（不是转换），可以在`AST`转换时使用，以支持解析新语法

- 转换插件：会启用相应的语法插件（因此不需要同时指定这两种插件），如果不启用响应的语法插件，意味着无法解析，就更不用说转换了。

插件的使用

如果插件发布在`npm`上，可以直接填写插件的名称，`Babel`会自动检查它是否已经被安装在`node_modules`目录下，在项目目录下新建`.babelrc`文件，配置如下
```js
{
  "plugins": ["@babel/plugin-transform-arrow-functions"] // 也可以指定插件的相对路径 ["./node_modules/@babel/plugin-transform-arrow-functions"]
}
```
执行`npm run compiler`, "compiler": "babel src --out-dir lib --watch"
:::
### @babel/preset-env
::: tip
如果要将其他js特性转换为低版本，需要使用其他`plugin`，如果我们一个个配置的话，会非常繁琐。`@babel/preset-env`的主要作用就是对我们所使用的并且目标浏览器中缺失的功能进行代码转换和加载`polyfill`,在不进行配置的情况下，`@babel/preset-env`所包含的插件将支持所有最新的`js`特性（ES2015、ES2016等，不包含stage阶段），将其转换成`ES5`代码。

**注意**：由于`@babel/preset-env`默认会将任何模块类型都转译成`CommonJS`类型，这样会导致`tree-shaking`失效，因为`tree-shaking`只会对`ES6module`生效，所以需要设置`modules:false`属性来解决这个问题。
```js
{
  "presets": ["@babel/preset-env", { "modules": false }]
}
```
需要说明的是，`@babel/preset-env`会根据你配置的目标环境，生成插件列表来编译。对于基于浏览器或`Electron`的项目，官方推荐使用`.browerslistrc`文件来指定目标环境。默认情况下，如果你没有在`Babel`配置文件中（如`.babelrc`）设置`targets`或 `ignoreBrowserslistConfig`,`@babel/preset-env`会使用`browerslist`配置源。

如果不是要兼容所有浏览器和环境，推荐指定目标环境，这样能使编译代码变得更小
如仅包含浏览器市场份额超过`1%`的用户所需的`polyfill`和代码转换（忽略没有安全更新的浏览器，如IE10 和BlackBerry）
```js
> 1%
not dead
```
:::

### @babel/polyfill
::: tip polyfill
语法转换只能将高版本的语法转换为低版本的，但是新的内置函数，实例方法是无法转换的。此时，就需要用到`polyfill`,也就是垫片。所谓垫片，就是垫平不同浏览器或者不同环境下的差异，让新的内置函数、实例方法等在低版本浏览器中也可以使用

`@babel/polyfill`模块包括`core-js`和一个自定义的 `regenerator runtime` 模块，可以模拟完整的`ES2015+`环境（不包含第四阶段前的提议）

这意味的可以使用诸如`Promise` 和 `WeakMap`之类的新的内置组件、`Array.from` 或`Object.assgin` 之类的静态方法、`Array.prorotype.includes` 之类的方法，以及生成器函数（`yield`函数，前提是使用了`@babel/plugin-transform-regenerator`插件）

从`V7.4.0`版本开始`@babel/polyfill`已经被废弃，需要单独安装`core-js`和`regenerator-runtime` 模块，首先，安装`@babel/polyfill`依赖
```shell
npm install @babel/polyfill --save
```
不使用`--save-dev`是因为这是一个需要在源码运行之前运行的垫片

我们需要将完整的`polyfill`在代码之前加载，修改我们的`src/index.js`，也可以在webpack中进行配置
```js
entry:[
  require.resolve('./polyfills'),
  path.resolve('./index')
]
```
`polyfills.js`文件内容如下：
```js
// 可能还有一些其他的polyfill
import '@babel/polyfill';
```

`polyfills`按需引入，且不会污染全局环境和原型

`@babel/preset-env`提供了一个`useBuiltIns`参数，设置值为`usage`时，就只会包含代码需要的`polyfill`。但是需要注意：值设为`usage`时，必须要同时设置`corejs`，如果不设置，会给出警告，如果安装了`@babel/polyfill`，默认使用的是`corejs@2`。`corejs@2`已经不会再加入新的特性，新特性会添加到`corejs@3`。
```shell
npm i core-js@3 --save
```

现在修改.babelrc配置文件如下
```js
{
  "presets":[
    [
      "@babel/env",
      {
        "useBuiltIns":"usage",
        "corejs": 3
      }
    ]
  ]
}
```
`babel`会检查所有代码，以便查找在目标环境中缺失的功能，然后仅仅把需要的`polyfill`包含进来。同样的代码，使用webpack构建之后，最终代码会减小不少。
如果我们源码中使用到了 `async/await`，那么编译出来的代码需要`require("regenerator-runtime/runtime")`,可以只安装`regenerator-runtime/runtime`来取代安装`@babel/polyfill`

如果我们源码中使用了`class`，那么`babel`会使用很小的服务函数来实现类似`_classCallCheck、_defineProperties、_createClass`等公共方法。默认情况下,它们将被添加到所有使用了`calss`的`js`中。

为了避免加载多次，此时就需要用到`@babel/plugin-transform-runtime`插件
:::

### @babel/plugin-transform-runtime
::: tip
`@babel/plugin-transform-runtime`是一个可以重复使用`Babel`注入的帮助函数，使用`@babel/plugin-transform-runtime`插件，所有帮助函数都将引用`@babel/runtime`模块,这样就可以避免编译后的代码中出现重复的帮助函数，有效减少包体积大小。

`@babel/plugin-transform-runtime`需要和`@babel/runtime`配合使用。
首先安装依赖， `@babel/plugin-transform-runtime`通常仅在开发时使用，但是运行时最终代码需要依赖`@babel/runtime`，所以`@babel/runtime`必须要作为生产依赖安装
```shell
npm i @babel/plugin-transform-runtime --D
npm i @babel/runtime --save
```
此时帮助函数就会从`@babel/runtime`中引入，而不是直接被注入到源代码当中

`@babel/plugin-transform-runtime`不仅可以减少帮助函数的注入来减少代码体积，还可以为代码提供一个沙盒环境，他会将诸如`Promise、Set、Map`的内置别名作为`core-js`的别名，因此可以无缝使用他们

如果我们希望`@babel/plugin-transform-runtime`不仅处理帮助函数，同时也能处理`polyfill`的话，我们需要给`@babel/plugin-transform-runtime`增加配置信息，首先添加新增依赖`@babel/runtime-corejs3`
```shell
npm i @babel/runtime-corejs3 --save
```
然后需要修改`.babelrc`文件
```js
{
  "presets":[
    [
      "@babel/preset-env",
      {
        "modules": false
      }
    ]
  ],
  "plugins":[
    [
      "@babel/plugin-transform-runtime", {
        "corejs": 3
      }
    ]
  ]
}
```
如果`corejs`的配置是 **`2`**,那么将不会包含实例方法的`polyfill`（includes等实例方法不会被转换为兼容版本），需要单独引入。
如果`corejs`的配置是 **`3`**，那么不管是实例方法还是全局方法，都不会污染全局环境。
:::
## 插件的顺序
::: tip 顺序
插件的排序很重要
如果两个插件都将处理程序的某个代码片段，则将根据`"plugins"`或`"preset"`中的排列顺序依次执行。
- `"plugins"`在`"preset"`前运行
- `"plugins"`顺序从前往后排列
- `"preset"`顺序是颠倒的（从后往前）。
:::

## 插件的短名称
>如果插件名为`@babel-plugin-xxx`，可以使用`@babel/xxx`,如果插件名为`babel-plugin-xxx`，可以直接使用`xxx`

## @babel与babel的区别
>升级到`babel7`之后，就必须使用`@babel/xxx`了，可以认为`@babel/xxx`是`babel/xxx`的最新版,许多`babel/xxx`也都不再更新了，更新的是`@babel/xxx`，比如`@babel/plugin-transform-runtime`,最新版只能使用`@babel/plugin-transform-runtime`。加`@`符号是为了区分哪些是官方包，哪些是第三方包