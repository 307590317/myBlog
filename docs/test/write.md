---
title: 手写面试题
sidebarDepth: 0
---
[[toc]]
# 手写面试题

## 防抖和节流
### 防抖
>高频事件触发，但在n秒内只执行一次，n秒内再次触发则重新计时；
```js
function unshake(fn, time = 500){
	let timer = null;
	return function(){
		clearTimeout(timer);
		timer = setTimeout(()=>{
			fn.apply(this,arguments);
			clearTimeout(timer);
      timer = null
		}, time)
	}
}
```

### 节流
>高频事件触发时，n秒内只执行一次，所以节流会稀释函数的执行频率
```js
function throttle(fn, time = 500){
	let canRun = true;
	return function(){
		if(!canRun) return;
		canRun = false;
		setTimeout(()=>{
			fn.apply(this,arguments);
			canRun = true;
		}, time)
	}
}
```

## 深度克隆
```js
function deepClone(val, map = new WeakMap()){
	//如果传入的值是null或者是基本类型，则直接返回数值本身；
	if(val == null || typeof val !== 'object') return val
  if(val instanceof Date) return new Date(val)
  if(val instanceof RegExp) return new RegExp(val)
	//如果克隆的值之前克隆过，则直接返回之前的值；
	if(map.has(val)) return map.get(val);
	const res = new val.constructor()
	//开始克隆并存储
	map.set(val,res);
	let keys = Reflect.ownKeys(val);//返回对象的所有属性
	let len = keys.length;
	while(len--){
		res[keys[len]] = deepClone(val[keys[len]],map);
	}
	return res;
}
```

## 自己实现new方法
::: tip 思路
- 1、创建一个新对象，并把这个对象的`__proto__`属性指向传入fn的原型
- 2、把函数中的`this`指向创建的新对象，并让函数执行
- 3、函数执行返回的是否是对象，如果是则返回，如果不是则返回新建的对象；
```js
function _new(fn){
	let obj = Object.create(fn.prototype);
	let arg = [].slice.call(arguments,1);
	let res = fn.apply(obj,arg);
	return res instanceOf Object ? res : obj;
}
```
:::

## 手写bind
:::tip ES5版
```js 
Function.prototype._bind = function(ctx){
  ctx = ctx || window
  var fn = this
  var outerArgs = Array.prototype.slice.call(arguments,1)
  return function(){
    return fn.apply(ctx,outerArgs.concat(Array.prototype.slice.call(arguments)))
  }
}
```
:::

## 手写call
:::tip ES5版
```js 
Function.prototype._call = function(ctx){
  ctx = ctx || window
  ctx._thisFn = this
  var args = []
  for(var i = 1; i < arguments.length; i++){
    args.push('arguments[' + i + ']')
  }
  var res = eval('ctx._thisFn(' + args + ')')
  delete ctx._thisFn
  return res
}
```
:::

## 手写apply
:::tip ES5版
```js 
Function.prototype._apply = function(ctx, args){
  ctx = ctx || window
  ctx._thisFn = this
  args instanceof Array ? null : args = []
  var values = []
  for(var i = 0; i < args.length; i++){
    args.push('args[' + i + ']')
  }
  var res = eval('ctx._thisFn(' + values + ')')
  delete ctx._thisFn
  return res
}
```
:::

## 手写setTimeout实现setInterval
::: tip
setInterval 的作用是每隔一段指定时间执行一个函数，但是这个执行不是真的到了时间立即执行，它真正的作用是每隔一段时间将事件加入事件队列中去，只有当当前的执行栈为空的时候，才能去从事件队列中取出事件执行。所以可能会出现这样的情况，就是当前执行栈执行的时间很长，导致事件队列里边积累多个定时器加入的事件，当执行栈结束的时候，这些事件会依次执行，因此就不能到间隔一段时间执行的效果。

针对 setInterval 的这个缺点，我们可以使用 setTimeout 递归调用来模拟 setInterval，这样我们就确保了只有一个事件结束了，我们才会触发下一个定时器事件，这样解决了 setInterval 的问题。
:::
```js
function interval(func, w, t){
  function interv(){
    setTimeout(interv, w);
    func.call(null);
  }
  setTimeout(interv, w);
}
```
## instanceOf
::: tip
```js
function myInstanceOf(val, ClassA){
  const prototype = ClassA.prototype
  while(val = val.__proto__){
    if(val === prototype) return true
  }
  return false
}
```
:::

## 手写模板字符串实现
::: tip
```js
function fn(str){
  const reg = /\$\{([^}]*)\}/g
  str = str.replace(reg, function(k, expr){
    return eval(expr)
  })
  return str
}
```
:::

## 手写urlParams
::: tip
```js
function urlParams(url){
  const reg = /[?&]([^?=&]+)(?:=([^?=&]*))?/g
  const res = {}
  url.indexOf('#') > -1 ? url = url.replace('#','&hash=') : null
  url = url.replace(reg, function(k, group1,group2){
    res[group1] = group2
  })
  return res
}
```
:::

## 手写并发请求限制函数
```js
// 单函数版本
function fetchWithLimit(urls = [], maxNum = 5) {
  let curIndex = -1, count = 0
  const res = []
  if(urls.length < 1) return res
  function complateCb(resolve, value, index) {
    count++
    res[index] = value
    if(curIndex >= urls.length) {
      if(count >= urls.length) resolve(res)
      return
    }
    next(curIndex++, resolve)
  }
  function next(index, resolve) {
    fetch(urls[index]).then(data =>{
      complateCb(resolve, { type:'suc',data }, index)
    }).catch(err =>{
      complateCb(resolve, { type:'err', err }, index)
    })
  }
  return new Promise((resolve, reject) => {
    while(++curIndex < limit){
      next(curIndex, resolve)
    }
  });
}

// 项目中使用 结合axios版本

const limit = 5
const requestAry = []
let pending_count = 0
function complateCb(fn, value) {
  fn(value)
  pending_count--
  if (requestAry.length !== 0) {
    next(requestAry.shift())
  }
}
function next({ params, resolve, reject }) {
  pending_count++
  service(params).then(res => {
    complateCb(resolve, res)
  }).catch(err => {
    complateCb(reject, err)
  })
}
function requestWithLimit(params) {
  if (pending_count < limit) {
    return new Promise((resolve, reject) => {
      next({ params, resolve, reject })
    })
  } else {
    const request = { params }
    const p = new Promise((resolve, reject) => {
      request.resolve = resolve
      request.reject = reject
    })
    requestAry.push(request)
    return p
  }
}
```

## 手写ES5实现ES6继承
```js
function MyDate() {
  var arg = [null];
  arg.push.apply(arg,arguments)
  var Constructor = Function.bind.apply(Date,arg);
  var instance = new Constructor();
  instance.__proto__ = MyDate.prototype;
  return instance;
}
MyDate.prototype = Object.create(Date.prototype);
MyDate.prototype.constructor = MyDate;
MyDate.__proto__ = Date;

var a = new MyDate('2019-11-20');
console.log(a.getFullYear())
```