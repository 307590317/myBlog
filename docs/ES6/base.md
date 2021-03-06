---
title: JS新语法规范ES2016)基础知识
sidebarDepth: 0
---
[[toc]]
# JS新语法规范ES2016)基础知识

>(详细内容请参考阮一峰大神的的ES6入门：[ES6入门](http://es6.ruanyifeng.com/#docs/intro))

## `const`
::: tip const
`const` 细节知识点和 `let`类似
`const`声明的常量只要声明就必须赋值，而且变量的值是一定的，不能被修改；
*注意*：并不是变量的值不得改动，而是变量指向的那个内存地址不得改动。对于简单类型的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。但对于复合类型的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指针，`const`只能保证这个指针是固定的，至于它指向的数据结构是不是可变的，就完全不能控制了。因此，将一个对象声明为常量必须非常小心。
 const声明的变量也存在暂时性死区，即只能在声明的位置之后使用；
:::

## `let` && `const` && `var` 的区别
::: tip 重点：变量提升和闭包
`let 变量名 = 变量值`

*使用`let`创建变量和使用`var`创建变量的区别*
- 1、用var声明的变量会变量提升，用let声明的变量不会进行变量提升
```js
// 用let创建变量
let xxx = xxx;
// 用let创建函数
let xxx = function() {}
// 创建自执行函数
;(function(){
    
})();
```
- 2、用`let`定义变量不允许在 *同一个作用域中* 重复声明一个变量(只要当前作用域中有这个变量，不管是用`var`还是用`let`声明的，再用`let`声明的话会报错：不能重复声明一个变量)，但是可以重复定义(赋值)
```js
let i=10;
let i=20; //会报错，
i=20;// 重复赋值不会报错
```
- 3、暂时性死区：在代码块内，使用let命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”（temporal dead zone，简称 TDZ）。
```js
if (true) {
  // TDZ开始
  tmp = 'abc'; // ReferenceError,报错之后下面都不会输出
  console.log(tmp); // ReferenceError，报错之后下面都不会输出

  let tmp; // TDZ结束
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
//下面也会报错出现TDZ
console.log(typeof x); // ReferenceError
let x;
//作为比较如果一个变量根本没有被声明，使用typeof反而不会报错。
console.log(typeof x);// "undefined"
```
- 4、ES6语法创建的变量(`let`)存在块级作用域（闭包的概念）
*好处：* 在有了块级作用域后，自执行的函数表达式就没有存在的必要了；
    - [ES5]
    window全局作用域
    函数执行形成的私有作用域
    - [ES6]
    除了有ES5中的两个作用域，ES6中新增加块级作用域(我们可以把块级作用域理解为之前学习的私有作用域，存在私有作用域和作用域链的一些机制)*ES6中把大部分用`{ }`包起来的都称之为块级作用域*;
:::

## JS中创建变量的方式汇总
::: tip [ES5]
`var` ：创建变量
`function`：创建函数
ES5中创建变量或者函数：存在变量提升，可重复声明等特征；
:::
::: tip [ES6]
`let`创建变量
`const`：ES6中创建常量
ES6中创建的变量或者常量：都不存在变量提升，也不可以重复声明，而且还存在块级作用域；
`class`：创建一个类（创建的类只能用来new不能当做普通函数执行）
`import`：导入
:::
## ES6中的解构赋值
>按照原有值的结构，把原有值中的某一部分内容快速获取到(快速赋值给一个变量)
### 数组的解构赋值
::: tip 数组解构
解构赋值本身是ES6的语法规范，使用什么关键字来声明这些变量是无所谓的，如果不用关键字来声明，那么就相当于给window添加的自定义属性；(严格模式下必须使用关键字来声明，因为严格模式下不允许出现不用关键字声明的变量;)，如果解构不到值，那么变量的值就是`undefined`；
```js
let [a,b,c]=[12,23,34];
var [d,e,f]=[35,41,63];
console.log(a,b,c)//12,23,34;
console.log(d,e,f)//35,41,63;
[q,w,e]=[1,2,3];//相当于给window添加了三个属性:q,w,e值分别为1，2，3；(严格模式下会报错)
```
多维数组的解构赋值，可以让我们快速的获取到需要的结果
```js
let [a,b,c]=[[45,36],12,[23,43,[1,2[4,[8]]]]23,34];
console.log(a)//[45,36]
console.log(b)//12
console.log(c)//[23,43,[1,2,[4,[8]]]]
// 数组中不需要解构的值可用逗号（，）空开，一个逗号代表空开一项
let [,,,A]=[12,23,45];
console.log(A)// undefined
let [,,B]=[12,23,45]
console.log(B)// 45
```
在解构赋值中，支持扩展运算符即`...`,只要用了扩展运算符，就相当于新生成了一个数组或者对象，如果解构不到值的话，新生成的数组或者对象为空，而不是undefined，但是扩展运算符必须放在末尾
```js
let [a,...c]=[12,1,4,83,34];
console.log(a)//12
console.log(c)//[1,4,83,34];
let [a,...b,c]=[12,1,4,83,34];//会报错，扩展运算符只能放在末尾；
```
:::
### 对象的解构赋值
::: tip 对象解构
对象的简洁表示法：
```js
const foo = 'bar';
const baz = {foo};
baz // {foo: "bar"}
// 等同于
const baz = {foo: foo};
```
对象的解构与数组有一个重要的不同。数组的元素是按次序排列的，变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名，才能取到正确的值。
```js
let { foo, bar } = { foo: "aaa", bar: "bbb" };
foo // "aaa"
bar // "bbb"

// 如果变量名与属性名不一致，必须写成下面这样。
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"
// 真正被赋值的是后者，而不是前者。
let obj = { first: 'hello', last: 'world' };
let { first: f, last: l } = obj;
f // 'hello'
l // 'world'
first//error: first is not defined

// 如果要将一个已经声明的变量用于解构赋值，必须非常小心。
// 错误的写法
let x;
{x} = {x: 1};//会报错
// 因为 js 引擎会将{x}理解成一个代码块，从而发生语法错误。只有不将大括号写在行首，避免 js 将其解释为代码块，才能解决这个问题。
 // 正确的写法
let x;
({x} = {x: 1});
// 放在圆括号当中就可以避免 js 将其解释为代码块。
```
解构赋值中支持指定默认值
```js
let [foo = true] = [];
console.log(foo);// true

let [x, y = 'b'] = ['a']; // x='a', y='b'
let [x, y = 'b'] = ['a', undefined]; // x='a', y='b'

var {x: y = 3} = {};
y // 3

var {x: y = 3} = {x: 5};
y // 5
```
:::
### 解构赋值的作用
::: tip 作用
1、快速交换两个变量的值
```js
let a=12;
let b=13;
[a,b]=[b,a];
console.log(a);//13
console.log(b);//12
```
2、可以接收函数返回的多个值
```js
let fn = function () {
  let a = 12,
      b = 13,
      c = 14;
  return [a, b, c];
};
let [a,b,c] = fn();
console.log(a, b, c);//=>12 13 14
```
:::
## `...` 的三种身份：扩展运算符、展开运算符、剩余运算符
```js
// 1、扩展运算符(注意，在解构赋值中，叫做扩展运算符，只能放在末尾)
// 只要用了扩展运算符，就相当于新生成了一个数组或者对象，如果解构不到值的话，新生成的数组或者对象为空，而不是undefined，但是扩展运算符必须放在末尾
//  数组中的扩展运算符
let [a,b,...c]=[12,1,4,83,34]
console.log(a);//12
console.log(b);//1
console.log(c);//[4,83,34]
对象中的扩展运算符
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
console.log(x);//1
console.log(y );//2
console.log(z );//{ a: 3, b: 4 }
//  2、剩余运算符
function(...arg){
  // ...arg就相当于剩余运算符，可以把传递的所有参数都获取到，而且获取到的是一个数组
}
//  3、展开运算符
function fn1(){
  
}
function fn2(){
  fn1(...arguments)
  // ...arguments:这里的...就相当于展开运算符，把arguments展开，把里面的每一项分别传递给fn1当作参数，然后让fn1执行；
}
```
## 箭头函数
::: tip
```js
/* 
  两种写法：1、表达式   2、函数体
  表达式：
  1.let fn=p=>p; 等价于 var fn=function(p){return p};
  2.let fn=()=>n; 等价于 var fn=funciton(){return n};
  3.let fn=(n,m)=>n+m;等价于 var fn=function(n,m){return n+m}; 
*/
//  函数体：
let fn=（n,m）=>{
	var total=n+m;
	return total;
}
```
1、箭头函数中不支持arguments,但是用  剩余运算`...arg` 代替了`arguments`，`arg`是一个数组，可以直接使用数组方法
```js
let obj={
  name:'obj',
  fn(){
  //此方法的属性名为fn，属性值为一个函数，和下面的sum写法是一样的；
  },
  sum:function () {

  }
};
let fn = (...arg)=> {
  console.log(arguments);//=>Uncaught ReferenceError: arguments is not defined
  // =>不支持arguments,我们使用ES6中的剩余运算符...来获取传递进来的所有参数值（优势:使用剩余运算符接收到的结果本身就是一个数组，不需要再转换了）
  console.log(arg instanceof Array);//=>true
  return eval(arg.join('+'));
};
//=>也可以把FN简写成以下方式
//let fn = (...arg)=> eval(arg.join('+'));
console.log(fn(10, 20, 30, 40));
```
2、箭头函数中的`this`问题，可以默认为箭头函数中没有this，在箭头函数中出现的this都是宿主环境中(即上级定义域中)的this，与箭头函数点之前的执行主体没有任何关系；
3、箭头函数不能当做构造函数来new。
4、箭头函数中的`this`无法通过`bind`方法来改变，箭头函数中的this已经在定义的时候被设为了宿主环境中的this，所以在使用bind的时候会被忽略掉；
:::

## ES6中的类和继承
>ES6中创建类和实例用class，创建出来的类不存在变量提升；
>
>ES5中创建类和实例，以及如何禁止用户把类当做普通函数执行：`new.target`
>
>在普通的函数调用中（和作为构造函数来调用相对），`new.target`的值是`undefined`。这使得你可以检测一个函数是否是作为构造函数通过new被调用的。
```js
function Foo() {
  if (!new.target) throw "Foo() must be called with new";
  console.log("Foo instantiated with new");
}

Foo(); // throws "Foo() must be called with new"
new Foo(); // logs "Foo instantiated with new"
```
```js
class Father {//定义一个类；
  constructor(name, age) {//构造函数定义实例的私有属性
    this.name = name;
    this.age = age;
  }

  getName() {//公有的函数和方法
    console.log(this.name + "的年龄是" + this.age + "岁了");
  }

  static like() {//static后面写的是把Father当做对象时的私有属性
    console.log("我是Father函数的私有属性")
  }
}

class Son extends Father {//子类Son继承父类Father
  constructor(name, age, color) {
    super(name, age);//继承父类的私有属性，必须写
//下面为子类的私有属性
    this.color = color;
    super当作对象调用时，super就相当于父类的原型
  }

//下面为子类公有的方法
  getColor() {
    console.log(this.color)
  }
}
```
>ES6继承用babel转为ES5
```js
// ES6
class MyDate extends Date {
  constructor(){
    super()
  }
}

// 转为ES5
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _wrapNativeSuper(Class) {
  function Wrapper() {
    // 返回的是父类的实例，只不过实例的__proto__改变了指向，指向了子类的原型
    return _construct(Class, arguments, _getPrototypeOf(this).constructor);
  }
  // Wrapper.apply(this, arguments) || this
  Wrapper.prototype = Object.create(Class.prototype, {
    constructor: {
      value: Wrapper,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  // 返回的是修改了__proto__后的Wrapper (Wrapper.__proto__ = Class)
  return _setPrototypeOf(Wrapper, Class);
}
// 创建父类的实例，并把实例的__proto__指向子类的原型，最后返回实例
function _construct(Parent, args, Class) {
  _construct = function _construct(Parent, args, Class) {
    var a = [null];
    a.push.apply(a, args);
    var Constructor = Function.bind.apply(Parent, a);
    // 先生成父类的实例
    var instance = new Constructor();
    // 再让父类实例的__proto__ 指向子类的原型
    if (Class) _setPrototypeOf(instance, Class.prototype);
    // 最后返回父类的实例
    return instance;
  };
  return _construct.apply(null, arguments);
}

function _setPrototypeOf(o, p) {
  o.__proto__ = p;
  return o;
};

function _getPrototypeOf(o) {
  return o.__proto__;
};

var MyDate = /*#__PURE__*/ function (_Date) {
  "use strict";

  _inheritsLoose(MyDate, _Date);

  function MyDate() {
    return _Date.apply(this, arguments) || this;
  }

  return MyDate;
}(_wrapNativeSuper(Date));
```
>用ES5模拟ES6继承
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
## 字符串中新增加的方法
>### 字符串`.includes(val)`：
>返回布尔值，字符串中是否包含val所代表的字符串；
>### 字符串`.startsWith(val)`：
>`val`是否在字符串的起始位置。
>### 字符串`.endsWith(val) `：
>val是否在字符串的尾部。

>三个方法都返回一个布尔值
```js
let s = 'Hello world!';
s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true
  
//  这三个方法都支持第二个参数，表示开始搜索的位置。
let s = 'Hello world!';
s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
//  上面代码表示，使用第二个参数n时，endsWith的行为与其他两个方法有所不同。它 针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。
```
>### 字符串`.repeat()`：返回一个新字符串，表示将原字符串重复n次。
```js
'x'.repeat(3) // "xxx"
'hello'.repeat(2) // "hellohello"
'na'.repeat(0) // ""	
```

### 模版字符串
>模版字符串，也是字符串，可以直接使用字符串中的方法；
>
>模版字符串的空格和换行，都是被保留的，如果想要消除空格可以使用trim方法；
```js
$('#list').html(`
  <ul>
    <li>first</li>
    <li>second</li>
  </ul>
  `.trim());
```
>模版字符串中可以嵌入变量，需要将变量写在`${}`中，大括号内部可以放入任意的 js 表达式，可以进行运算，以及引用对象属性。
```js
let x = 1;
let y = 2;
`${x} + ${y} = ${x + y}`
// "1 + 2 = 3"
`${x} + ${y * 2} = ${x + y * 2}`
// "1 + 4 = 5"
let obj = {x: 1, y: 2};
`${obj.x + obj.y}` // "3"
```
> 模板字符串之中还能调用函数。
```js
function fn() {
  return "Hello World";
}
`foo ${fn()} bar`
// foo Hello World bar
```
## ES6中新增加的迭代 `for of`
::: tip `forEach、for、for in、for of`的区别
*forEach*：不支持返回值，只是普通的循环遍历
*for in*：key输出的值为字符串类型，包括把数组当成对象添加的属性也可以遍历出来
*Object.keys()*：方法会返回一个由一个给定对象的*自身可枚举属性* 的属性名组成的数组，数组中属性名的排列顺序和使用 `for...in` 循环遍历该对象时返回的顺序一致 （两者的主要区别是 ：`for-in` 循环还会枚举其原型链上的属性）。
*for of：只返回具有数字索引的属性。这一点跟for...in循环也不一样。*（不能遍历对象）
```js
let arr = [3, 5, 7];
arr.foo = 'hello';

for (let i in arr) {
//for in是把arr当成对象遍历，i是属性名，包括arr的私有属性
  console.log(i); // "0", "1", "2", "foo"
}

for (let i of arr) {
//for of是把arr当成数组遍历，i是数组中的每一项
  console.log(i); //  "3", "5", "7"
}
for of循环不会返回数组arr的foo属性
如果只想拿到索引，可用keys()方法
for (let index of arr.keys()) {
  console.log(index);
}
// 0
// 1
// 2
如果两个都想拿到，可用entries()方法
for (let (index, elem) of arr.entries['ɛntrɪs]()) {
  console.log(index, elem);
}
// 0 "3"
// 1 "5"
// 2 "7"
```
:::
## ES6中的Set数据结构
>ES6提供了新的数据结构Set，是 **`类数组`** 结构，但是成员的值都是唯一的，没有重复的值；
>
>set加入值的时候，不会发生类型转换。Set内部判断两个值是否不同，类似于`===`，主要区别是向Set加入值时认为NaN等于自身，
>
>`WeakSet`结构与Set类似，也是不重复的集合，但是它与Set有两个区别:
>
>- 1、`WeakSet`的成员只能是对象，而不能是其他类型的值；
>- 2、其次，`WeakSet`中的对象都是弱引用的，即垃圾回收机制不考虑`WeakSet`对该对象的引用。

## ES6中的Map数据结构
>Map是一种 **`类似于对象`** 的结构，也是键值对的集合，但是键的范围不限于字符串，各种类型的值都可以当做自键。
>
>`WeakMap`结构与Map类似，也是不重复的集合，但是它与Map有两个区别:
>
>- 1、`WeakMap`只接受对象作为键名（`null`除外），不接受其他类型的值作为键名。
>- 2、其次，`WeakMap`中的对象都是弱引用的，即垃圾回收机制不考虑`WeakMap`对该对象的引用。
## ES6中的模块导入和导出
```js
//=>A模块（在A模块中导入B模块）
import Temp,{lib} from "./B";//=>把导入的Temp中的部分属性方法进行解构赋值
new Temp().init();
lib();//=>Temp.lib()
//=>B模块(导出)
export default class Temp {
  init() {
      console.log(`hello world`);
  }
  static lib(){//=>Temp.lib
  }
}
```