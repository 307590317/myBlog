---
title: Generator 函数
sidebarDepth: 0
---
[[toc]]
# 基本概念
::: tip 基本概念
Generator 函数有多种理解角度。语法上，首先可以把它理解成，Generator 函数是一个状态机，封装了多个内部状态。

执行 Generator 函数会返回一个遍历器对象，也就是说，Generator 函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

形式上，Generator 函数是一个普通函数，但是有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用yield表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。
:::

## */yield 表达式
::: tip yield
`yield`表达式值只暂停`yield`下一行的代码（不太严谨），严格来说，`yield`和 当前行分号之间的代码会被执行，从当前行分号之后，开始暂停，不再往下执行。如果`yield`所在行没有分号，则从`yield`的下一行开始暂停执行。
```js
function *foo(){
  let x = yield test()
}
function test(){
  console.log('test')
  return 2
}
let it = foo()
it.next() // 打印出 test 返回结果{ value:2, done:false } 
```

```js
function *foo(){
  let x = yield (test(),console.log('aaa'))
}
function test(){
  console.log('test')
  return 2
}
let it = foo()
it.next() // 打印出 test aaa 返回结果{ value:undefined, done:false }  返回 undefined 是因为console.log()的返回结果为undefined
```

```js
function *foo(){
  /* 由此可以看出yield 和分号中间的代码会被执行，暂停的是分号之后的代码 */
  let x = yield test();console.log('aaa')
}
function test(){
  console.log('test')
  return 2
}
let it = foo()
it.next() // 打印出 test，不打印aaa 返回结果{ value:2, done:false } 
```
:::
## `yield`表达式和`return`
::: tip yield 表达式和 return 语句有相似之处，也有区别
都能返回紧跟在语句后面的那个表达式的值。

区别在于：
1、每次遇到`yield`，函数暂停执行，执行`next`方法之后，函数继续从上次暂停下来的位置向后执行，而`return`语句则直接返回函数的执行结果。
2、一个函数中只能执行一次`return`语句，但是可以执行多个`yield`表达式
3、与`return`语句不同，`return`返回其后面表达式的值。`yield`表达式后面的值不代表 `yield` 的返回值，只表示 对应`next`执行返回对象中`value`对应的值。
`next`方法执行时的参数是上一次`yield`的返回值（第一个`next`方法传递的参数是无效的），如果没有参数，则`yield`默认返回`undefined`
:::

## async/await原理
::: tip async/await
`async/await`就是Generator函数的语法糖，就是将函数的星号 `*`替换成`async`,将`yield`替换成`await`。

`async/await`函数的实现原理：就是将Generator函数和自动执行器，包装在一个函数里，函数调用后，会自动执行，输出最后结果。
:::