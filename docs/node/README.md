---
title: node的安装和使用
sidebarDepth: 0
tags:
  - node
---
[[toc]]
# Node
::: tip
基于事件驱动的异步编程
到达某个时候做一些事情，就是事件驱动
常人所说的`node`是后台编程语言，其实`node`只是一个工具（或者环境），我们可以把`node`安装在服务器上，`node`提供的环境可以运行js代码，这样我们就可以在服务器端使用JS编写一些处理服务器相关操作的程序，也可以理解为`node`让js变为了后台编程语言；

1、`node`是基于V8引擎来渲染JS的（V8是谷歌的引擎）
- 渲染JS的速度会很快
- 我们在使用JS开发后台程序的时候，不需要考虑浏览器兼容了，使用`JS`的最新标准即可（`ECMAScript`）

2、单线程、无阻塞I/O操作、事件驱动（`event-driven`）
:::
## node切源方法(镜像管理：需要使用nrm)
```js
nrm ls // (查看当前使用镜像)
nrm use xxx //（使用名字为xxx的镜像）
```
## node安装方法
::: tip 安装node
`npm install/uninstall xxx -g` : 把xxx模块安装在全局下或从全局下卸载
- 当前电脑的每一个项目都可以通过命令来使用全局下安装的模块
- 但是不能通过`require`导入使用
- 容易引发版本冲突

`npm install/uninstall xxx` : 把xxx模块安装在某一个项目当中或从当前项目中卸载xxx模块
- 安装在本地项目中的模块只能在本项目中使用
- 不能基于命令运行，但是可以通过`require`导入到js中进行二次开发
- 不会导致版本冲突
`npm root -g` 查看当前电脑全局安装目录
`npm root`  	查看当前项目的模块安装目录
`npm  ls- g/npm ls` 输出全局/当前项目中已经安装的模块清单
:::
### 如何让安装在本地的模块也可以基于命令操作
::: tip 
`npm init -y `：在当前项目的根目录中生成`package.json`文件，这个文件中记录了当前项目的基本信息
如何配置命令来操作
1、先在本地安装模块
2、在`package.json`文件中配置可执行的命令（在`scripts`属性中配置好要在DOS下执行的命令）
3、`npm run xxx `执行即可
本地安装的时候，我们一般都会加 `--save/--save-dev`
- 开发环境：自己开发代码时候的环境
- 生产环境：项目部署到服务器上的环境
- `-- save`：把安装的模块信息存储在`package.json`的生产依赖清单中
- `-- save-dev`：把安装的模块信息存在`package.json`的开发环境的依赖清单中

由于项目依赖的模块较大，每次上传下载同步都很浪费时间，所以我们只需要上传`package.json`文件，里面写了所有的依赖模块，我们同步下来之后只需要在需要的项目中打开cmd窗口执行`npm install`，就可以把项目依赖的模块下载到当前项目中；
:::
## node是如何执行js代码的
::: tip
常用的方式有三种
- 使用`node`的`repl`（`Read-Evaluate-Print-Loop`，输入-求值-输出-循环）命令
- 使用命令：`nodex xxx.js`（在`node`中把js文件执行）
- 在`webStrom`中直接右键->`Run xxx.js`也可以让`JS`在`node`中执行
*[IO操作]*
I（input）：输入
O（Output）：输出
`I/O`操作包括读写操作、输入输出、请求响应，还有读写外部设备都是 `io`，比如打印机，显示器，数据库
JS运行在服务器端`node`环境下，可以对服务器上的资源文件进行I/O操作；
`NODE`中提供了供JS代码操作I\O的方法（后面讲的fs模块就是做这件事情的）
:::
## node中的异步操作
>- 定时器
>- 异步的`I/O`操作
>- 回调函数
>- `setImmediate`：设置立即（设置在等待任务队列的顶部）
>- `process.nextTick`：在主任务队列的最底部执行（永远会在`setImmediate`之前执行）
## node 和客户端浏览器的主要区别：全局对象
>浏览器全局对象： `window`
>
>node全局对象：`global`
### node中的属性
>`global.process`
>
>`NODE`中提供的管理进程的属性
>
>我们可在`node`的`Repl`命令下用`set`方法来设置我们的自定义属性；（此时我们设置的是全局下的自定义属性，每个模块都可以取到）；
>
>也可以在每个JS模块中直接`process.env.xxx=xxx`的方法设置自定义属性（此时我们设置的是当前模块中的自定义属性，只有当前模块能用）；
### NODE天生就是基于模块化开发的
::: tip
`node`中的模块概念非常强，每一个JS就相当于一个模块；

