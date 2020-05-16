---
title: express
sidebarDepth: 0
tags:
  - node
---
[[toc]]
# express的安装与使用
[详解可参考阮一峰的解析](http://javascript.ruanyifeng.com/nodejs/express.html#toc0)
::: tip express
`express`是`Node`中的一个内置框架，我们可以基于`express`快速搭建一个web服务，并且提供一些供客户端调用的`api`接口，（支持中间件，支持路由处理）：还有一个框架和它类似，叫`koa`；

*安装`express`模块及附属模块*

```js
yarn add express body-parser express-session cookie-parser
//  express：express核心框架
//  body-parser：用来快速解析请求主体中的内容
//  express-session/cookie-parser:方便我们在express中操作session的
```
*使用express*

导入后接收的结果是一个函数，可以直接执行的。执行的返回结果还是一个函数，而且有很多自定的方法；(如`listen`方法，`use`方法等)
```js
//使用express模块必须写的内容
let express = require('express');//导入模块
//执行express方法返回一个函数（要用的方法都定义在express执行返回的函数上面）
let app = express();
//调用listen方法监听一个端口号就可以起服务了
app.listen(8666,()=>{
  console.log('成功监听8666端口号');
});
```
:::
## express的功能
### 1、路由功能
::: tip 路由
`express`执行后 返回的函数上有定义路由规则需要用到的方法
客户端有多少种请求方式，`app`上就有多少种定义路由规则的方法(常用的有`get，post，all`等)
- `app.get()`：`get`方法(对应客户端是以`get`方式请求的)
- `app.post()`：`post`方法(对应客户端是以`post`方式请求的)
- `app.all('*',(req,res)=>{})`：`all`方法能匹配所有的请求方式：路径为 `*` 代表可以匹配所有的路径

每个方法中都包含两个参数
- 1、第一个参数是需要定义的路由的路径
- 2、第二个参数是一个回调函数(回调函数执行时会默认的传入两个参数：`req，res`)；
```js
//客户端访问一般都是get请求，之后匹配路径，路径符合执行对应的回调函数，回调函数执行的时候会默认传入两个参数，req请求的有关信息，res响应的有关信息
app.get('/signup',(req,res)=>{
  res.end('signup');//向客户端返回字符串signup
});
app.post('/signup',(req,res)=>{
  res.end('post signup');
});
```
:::
### 2、参数获取功能
::: tip 参数获取
一般请求的格式如下
如何查看请求的格式：
可使用`curl`命令在`cmd`命令行中向服务端发起请求来查看请求格式

*`curl http://localhost:8080 -v`*
- 1、请求起始行：包括请求方式、请求路径、协议/版本号
- 2、请求头
- 3、请求主体

```js
//http://localhost:8080/user?id=1
app.get('/user',(req,res)=>{
  console.log(req.method);//获取请求方式
  console.log(req.headers);//获取请求头对象
  console.log(req.url);//包含了完整的请求路径=>/user?id=1
  //express新增的属性
  console.log(req.path);//路径名 =>/user
  console.log(req.query);//id=1=>{ id: '1' }
  res.end('ok');
});
```
路径参数：放在路径里的参数

```js
//http://localhost:8080/user/1/zfpx
app.get('/user/:id/:name',(req,res)=>{
//params的属性名来自于冒号后面的字符，值来自于客户端访问的路径
  let {id,name}=req.params;
  console.log(req.params);//{ id: '1', name: 'zfpx' }
  console.log(id);//1
  console.log(name);//zfpx
  res.end()
});
```
:::
### 3、中间件（重要）
#### 什么是中间件?
::: tip 中间件
简单说，中间件（`middleware`）就是处理`HTTP`请求的函数。它最大的特点就是，一个中间件处理完，再传递给下一个中间件。`app`实例在运行过程中，会调用一系列的中间件。

每个中间件可以从`app`实例，接收三个参数，依次为`request`对象（代表`HTTP`请求）、`response`对象（代表`HTTP`回应），`next`回调函数（代表下一个中间件）。每个中间件都可以对`HTTP`请求（`request`对象）进行加工，并且决定是否调用next方法，将`request`对象再传给下一个中间件。
:::
#### 什么时候会执行中间件？
::: tip 中间件的执行时机
- 当客户端发起请求之后，就会进入到中间件环节，然后才是路由的匹配；
- 中间件是中间环节，一般处理完自己的逻辑后都还会往下走，走到路由里进行真正的业务处理；
- 一个中间件处理完了之后通过`next()`进入下一个中间件，当中间件都走完了，则开始进入路由；（`next方法`：只有调用`next`方法后，才会继续执行下一个中间件）
- 一个路由代表一个业务逻辑处理，进入一个路由处理完了之后就不会再往下走了；
:::
#### 中间件的作用：
::: 作用
- 1、给请求和响应对象添加一些公共的方法和属性（如`req.query,req.path`）
- 2、在主体`API`逻辑处理前，提前进行一些公共的处理逻辑（如添加响应头统一处理）

```js
app.use((req, res, next) => {
  //在中间件中统一设置请求时需要服务器端返回的数据格式
  res.setHeader('Content-Type', 'text/html;charset=utf8');
  next();//只有调用了next方法才表示此中间件执行完毕，可以继续执行下一个中间件或开始路由
});
```
- 3、`use`方法内部可以对访问路径进行判断，据此就能实现简单的路由，根据不同的请求地址，返回不同的网页内容。

添加中间件（用`app.use`方法来添加中间件）

`use`方法包括两个参数
- 如果只传入了一个函数，则会直接执行传入的函数，并默认传入三个参数：`req，res，next`；
```js
app.use((req,res,next)=>{
	console.log(1);
  next();
  //中间件里可能会发生错误
  try{
    throw Error('xxx');
  }catch (e){
    //next默认是没有参数的，如果传递了参数就表示出错了，如果出错了，就会跳过所有后续的中间件和路由，直接进入next错误处理函数
    next(e);
  }
});
```
如果第一个参数传入了一个路径，第二个传入了一个函数，则会先进行路径匹配,如果路径正确，才会执行函数；
```js
//当客户端访问路径中根路径中包括'/user'就执行回调函数输出1
app.use('/user',(req,res,next)=>{
	console.log('1');
	next();
});
```
:::
### 常用的中间件

#### `body-parser` 模块
::: tip body-parser
- 获取请求主体的中间件：可从请求对象中获取请求主体，并且把请求主体转换成对象赋值给req.body的属性

先安装`body-parser`模块
然后导入`body-parser`模块
```js
let bodyParser=require('body-parser');//第三方中间件
app.use(bodyParser.urlencoded({extended:true}));
//使用此中间件可以拿到req.body={usernam:'zfpx,password:'123'}
```
:::
### `res.end、res.send、res.json` 的区别
>都是通过写入响应主体内，向客户端返回内容并结束请求的方法，
>- `res.end()`：参数只能是字符串格式的或者`buffer`格式的
>- `res.send()`：可以接收任何类型的参数，比如对象，数字
>- `res.json()`：可以接收任何类型的参数，之后转化为JSON格式返回给客户端
```js
app.post('/signup',(req,res)=>{
  let body=req.body;
  console.log(body);
  //end只能接收字符串格式或者buffer格式的参数
  // res.end(JSON.stringify(body));
  //send:和end类似，也是写入响应体，并且结束响应。但是它可以接收任何类型的参数，比如对象，数字
  // res.send(body);
  res.json(body);//json方法相当于在中间件中调用了send方法
});
```
### 静态资源中间件
>在`server.js`中添加了此中间件之后，客户端访问静态资源文件时的`js`就不需要我们自己写了
```js
let express=require('express');
let app=express();
app.use(express.static('./'));//静态文件中间件，express自带的功能
// './' 意思是基于server.js所在目录作为根路径进行查找；
```
### `response` 对象
::: tip 原生的
`res.writeHead()`:重写响应头信息
`res.end()`:向客户端返回数据，并结束响应；
`res.redirect`

`res.redirect`方法允许网址的重定向。
```js
response.redirect("/hello/anime");
response.redirect("http://www.example.com");
response.redirect(301, "http://www.example.com");
```

`res.sendFile(文件路径及名称，{root:__dirname})`
`res.sendFile`方法用于向客户端发送文件。

`res.render`
`res.render`方法用于渲染网页模板。

`res.statusCode`：设置状态码
```js
app.get('/login',(req,res)=>{
  res.render('hello.ejs',{val:'我很英俊',a:'<h1>我在哪</h1>',school:{name:'zf',age:'8'}});
});
//上面的代码使用render方法将后面第二个参数中的属性传入到hello.ejs模版中（即可在模版中直接使用对象中的属性），渲染成HTML网页；
```
:::
## `Express.Router` 用法
::: tip Express.Router
真实项目中我们为了有效得管理接口，我们会把相同功能体系得接口进行归类，在实现的时候，也会分类实现
如:
- `/user/signin`
- `/user/signup`

- 1、创建一个`routes`文件夹，在这个文件夹中存储所有功能模块的接口信息（分类存储）；
- 2、在每一个路由模块中完成`API`接口的编写
```js
let express = require('express'),
router = express.Router();//=>router和app其实差不多
router.use((req, res, next)=> {
  console.log(`ok`);
  next();
});
router.post(`/signin`, (req, res)=> {
  res.send('login success');
});
router.post(`/signup`, (req, res)=> {
  res.send('register success');
});
module.exports = router;//=>把创建的路由导出,方便后续调取使用
```

- 3、在sever中引入并使用
```js
let express = require('express'),
    app = express();
app.use(`/user`, require('./routers/user'));
```
:::
## `express` 中获取客户端传递的信息
::: tip 
客户端把信息传递给服务器
客户端传递给服务器的信息一般都是字符串格式的（`JSON`字符串或者`format-data`字符串`[xx=xxx&aa=bbb]`）,方式如下：
- 1、问号传参（一般都是`get`请求）
- 2、设置请求头（`cookie`等信息传送）
- 3、设置请求主体（一般都通过`post`请求）

`express`中如何获取到对应的信息？
- 1、获取请求头或问号传参方式传递的数据
```js 
//http://localhost:8080/user?id=1
app.get('/user',(req,res)=>{
  //通过req中的query属性就可以获取问号传递的参数值，（获取的结果是个对象）
  res.send(req.query);
  console.log(req.headers);//=>通过req的headers可以直接的获取请求头信息(想获取其中的某一个:req.headers.host...)
});
```
- 2、获取通过设置请求主体传递的数据
```js
//  1、我们自己写的获取请求主体内容的方法（下面有·内置的方法处理）
app.use('/reg',(req,res,next) => {
  let str = ``;
  req.on('data',chunk => {
      //正在接收请求主体中的内容（一般内容比较多）
      str += chunk;
  });
  req.on('end',() => {
      //接收结束，此时str存储的就是传递进来的信息
      //客户端传递给服务器的信息一般都是字符串格式的（JSON字符串或者format-data字符串[xx=xxx&aa=bbb]）
      //真实项目中我们需要把字符串转化为对象（方便操作）
      //querystring这个内置模块就是把format-data字符串转化为一个对象的
      let data = require('querystring').parse(str);
      //把转化后的对象赋给req的自定义属性body上；之后在其他中间件中就可以直接使用了；
      req.body = data;
  });
  next();
});
app.post('/query',(req,res)=>{
  res.send(req.body);//通过req中的body属性就可以获取之前我们处理过的参数值（获取的结果是个对象）
});


//  2、使用 node 的第三方模块 body-parser 拿到请求主体中的内容

let bodyParster = require('body-parser');
//客户端传递给服务器的信息一般都是字符串格式的（JSON字符串或者format-data字符串[xx=xxx&aa=bbb]）
app.use(bodyParster.json());//处理JSON字符串
app.use(bodyParster.urlencoded({extended:true}));//处理format-data格式字符串
app.post('/signin',(req,res)=>{
  console.log(req.body);
  res.send(req.body);
});
```
