---
title: yield* 表达式
sidebarDepth: 0
---
[[toc]]
# yield* 表达式
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