`node`是基于`common.js`规范来进行设计的，提供了很多创建模块、调取模块、导出模块的方法
- CMD模块开发思想：seajs（按需求导入：用到的时候再导入使用）
- AMD模块开发思想：requirejs（提前导入所有需要的依赖）

`node`中也提供了三大模块：
1、自定义模块：自己创建的
2、第三方模块：别人写好的我们导入使用即可
3、内置模块：天生自带的
:::
#### 自定义模块的原理
>创建一个JS就相当于创建一个模块，而模块之间是独立的（也可以共享）。
```js
//=>NODE为了实现模块之间的独立，会自动包一层闭包，而且给每一个模块传递五个值
(function (exports, require, module, __filename, __dirname) { 
  /*
  * module模块:NODE模块管理的对象
  * exports导出：等同于module.exports，用来把模块进行导出的
  * require导入：通过这个方法可以把一些模块导入到当前模块中使用
  */
  //=>通过module.exports方法把一些想要供别人使用的属性和方法暴露出来
  module.exports={
    fn:()=>{}
  };
})();
//=>下一个模块
(function (exports, require, module, __filename, __dirname) { 
	let obj=require('pre');//=>导入上边的模块
	//=>我们的obj就是上面模块导出的对象 
	//{fn:()=>{}}
})();
```
>`require`：导入某个模块，目的是使用其他模块中的属性和方法
```js
require('./xxx')：指定目录的情况下，都是为了要导入自定义的模块
require('xxx')：不指定路径的话，会先到node_modules文件夹中找到第三方模块，有的话，导入的是第三方模块，没有的话，就去内置模块中找，内置中有，导入的就是内置模块，没有的话就会报错；
```
>`module.exports`：把当前模块中的某些属性和方法导出（默认导出的是一个空对象）
```js
//module.exports默认导出的是一个空对象
module.exports=exports={};
module.exports.fn=fn;//向默认的module.exports导出的空对象中添加fn属性，值为当前模块中的方法
exports.a=a;//向module.exports默认导出的空对象中添加a属性，值为a；
module.exports=fn;//直接把默认导出的空对象修改为了fn变量所代表的值
//当module.exports指向一个新的内存时，就只能用module.exports导出了
module.exports={};
exports.a=a;//与module.exports指向的不是同一个内存地址了，无法再通过exports导出
```
### 第三方模块的安装
::: tip
除了`npm`我们还可以使用`yarn`来安装模块
1、首先在全局安装`yarn`
`npm install yarn -g`
  
2、想在项目中安装模块，和npm的操作步骤类似
`yarn init -y`  生成`package.json`
`yarn add xxx`  安装具体模块，并且保存在生产依赖项中（`yarn`只能把模块安装在本地项目中不能安装在全局）
`yarn add xxx --dev` 保存在开发依赖项中
`yarn remove xxx` 移除安装的模块
`yarn install` 按照依赖模块清单，跑环境

基本上和`npm`的操作类似，大家可以体验一把哈，看看急速安装是什么状态
:::
### 内置模块之http模块
::: tip http模块
这个内置模块是`node`中一个非常重要的模块，基于这个模块，我们可以完成服务的创建和管理，以及接收客户端的请求，把一些内容返回给客户端

`HTTP`模块创建的服务是基于`HTTP`传输协议完成请求和响应的，`HTTPS`也是一个内置模块，它可以让我们的传输基于`HTTPS`传输协议（比`HTTP`协议更安全）;

`http.createServer((request，response)=>{})`

