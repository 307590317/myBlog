---
title: webpack 懒加载原理解析
sidebarDepth: 0
tags:
  - webpack
---
[[toc]]

# webpack 懒加载原理解析
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <button id="btn">异步加载</button>
</body>
</html>
```

```js
// ./src/asyncLoad.js

const btn = document.getElementById('btn')
btn.addEventListener('click',()=>{
  import (/* webpackChunkName:"title" */'./title').then(res=>{
    console.log(res.default)
  })
})
```
```js
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
function resolve(url) {
  return path.resolve(__dirname, url)
}
module.exports = {
  entry:'./src/asyncLoad.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  module:{
    rules:[
      {
        test:/.m?js$/i,
        loader: 'babel-loader'
      }/* ,
      {
        test:/.js$/i,
        use:['./delLoader.js']
      } */
    ]
  },
  plugins:[
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    })
  ]
}
```
```js
// 打包后的main.js文件

(function(modules)){
// ....
}({
  "./src/asyncLoad.js":
    (function(module, exports, __webpack_require__) {
      var btn = document.getElementById('btn');
      btn.addEventListener('click', function () {
        __webpack_require__.e(/*! import() | title */ "title")
        .then(()=>{
          return __webpack_require__.t(/*! ./title */ "./src/title.js", 7)
        }).then(function (res) {
          console.log(res["default"]); 
        });
      });
    })
});

// 打包后的单独的title.js代码

(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["title"],{
  "./src/title.js": ((module) => {
    eval("module.exports = '测试成功';\n\n//# sourceURL=webpack://learn/./src/title.js?");
  })
}]);
```
::: tip
首先，`webpack`会将异步加载的代码单独打成一个文件`title.js`，并进行包装，请求回来之后直接调用重写后的挂载在`window["webpackJsonp"]`上的`push`方法（`webpackJsonpCallback`）

之后再看打包后的`main.js`的参数代码，可以看出，点击的时候，会调用`__webpack_require__.e`方法来异步加载`title`文件，`__webpack_require__.e`方法就是异步加载的核心方法。
:::

## __webpack_require__.e异步加载核心方法
```js

// 存储已加载和正在加载的模块
// undefined : chunk没有加载, null = chunk 预加载 / 预获取配置
// Promise = chunk加载中, 0 = chunk 已加载
var installedChunks = {
  main: 0 // 0代表已加载
}

__webpack_require__.e = function requireEnsure(chunkId) {
  
  var promises = [];
  // 从installedChunks取chunkId对应的值
  var installedChunkData = installedChunks[chunkId];
  // installedChunkData = 0 代表已加载
  if(installedChunkData !== 0) {
    // 当installedChunkData有值说明是priomise 正在加载中
    if(installedChunkData) {
      // 将正在加载的promise放入promises数组中
      promises.push(installedChunkData[2]);
    } else { 
      // 如果没有值，则说明模块没有加载，则生成promsie
      var promise = new Promise(function(resolve, reject) {
        installedChunkData = [resolve, reject];
      });
      installedChunkData.push(promise)
      // installedChunks[chunkId] = [resolve, reject, promise]
      // 将chunkId与对应的 installedChunkData保存在 installedChunks中
      installedChunks[chunkId] = installedChunkData
      // 将promise放入数组中
      promises.push(promise);

      // 开始生成script 标签来加载chunk
      var script = document.createElement('script');
      script.src = chunkId + '.js';
      document.head.appendChild(script);
    }
  }
  return Promise.all(promises);
};
```
::: tip __webpack_require__.e
`__webpack_require__.e`方法主要的三件事
- 1、使用加载对应的`js`文件,也称`chunk`。
- 2、设置`chunk`加载的三种状态并缓存在`installedChunks`中，防止`chunk`重复加载。
- 3、处理`chunk`加载超时和加载出错的场景。（文中未做详细解析）

`__webpack_require__.e`内部会根据传入的参数去`installedChunks`中查找，如果没有加载过，则生成一个`promise`，然后将`[resolve, reject, promise]`, 与传入的`chunkId`映射起来，以便模块加载后调用。之后创建`script`标签，加载对应的`chunk`。
最后调用`Promise.all(promises)`方法，等待所有异步加载的模块已经加载完成后（已经拿到文件），可以在`then`方法继续做处理。
:::

## webpackJsonpCallback方法
::: tip webpackJsonpCallback
模块加载完成之后，会调用挂载在`window["webpackJsonp"]`上重写后的`push`方法，实际上就是`webpackJsonpCallback`来完成模块加载后的一些逻辑。`webpackJsonpCallback`方法会对加载回来的模块进行合并，和并之后循环模块，并调用已加载完成模块对应`promise`的`resolve`方法，当所有的`resolve`调用完成后，会走到`Promise.all(promises)`的`then`方法中继续调用`__webpack_require__.t`方法对模块进行处理。
:::
```js
let jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
jsonpArray.push = webpackJsonpCallback;

/* 
  chunkIds = ['title']  
  moreModules = { "./src/title.js": ((module) => {
    eval("module.exports = '测试成功';\n\n//# sourceURL=webpack://learn/./src/title.js?");
  }
*/
function webpackJsonpCallback([chunkIds, moreModules]) {
  // 将异步加载过来的chunk中的模块定义的代码添加到modules中以便通过__webpack_require__方法加载
  for(moduleId in moreModules) {
		modules[moduleId] = moreModules[moduleId];
	}
	// 循环加载完成的模块名称所组成的数组，挨个调用他们对应promise的resolve方法。
	var moduleId, chunkId,  resolves = [];
	for(i = 0;i < chunkIds.length; i++) {
		chunkId = chunkIds[i];
    // 将已加载模块的resolve方法放入 resolves 中
		resolves.push(installedChunks[chunkId][0]);
    // 标记该模块已经加载完成
		installedChunks[chunkId] = 0;
	}
	// 循环resolves，依次调用resolve方法，就会往下走then方法
	while(resolves.length) {
		resolves.shift()();
	}
};
```

## 
::: tip __webpack_require__.t 统一处理结果
`__webpack_require__.t`方法将模块统一处理，伪造`namespace`，值都统一从`default`属性上取。最后在then方法中返回伪造`namespace`之后的结果，就能在用的`then`方法中拿到最终的值。
:::

```js
// mode & 1: value是一个模块ID，则直接加载
// mode & 2: 不是esModule,需要包装成esModule,合并所有的value上的属性到ns对象上
// mode & 4: 如过value已经是一个esModule模块则直接返回
// mode & 8|1: 不需要包装直接返回
__webpack_require__.t = function(value, mode) {
  // value是模块id，加载模块
	if(mode & 1) value = __webpack_require__(value);
	if(mode & 8) return value;
  // 模块已经是一个esModule，则直接返回
	if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
  // 包装成esModule并返回
	var ns = Object.create(null);
	Object.defineProperty(ns, 'default', { enumerable: true, value: value });
	if(mode & 2 && typeof value != 'string'){
    for(var key in value) {
      ns[key] = value[key]
    }
  }
  // 最终返回伪造namespace之后的模块
	return ns;
};
```
