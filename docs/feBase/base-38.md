---
title: 38、Promise设计模式
sidebarDepth: 0
---
[[toc]]
# 38、Promise设计模式
>ES6中给我们提供了一个专门处理异步程序的类：`Promise`类
>
>通过`Promise`设计模式（使用`promise`类的处理代码逻辑被称为`Primose`设计模式）可以有效避免回调函数嵌套的问题（避免出现回调地狱）
## Promise详解与axios的使用
::: tip 
`promise`：解决回调问题，存在三个状态（成功、失败、等待）
`Promise`是一个类，`new Promise`时可传递一个函数，在 `new` 的时候就调用传递进来的函数（同步的）,而且会给函数默认传递两个参数（都是函数数据类型的）
- resolve：为成功后要执行的方法
- reject：为失败后要执行的方法
```js
let a = new Promise((resolve,reject)=>{
  let a=1,b=3;
  if(a<b){
  //条件满足时我们让resolve执行并传入需要的参数
    resolve('条件满足');
    //resolve执行时then方法中的第一个参数(函数)就会执行
  }else{
  //条件不满足时我们让reject执行
    reject('条件不满足');
    //reject执行时，then方法中的第二个参数(函数)就会执行
  }
})
```
:::
### Promise的原型上的 then 方法
>`then`方法中有两个参数(成功执行的函数，失败执行的函数)
```js
a.then(res=>{
	//我们在promise中规定什么时候执行resolve，此方法就什么时候执行，res为执行resolve时传递的参数
	console.log(res);//条件满足 
},(err)=>{
	//我们在promise中规定什么时候执行reject，此方法就什么时候执行，err为执行reject时传递的参数
	console.log(err);
})
```
### Promise的原型上的 catch 方法
>代替`then`方法中的第二个回调函数（只要代码报错就会被`catch`捕获到，）
>- 1、在`Promise`中执行`reject`方法会触发`catch`方法
>- 2、`Promise`中的代码执行报错也会触发`catch`
>- 3、上一个`then`中代码报错也会触发`catch`

```js
new Promise((resolve,reject)=>{
  //resolve:程序处理成功执行的方法
  //reject：程序处理失败执行的方法
  //=>编写一些异步操作代码（ajax或者一些其他异步代码）
  fs.readFile('./index2.html','utf8',(err,res)=>{
    if(err){
      reject(err);
      return;
    }
    resolve(0);
  })
}).then(res=>{
  console.log(res);
  return 10
}).catch(err=>{
  //reject方法执行的时候会触发catch
  //Promise中的代码执行报错的时候catch方法也会执行,而且catch后面then方法中的回调函数也会执行
  console.log(err);
  return 20
}).then(res=>{
  console.log(res);
  return res*10
}).then(res=>{
  console.log(res);
});
```
## axios 就是基于 Promise 进行封装的
::: tip 使用方法如下
先引入`axios`：
```js
<script src="axios.js"></script>
<script>
// 使用axios：axios调用get方法后会返回Promise的一个实例，可以直接用then方法
axios.get('json/1.json').then((res)=>{
//axios成功后会给执行的方法传递一个对象，如果要获取到需要的数据，需要用res.data;
  console.log(res.data);
},(err)=>{
  console.log(err);
})
</script>
```
:::