用来创建服务的，在当前服务器上创建一个服务（返回值就是创建的服务）
```js
let http = require('http');
let server = http.createServer(()=> {
    console.log('ok');
});
server.listen(9999, ()=> {
    console.log('server is success,listening on 9999 port!');
});
```
*注意*：回调函数不是服务创建成功之后执行，而是当客户端向当前这个服务发送请求的时候才会被触发执行（不仅触发执行，而且还会默认传递两个参数：`request，response`）
- `request`：存放的是所有客户端的请求信息，包含问号传参的数据内容
  - `request.method`：存储的是客户端请求的方式(`get`或`post`请求)
  - `request.url`：存放的是客户端请求的文件资源的目录名称以及传递给服务器的数据
  - `request.headers`：存储客户端发送的请求头全部信息

- `response`：提供相关的属性和方法,可以让服务器端把内容返回给客户端
  - `response.write()`：参数为向客户端返回的内容（通过设置响应主体的方式返回）
  - `response.end()`：结束响应，参数也是放在响应主体中的（`end`必须要有，只有`end`才代表响应结束，才能结束`http`事务）
  - `response.writeHead()`：设置响应头信息，第一个参数为设置的状态码，第二个参数是具体的响应头内容

`sever.listen(监听的端口号,()=>{})`

用创建的服务执行`listen`这个方法，相当于给服务监听端口号（一台服务器上可能存在多个服务或者项目，端口号是为了区分不同服务）
端口号：0-65535，同一台服务器上不允许出现相同端口号的服务
回调函数：当端口号监听成功，立即执行回调函数（我们可在回调函数中给一些监听成功的提示）

当服务创建成功并且端口号也监听成功了，当前创建的服务会在服务器上一直运行着，只有这样，当客户端不管什么时候发送请求，才有服务为其处理；
:::
#### 客户端如何向创建的服务发请求
::: tip 拿当前操作举例
1、http://localhost:9999/   向当前自己电脑本地服务发送请求（localhost就是本地服务的意思），要求服务器端和客户端都是自己的电脑
 
2、http://192.168.0.38:9999/  通过局域网IP（内网IP）访问具体的服务（只要大家在同一个局域网内，互相之间可以通过对方的IP地址，访问到对方的服务）

都要指定好对应的端口号
::: 
#### `MIME` 类型
>每一种资源文件都有自己所属的类型，我们把这个类型称为：`MIME`类型；下面是各种文件类型对应的`MIME`类型
- `html：text/html`
- `css：text/css`
- `js：text/javascript`
- `json：application/json`
- `ico：application/octet-stream`
- `txt：text/plain`

### 内置模块之url模块

>这个模块最主要的作用就是用来解析URL地址中每一部分信息的
#### `url.parse(str,boolean)`
::: tip url.parse
`url`模块中提供了一个方法`url.parse(str,boolean)`用来解析URL地址。将`URL`字符转换为`URL`对象；

- `str`:要处理的字符串；
- `boolean`:为true时，会默认的把问号传参的值格式化（转换为对象键值对的方式来存储）默认为false；
```js
let url = require('url');
let str = 'http://www.zhufengpeixun.cn:80/index.html?lx=12&age#aa';
console.log(url.parse(str, true));
//=>结果
Url {
  protocol: 'http:', //=>协议
  slashes: true,
  auth: null,
  host: 'www.zhufengpeixun.cn:80',
  port: '80',  //=>端口
  hostname: 'www.zhufengpeixun.cn',  //=>域名
  hash: '#aa',  //=>哈希值
  search: '?lx=12&age',
  query: { lx: '12', age: '' },  //=>问号传参
  pathname: '/index.html',  //=>请求文件的路径名称
  path: '/index.html?lx=12&age',
  href: 'http://www.zhufengpeixun.cn:80/index.html?lx=12&age#aa' 
}
```
:::
### 内置模块之fs模块
>主要作用就是进行`I/O`操作（对服务器端的文件进行增删改查等操作）
>
>`fs`中提供的方法一般都是两套，带有`Sync`字段的都是同步操作，不带的都是异步操作
#### `fs.readFile`
::: tip fs.readFile()
`fs.readFile()`：异步读取文件中的内容（此方法没有返回值，可在回调函数中做一些事情）
```js
let fs=require('fs');
let con=fs.readFile('./index.html','utf8',(err,result)=>{
    //当文件读取成功或者失败的时候，会触发回调函数执行（并且默认传递两个实参值）
    //err(error):当读取出错，信息保存在err中，如果没有出错，err为null
    //result:当读取成功，信息保存在result中(第二个参数不设置utf8，获取的结果则是buffer格式的)
    if(err){//err存在，代表出错了
      console.log(err);
      return;
    }
    console.log(result);
});
console.log(con);//undefined
```
:::
#### `fs.readFileSync`
::: tip fs.readFileSync(path,str)
`fs.readFileSync(path,str)`：同步读取文件中的内容(默认返回的是buffer格式的文件内容)
- `path`：要读取的文件路径名称（如`'./index.html'`）
- `str`：需要得到的文件格式（不写默认为buffer格式，一般我们写`'utf8'`）

