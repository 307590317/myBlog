---
title: 20、Js中的回调函数
sidebarDepth: 0
---
[[toc]]
# Js中的回调函数

## 什么是回调函数
::: tip 回调函数
把一个函数当作实参值传递给另外一个函数，在另外一个函数中执行这个函数，这种处理机制就是回调函数机制；
什么时候用到回调函数？
凡是在某一个函数的某一个阶段需要完成某一件事情（而这件事情是不确定的），都可以利用回调函数机制，把需要处理的事情当作值传递进来
```js
function fn(num, callBack){
  typeof callBack === 'function' ? callBack() : null;
  //也可以使用以下默认方式（不过不严谨：可能传递的不是函数）
  callBack && callBack()
}
```
1、回调函数可以被执行多次；
2、还可以给callBack（）传递参数值；
3、还可以把回调函数中的this进行修改；
4、我们还可以接收回调函数执行返回的值；
```js
var ary=[12,23,34];
ary.sort(funciton(a,b){
  // 这里的function就是sort方法中的回调函数
})
```
:::
## 回调函数中的this问题
>回调函数中的 this一般都是window(严格模式下是undefined)，原因：
>- 我们一般执行回调函数的时候都是直接执行回调函数，没有指定执行主体，所以默认情况下都是window；
### 定时器中的this问题
>只要不指明执行主体，定时器中的this就是window.(严格模式下也是window)；