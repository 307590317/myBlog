---
title: Rollup基础
sidebarDepth: 0
tags:
  - Rollup
---
[[toc]]
## Rollup是什么
>`Rollup`则是一个专注于`JavaScript`库打包的工具，它的设计目标是尽可能地将代码打包成最小化的形式，以提高`JavaScript`库的性能和体积。`Rollup`采用Tree-shaking算法和ES6模块规范，可以消除冗余的代码，并将整个库打包成一个独立的文件。相比`Webpack`，`Rollup`的配置简单，打包速度更快，但其功能相对较少，主要适用于构建纯`JavaScript`库。

因此，如果你需要构建复杂的Web应用程序，包含多种前端技术和功能，可以考虑使用`Webpack`；如果你需要构建纯`JavaScript`库，强调性能和体积，可以选择`Rollup`。当然，在实际项目中，`Webpack`和`Rollup`也可以结合使用，根据具体情况进行取舍。

## webpack核心概念
::: tip 核心
`Rollup` 配置中需要理解的几个核心概念 ：**`input`**，**`output`**，**`plugins`**，**`external`**，**`watch`**
- **`Entry`**：指定`webpack`开始构建的入口模块，从该模块开始构并计算出直接或间接依赖的模块或者库。

- **`Output`**：告诉`webpack`如何命名输出文件以及输出的目录

- **`Loaders`**：由于`webpack`只能处理`JavaScript`，所以我们需要将一些非`js`文件处理成`webpack`能够处理的模块，比如`.vue、.scss`等文件。

- **`Plugins`**：`plugin`有着很强的能力，从打包优化和压缩，一直到重新定义环境中的变量。辅助`webpack`更好的按照我们指定的方式打包代码。

- **`module`**：我们自己写的代码文件，一个文件就相当于一个模块，不管是css、js都是模块。

- **`Chunk`**：当`webpack`根据我们传入的入口文件将我们写的`module`进行打包时，会根据文件的引用关系，生成`chunk`，将一个模块中用到的代码(包括引用的)都生成到一个`chunk`。额外打包的代码会被单独分出一个文件，实现单独加载，但是属于同一个`chunk`，`webpack`会建立内部关系。

`coding split`的产物，我们可以把一些代码打包成一个单独的`Chunk`，比如某些公共模块、组件、第三方包，更好的利用缓存。或者按需加载某些功能模块，优化加载时间。在`webpack3`中我们使用`CommonsChunkPlugin`将一些公共代码分割成一个`chuak`，实现单独加载。在webpack4中我们使用`SplitChunksPlugin`

- **`bundle`**：`webpack`将`chunk`文件处理好之后，最终会输出`bundle`文件，`bundle`文件包含了经过压缩和编译的最终代码文件，可以直接在浏览器中运行。

一般来说一个`chunk`对应一个`bundle`，但是一个`chunk`也可以对应多个`bundle`，比如对于同一个`chunk`的需要额外抽离的`css`文件
:::

## filename 和 chunkFilename、webpackChunkName
### filename
::: tip filename
`filename`就是打包出来的文件的名称，一般在`output`对象中会用到，在`MiniCssExtractPlugin`额外提取CSS插件中也会用到，`output.filename`的输出文件名是`[name].min.js`,`[name]`代表入口名称。
:::

### chunkFilename
::: tip chunkFilename
`chunkFilename`指的是不在`entry`中，却需要额外被打包出来的文件的名称，一般是需要懒加载的模块，比如`loadsh`文件。当`output.chunkFilename`没有被指定时，默认就会把chunk文件的id号当成前缀，比如`1.min.js`。
:::

### webpackChunkName
::: tip webpackChunkName
对于多个需要异步加载的文件，如果写成`[name].bundle.js`,就会打包出`1.bundle.js`这种辨识度不高的文件名称，区分起来十分困难，这时候就可以用`webpackChunkName`注释 来标识异步加载的文件名：在import导入的时候，以注释的方式为引入的文件起别名，比如`await import(/* webpackChunkName: "lodash" */ 'lodash')`,这样打包出来的就是`vendors~lodash.bundle.js`，`vendors~`的前缀是`webpack`的懒加载插件`SplitChunksPlugin`里的默认配置增加的。