同步和异步的区别在于：同步读取文件，文件内容没有读取完成，后面的任务无法处理，而异步不是，数据没有读取完成，下面的任务继续执行（此特点称之为：无阻塞的`I\O`操作）；
:::
#### `fs.writeFile(path,text)`
::: tip fs.writeFile(path,text)
`fs.writeFile(path,text)`：异步的向某个文件中写入内容（此方法没有返回值）
1、如果当前文件不存在，则会自动创建文件（不会自动创建文件夹），然后再写入内容
2、文件写入数据覆盖式写入（新写入的内容会覆盖原来的内容）
3、写入的内容需要是字符串或者buffer格式的数据
:::
#### `fs.writeFileSync()`
`fs.writeFileSync()`：同步的向某个文件中写入内容（没有返回值）
```js
let con=fs.writeFileSync('./temp.txt','hello',(err,result)=>{
  console.log(result);
});
```
#### `fs.readdir()`
>`fs.readdir()`：异步读取某一个目录下所有的内容
```js
fs.readdir('./',(err,result)=>{
  if(err){
    console.log(err);
    return;
  }
  console.log(result);//获取的是一个数组集合，其中包含了'./'目录下所有的文件和文件夹的信息
});
```
#### `fs.readdirSync()`
>`fs.readdirSync()`：同步读取某一个目录下的所有内容
#### `fs.mkdir()`
::: tip fs.mkdir()
`fs.mkdir()`：创建一个文件夹
1、如果已经创建的文件夹已经存在，再创建的话返回的是错误信息
2、不能一次创建多级目录如：./temp/day/css,如果没有temp文件夹则会报错；
```js
fs.mkdir('./temp',err=>{
  if(err){
    console.log(err);
    return;
  }
});
```
一次创建多级目录的方法（正则方法）
```js
let makeDir=function (val) {
  let reg=/\.?\/(\w+)/gi;
  let url='';
  val.replace(reg,content=>{
    url+=content;
    /*同步创建*/
    fs.mkdirSync(url);
    /*异步创建*/（未完善）
  });
};
makeDir('./temp/day/js/time/css');
```
:::
#### `fs.rmdir()`
::: tip fs.rmdir()
`fs.rmdir()`：删除一个文件夹
如果要删除的文件夹还存在子文件夹则会提示出错：要从最深的目录开始删除
```js
/*一次删除多个文件夹*/
let removeDir=function (val) {
  let reg=/\.?\/(\w+)/gi;
  let url='.';
  let ary=val.split('/').reverse();
  ary.pop();
  let n=-2;
  val.replace(reg,(content,input,index)=>{
    n++;
    let index1=val.indexOf(ary[n]);
    index1===-1?index1=val.length:null;
    url=val.slice(0,index1);
    fs.rmdirSync(url);
  });
};
removeDir('./temp/day/js/time/css');
```
:::
#### `fs.copyFile()`
>`fs.copyFile()`：拷贝一个文件夹
