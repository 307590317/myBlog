---
title: webpack的安装和使用
sidebarDepth: 0
tags:
  - webpack
---
[[toc]]
# webpack的安装与使用
::: tip webpack的安装
安装`webpack`模块：最好不要安装在全局下，否则可能导致`webpack`的版本差异
`npm init -y`
`npm install webpack --save-dev`
在`package.json`中配置一个脚本，这个脚本用的命令是`webpack`，会去当前的`node_modules`下找`bin`对应的`webpack`名字让其执行，执行的就是`bin/webpack.js`，`webpack.js`需要当前目录下有个名字叫`webpack.config.js`的文件，我们通过`npm run build`执行的目录是当前文件的目录，所以会去当前目录下查找；
:::
## babel转义es6->es5
>安装`babel-core`（解析器）与`babel-loader`（翻译官）
>
>`npm install babel-core --save-dev`（开发的时候用，上线的时候不用）
>
>`npm install babel-loader --save-dev`
### babel-preset-es2015
>（让翻译官有解析`ES6`语法的功能）
>
>`npm install babel-preset-es2015 --save-dev`
### babel-preset-stage-0
>解析`es7`语法的
>
>`npm install babel-preset-stage-0 --save-dev`
## loader
::: tip loader
由`webpack`打包后出来的是一份`javascript`代码，在打包的过程中，会把遇到的所有`js`类型的文件进行打包，当遇到非`js`类型的文件时，我们需要对应的`loader`对文件进行转换，然后继续执行打包任务。

`loader`根据正则来匹配文件后缀，匹配中了之后就使用对应的`loader`对文件进行转化。一个文件类型可以对应多个`loader`，写成数组的形式，但是是按照从右往左，从下往上的顺序串行执行的，前一个`loader`的返回值会被当做下一个`loader`的入参，因此`loader`的编写最后都需要返回固定的`js`代码字符串(或者调用回调函数返回`content`)
:::

### `vue-loader` (解析.vue文件)
>- 安装 `vue-loader` 来解析.vue文件
>- 安装 `vue-template-compiler` 用来解析vue模版的
>- 用得时候只需要用`vue-loader`就可以了，他会自动调用`vue-template-compiler`

### 解析css样式

#### `style-loader`
>将导出的`css`模块 作为样式插入到`style`标签内

#### `css-loader`
>将`css`解析成模块，使用 import 加载，并且返回 CSS 代码

#### `postcss-loader`
>预处理`css`，比如增加厂商前缀

#### `less-loader`
>加载`less`文件并编译为`CSS`

#### `sass-loader`
>加载`Sass / SCSS`文件并将其编译为`css`

### 解析图片
::: tip
- `file-loader`
- `url-loader`（`url-loader`是依赖于`file-loader`的）

用的时候用的是`url-loader`，但是两个都要安装
```js
//- 图片的解析()如果url-loader后面不加'？'后面的内容，会把图片转换为base64码
//加了?limit=8192之后代表当图片小于8192字节（8k以下）才会转换为base64码，其他情况下输出图片
{test:/\.(jpg|png|gif)$/,use:'url-loader?limit=8192'},
//- 图标的解析
{test:/\.(eot|svg|woff|woff2|wtf)$/,use:'url-loader'}

/* 引入图片 */

//在JS中引入图片需要import，或者写一个线上路径(不然不会被解析)
import page from './2.jpg';
console.log(page);//page就是打包后的图片的路径
let img = new Image();
img.src = page;
document.body.appendChild(img);
```
:::
## plugin（插件）
::: tip 插件
`loader`负责文件转换，`plugin`是负责功能扩展。
`webpack`作为一个模块打包器，如果只有`loader`，那就只能打包文件，不能干别的事，你就只能得到一个打包后的`js`文件，将`js`自动的引入到`html`中，对`js`进行压缩，单独对`css`进行打包等等好多事情你都做不了。这些事情就是`plugin`负责要做的事。

`webpack`是基于发布订阅模式的，在运行的过程中会广播许多事件，插件通过监听这些事件，就可以在特定的阶段来执行对应的插件来实现想要的功能。

`Webpack`提供了两个非常重要的对象`compiler`和`compilation`，其中`compiler`暴露了和 `Webpack`整个生命周期相关的钩子`compiler-hooks`，而`compilation`则暴露了与模块和依赖有关的粒度更小的事件钩子`Compilation Hooks`。

`Plugin`的开发也需要遵循一定的规范：
- 插件必须是一个函数或者是一个包含`apply`方法的对象，这样才能在参数中拿到`compiler`对象；
- 每个插件中拿到的`compiler`和`compilation`都是同一个引用地址，若在一个插件中修改了它，就会影响其他的插件的使用。
- 异步事件需要在插件处理完任务时调用回调函数来通知`webpack`进入下一个流程，不然就卡主了。
:::
### 打包HTML的插件
::: tip 解析HTML
插件的作用是以我们自己的`HTML`为模版将打包后的结果自动引入到`html`中，产出到`dist`目录下
`npm install html-webpack-plugin --save-dev`
需要在`webpack.config.js`中配置如下信息
```js
//自动生成HTML页面并把打包后的文件引入的模块（需要在下面用plugins来配置）
let HtmlWebpack=require('html-webpack-plugin');
module.exports={
  //打包的入口文件，webpack会自动查找相关的依赖进行打包
  //打包一个文件直接写需要打包的文件名
  // entry:'./src/main.js',
  //打包多个文件要写为对象的形式
  entry:{
    main:'./src/main.js',
    main1:'./src/main1.js'
  },
  output:{
    // filename:'bundle.js',//打包一个文件后的名字
    filename:'[name].js',//打包多个文件时的名字
    //path：为打包后存放的地方
    path:path.resolve('./dist')//必须是一个绝对路径
  },
  //模块的解析规则
  module:{
    rules:[
      //- js 匹配所有的js 用babel-loader转译  排除掉node_modules
      {test:/\.js$/,use:'babel-loader',exclude:/node_modules/},
      //- css 匹配所有的css 用style-loader和css-loader转译 ,写use时从右边往左写，先转换为css样式，再插入到style标签内
      {test:/\.css$/,use:['style-loader','css-loader']},
      //- less 匹配所有的less 用less-loader等转义 从右往左写：先解析less样式，再转为css样式，最后插入style标签内
      {test:/\.less$/,use:['style-loader','css-loader','less-loader']},
      //- 图片的解析()如果url-loader后面不加'?'后面的内容，会把图片转换为base64码
      //加了?limit=8192之后代表当图片小于8192字节（8k以下）才会转换为base64码其他情况下输出图片
      {test:/\.(jpg|png|gif)$/,use:'url-loader?limit=8192'},
      //- 图标的解析
      {test:/\.(eot|svg|woff|woff2|wtf)$/,use:'url-loader'}
    ]
  },
  plugins:[
    new HtmlWebpack({//自动插入到dist目录中
      template:'./index.html'//使用的模版
    })
  ]
};
```
:::
### 开发热更新插件 webpack-dev-sever
::: tip webpack-dev-sever
这个模块内置了服务，可以帮我们启动一个端口号，当代码更新时，可以自动打包（在内存中打包），代码有变化就重新执行
`npm install webpack-dev-server --save-dev`
```js
//在package.json的scripts属性中增加 "dev":"webpack-dev-server"
"scripts": {
  "build": "webpack",
  "dev":"webpack-dev-server"
}
```
:::
