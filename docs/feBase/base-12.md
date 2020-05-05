---
title: 12、null和undefined的区别
sidebarDepth: 0
---
[[toc]]
# 12、null和undefined的区别
## 0 和 空字符串与 `null` 和 `undefined` 的区别：
>null和undefined相比于0和空字符串占用的内存更少

### `null`:
>空对象指针->没有具体的值->一般都是我们手动设置初始值为null，后期会给其赋值；

### `undefined`:
>未定义->连东西都没有->一般都是浏览器默认的值；
### 用`null`的几种情况：
::: tip null 
1、设定变量初始值：我们设定一个变量，后期我们要使用，那么我们设置默认值为`null`
2、释放堆内存：在JS内存释放中，我们想释放一个堆内存，就让其值变为`null`即可
3、在DOM元素获取中，不存在则结果为`null`：我们通过DOM中提供的属性和方法获取页面中的某一个元素标签，如果这个标签不存在，获取的结果是`null`，而不是`undefined`
4、在正则的exec/字符串的match捕获中，如果当前要捕获的字符串和正则不匹配的话，捕获到的结果为`null`；
:::
### 用`undefined`的几种情况：
::: tip undefined
1、JS预解释的时候只声明未定义，默认值为`undefined`；
2、在一个函数中，如果没有写`return`，或者`return`后什么都没写，默认返回值为`undefined`；
3、函数中设置了形参，但是执行的时候如果没有传递参数值，那么形参默认值为`undefined`；
4、获取一个对象的属性名对应属性值的时候，如果这个属性名不存在的话属性值为`undefined`；
5、严格模式下，`this`前没有明确的执行主体，`this`就是`undefined`
6、用来检测浏览器兼容问题，不兼容的话返回`undefined`
:::