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
### 优化打包速度
#### 开启tree-shaking
::: tip 开启 tree-shaking 的方式
- 1、将`mode`改为`production`模式，将会自动开启`tree shaking`和`uglifyjs`。
- 2、通过`optimization`配置去开启一些优化的功能， 又叫`Scope Hoisting`
  ```js
  module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
      filename: 'bundle.js'
    },
    optimization: {
      // 模块只导出被使用的成员
      usedExports: true, // 用来标记 '枯树叶'
      // 尽可能合并每一个模块到一个函数中 提升运行效率
      concatenateModules: true, 
      // 压缩输出结果
      minimize: true // 用来摇下 '枯树叶'，
      sideEffects: true // 要去除没有副作用的引用
    }
  }
  ```
`tree shaking`还需要配置一些其他的东西：
- 1、`tree shaking`依赖的是`es6 module`规范,而`@babel/preset-env`会将`es6 module`转化为`commonjs`代码，这样`tree shaking`就不会生效，所以需要在`@babel/preset-env`这个插件中将`module`改为`false`,不转为`commonjs`代码。
```.babelrc
{
  "presets": [
    ["@babel/preset-env",
      {
        "modules": false // 不转为commonjs
      }
    ]
  ]
}
```
- 2、`sideEffects`：用来标识代码是否有副作用或者哪些代码有副作用，从而为`tree shaking`提供更大的压缩空间。需要在`package.json`中写明所有文件都没有副作用还是哪些文件有副作用。
```json
"sideEffects": false // 表示所有文件都没有副作用
"sideEffects": [ // 表示哪些文件是有副作用的
  "./src/extend.js",
  "*.css"
]

```
:::
#### 缩小文件查找范围
::: tip
- 1、采用`include exclude`来减少`loader`搜索时的转换时间。
- 2、采用`alias`取别名的方式来缩小`import vue`时，`webpack`的查找范围，不用的话`webpack`就会采用向上递归的方式去`node_modules`目录下找。
- 3、增加`noParse`, 告诉`webpack`不解析模块中的依赖， 比如`jquery、moment`
- 4、采用`webpack.IgnorePlugin` 插件，忽略掉第三方包的指定目录，比如`moment`的语言包
- 5、增加`extensions`字段定义文件后缀，告诉`webpack`优先查找哪些文件
:::

#### 用thread-loader开启多进程loader转换
::: tip 
把`thread-loader`这个`loader`放在其他`loader`的前面(左边)，放置在这个`loader`之后的`loader`就会在一个单独的worker池中`worker pool`运行，当项目比较复杂，文件比较多时，添加这个`loader`会减少转换时间。如果项目比较简单，文件比较少，反而会增加时间。
:::

#### 配置loader缓存
::: tip 
在`babel-loader`中可以通过设置`cacheDirectory`来开启缓存，`babel-loader?cacheDirectory=true`,就会将每次的编译结果写进硬盘文件，不支持`cacheDirectory`的可以使用`cache-loader`，再次构建会先比较，如果文件没有改变则会直接使用缓存。
:::

### 优化体积
#### 开启Scope Hoisting
::: tip
`Scope Hoisting`也叫作用域提升，是在`webpack3`中新推出的功能。`Scope Hoisting`的原理是将所有的模块按照引用顺序放在一个函数作用域里，然后适当的重名一些变量防止命名冲突，以此减少了代码运行时作用域，从而减少了内存。这个功能在`production`模式下默认开启，也是只支持`es6 module`,不支持`commonjs`。
:::