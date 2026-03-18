---
title: webpack打包流程及优化
sidebarDepth: 0
tags:
  - webpack
---
[[toc]]
# webpack原理
::: tip 原理
`webpack`是一个`javascript`文件的静态模块打包器。

`webpack`就像一个生产线，要经过一系列流程处理后才能将源文件转换为要输出的结果。这条生产线上的每一个流程的功能都是单一的，多个流程之前有依赖关系，只有完成当前处理后才能交给下一个流程处理。插件就像是插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。`webpack`内部通过`Tapable`来组织这条生产线。在运行的过程中会广播对应的事件，插件只需要监听自己所关心的事件，就能加入到这条生产线中，去改变生产线的运作。

`webpack`的事件流机制保证了插件的有序性，使得整个系统的扩展性很好。
:::

## webpack 构建流程
::: tip 构建流程
`webpack`的打包过程是一个串行的过程，从启动到结束，会一个接一个流程的走下去，最终打包出需要的`bundle`。下面就是要执行的流程

- 1、初始化参数：从配置文件和`Shell`语句中读取并合并参数，得出最终的配置对象
- 2、开始编译：用上一步得到的得到的参数初始化`Compiler`对象，加载所有配置的插件，执行对象的`run`方法，开始编译
- 3、确定入口：根据配置中的entry找到所有入口文件
- 4、构建模块：从入口文件开始，开始构建模块，调用所有配置的`loader`对模块进行处理，使用`acorn`这个库生成`ast`语法树，再遍历`ast`语法树收集该模块依赖的模块，再处理依赖的模块，直到所有模块都经过构建。
- 5、输出资源：通过`compilation.seal`方法依次对每个模块和`chunk`进行整理，生成编译后的源码，合并、拆分。每一个`chunk`对应一个入口文件，开始生成最后的`js`。再通过`MainTemplate.render`（处理入口文件模块）和`ChunkTemplate.render`（处理异步加载的模块）方法将模块处理成带有`__webpack__require()`的格式，然后将处理完的`js`输出到`output`的`path`中


对应的`webpack`事件
- `entry-options`：初始化参数
- `compile`：开始编译
- `make`：分析入口文件，创建模块对象
- `build-module`：构建模块，调用`loader`处理模块
- `after-compile`：完成所有的模块构建，结束编译
- `emit`：`Compiler`开始输出生成的`assets`，插件有最后的机会修改`assets`，
- `after-emit`：输出完成
:::

## webpack打包优化

### 优化体积
- 1、使用splitChunks抽离公共组件
- 2、配置babel-plugin-component，按需引入element-ui组件库
- 3、剔除moment.js中无用的语言包

### 优化热更新
开发环境修改devtool为：'eval-cheap-module-source-map'
- eval：不单独生成.map文件，用eval包裹源码字符串。
- cheap：只映射到行，而不到列
- module：保留原始源码
- source-map：开启源码映射

### 优化打包速度

#### 用thread-loader开启多进程loader转换
::: tip 
把`thread-loader`这个`loader`放在其他`loader`的前面(左边)，放置在这个`loader`之后的`loader`就会在一个单独的worker池中`worker pool`运行，当项目比较复杂，文件比较多时，添加这个`loader`会减少转换时间。如果项目比较简单，文件比较少，反而会增加时间。
```js
rules: [
  {
    test: /\.js$/,
    use: [
      {
        loader: 'thread-loader', // 开启多进程处理 JS 逻辑
        options: { workers: 3 }
      },
      'babel-loader'
    ]
  },
  {
    test: /\.scss$/,
    use: [// loader从右往左执行
      'vue-style-loader',
      'css-loader',
      'postcss-loader',
      {
        loader: 'thread-loader', // 给复杂的 Sass 编译分配多线程
        options: { workers: 2 }
      },
      'sass-loader'
    ]
  }
]
```
:::

#### 配置loader缓存
::: tip 
在`babel-loader`中可以通过设置`cacheDirectory`来开启缓存，`babel-loader?cacheDirectory=true`,就会将每次的编译结果写进硬盘文件，不支持`cacheDirectory`的可以使用`cache-loader`，再次构建会先比较，如果文件没有改变则会直接使用缓存。
```js
rules: [
  {
    test: /\.js$/,
    use: [
      'cache-loader',
      {
        loader: 'thread-loader', // 开启多进程处理 JS 逻辑
        options: { workers: 3 }
      },
      'babel-loader'
    ]
  },
  {
    test: /\.scss$/,
    use: [
      'vue-style-loader',
      'cache-loader',
      'css-loader',
      'postcss-loader', 
      {
        loader: 'thread-loader', // 给复杂的 Sass 编译分配多线程
        options: { workers: 2 }
      },
      'sass-loader'
    ]
  }
]
```
:::

#### sass-resources-loader
一次性注入全局css变量，避免重复注入
```js
rules: [
  {
    test: /\.js$/,
    use: [
      'cache-loader',
      {
        loader: 'thread-loader', // 开启多进程处理 JS 逻辑
        options: { workers: 3 }
      },
      'babel-loader'
    ]
  },
  {
    test: /\.scss$/,
    use: [
      'vue-style-loader',
      'cache-loader',
      'css-loader',
      'postcss-loader', 
      {
        loader: 'thread-loader', // 给复杂的 Sass 编译分配多线程
        options: { workers: 2 }
      },
      'sass-loader'
      {
        loader: 'sass-resources-loader', // 注入全局变量
        options: {
          // 填入你需要全局注入的 scss 文件路径
          resources: [
            path.resolve(__dirname, './src/assets/styles/variables.scss'),
            path.resolve(__dirname, './src/assets/styles/mixins.scss')
          ]
        }
      }
    ]
  }
]
```

#### TerserWebpackPlugin
减小包体积、代码混淆、多进程压缩
```js
const TerserPlugin = require('terser-webpack-plugin');
optimization: {
  minimize: true, // 开启压缩
  minimizer: [
    new TerserPlugin({
      // 1. 开启多进程压缩（提升速度的核心！）
      // 默认是核心数 - 1，建议显式设为 true
      parallel: true, 

      // 2. 开启缓存（提升二次打包速度）
      cache: true,

      // 3. 提取注释：防止每个文件头部都有一堆版权注释占体积
      extractComments: false, 

      terserOptions: {
        compress: {
          // 4. 生产环境自动剔除 console.log
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'] // 确保彻底删掉
        },
        output: {
          // 5. 去掉所有的注释（最精简）
          comments: false,
          beautify: false
        },
        // 6. 配合 SourceMap 定位线上 Bug（如果需要的话）
        sourceMap: true 
      }
    })
  ]
}
```

#### DllPlugin、DllReferencePlugin预编译第三方库
使用DllPlugin预编译第三方库vue、vue-router、axios、echarts等，生成dll.js和一份manifest.json，使用DllReferencePlugin插件引用预编译的json