`webpackChunkName`就是为预加载的文件取别名
:::

## webpackPrefetch、webpackPreload
### webpackPrefetch
::: tip webpackPrefetch
预获取配置。对于懒加载的文件，只有我们需要的时候才会引入，比如点击按钮加载`loadsh`，只有点击的时候才会才会加载`lodash`：懒加载时，会动态创建一个`script`标签，被添加到`head`头里加载资源。如果我们在`import`的时候添加`webpackPrefetch`注释，会将需要预获取的文件在请求中优先级变为`Lowest`，不会等到点击按钮的时候再加载文件，而会在父`chunk`文件加载完成后，空闲时加载`lodash`文件。
```html
<link rel="prefetch" as="script" href="vendors-loadsh.bundle.js">
```
:::

### webpackPreload
::: tip webpackPreload
需要在`webpack`中使用`preload-webpack-plugin`插件，并在需要预先加载的添加`/* webpackPreload: true */`来实现预加载配置。加了`webpackPreload`注释的`chunk`会在父`chunk`加载时，以并行的方式加载,将需要预加载的文件在请求中优先级提升到`High`。原理是利用`link`标签也能加载`js`的原理，并增加`preload`属性，来实现的预加载。
```html
<link rel="preload" as="script" href="title.js">
```
:::

## hash、chunkhash、contenthash
::: tip
哈希一般都是配合`CDN`缓存来使用的。如果文件内容改变了，那么文件的哈希值也会改变，对应的`HTML`引用的`URL`地址也会改变，用户请求时，`CDN`服务器发现文件哈希更新了，会从源服务器上拉取对应的数据，更新本地缓存
:::
### hash
::: tip hash
`hash`的计算是跟项目的构建相关的，项目每次构建都会生成一个新的构建`hash`值，输出的文件名中如果带有`hash`值`[name].[hash].js`,打包出的文件就会带上项目构建生成的`hash`，比如`index.def5949da1857d01b87e.js`。
:::

### chunkhash
::: tip chunkhash
如果都以`hash`来命名，那么每次打包，都会生成新的`hash`，这样所有资源的名字都会变，对于内容没有改变的文件，就失去了`CDN`缓存的作用。`chunkhash`就解决了这个问题，根据不同的入口文件进行依赖解析、构建对应的`chunk`，生成不同的`chunkhash`。当有文件改变时，只有属于同一个`chunk`的文件名称才会改变。
:::

### contenthash
::: tip contenthash
使用`chunkhash`时，其中有一个文件改变了，会生成新的`chunkhash`，那么属于同一个`chunk`的其他文件的名称也会变，但是其他文件并没有发生变化，这样也会浪费`CDN`缓存。`contenthash`就是解决这个问题的，`contenthash`是根据文件内容生成的唯一`hash`值，当文件内容不改变时，`contenthash`不会改变。一般额外提取出来的`css`会使用`contenthash`作为名称。
:::

## sourse-map的应用
::: tip sourse-map
`sourse-map`,就是一份源码和转换后代码的映射文件。

`devtool`常用值：

- 1、`source-map`:大而全，啥都有，`webpack`构建时间变长，看情况使用。
- 2、`cheap-sourse-map`:`cheap`，就是廉价的意思，只会映射到行，没有列的映射，而且是转换过的代码。响应的体积会小很多。
- 3、`cheap-module-eval-source-map`:开发环境可使用，在构建速度报错提醒上做了比较好的均衡。
- 4、`cheap-module-source-map`:线上环境一般是不配置`source-map`的，如果想要捕捉线上的代码报错，可以用这个。

开发环境一般使用`cheap-module-eval-source-map`或者`cheap-sourse-map`，区别如下
<img :src="$withBase('/assets/webpack-devtool.png')" alt="webpack-devtool">
:::