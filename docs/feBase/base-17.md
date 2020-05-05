---
title: 17、面向对象的理解与继承
sidebarDepth: 0
tags:
 - 面向对象与继承
---
[[toc]]
# 面向对象的理解与继承

## 面向对象编程
::: tip 面向对象
所谓面向对象就是基于对象的概念，以对象为中心，以类和继承为构造机制，来认识、理解、刻画客观世界和设计、构建相应的软件系统。
核心思想：类的继承、封装和多态
面向对象达到了三个主要目标：复用性、灵活性、扩展性 
应用：插件的封装，比如选项卡插件的封装，拖拽插件的封装，弹出层插件的封装
:::
### 类的封装
>把实现同一个功能的代码，封装在一个函数当中，以后再想实现这个功能，只需要执行这个方法即可，不需要重复的编写代码，减少了页面中的代码冗余度，提高了代码的重复利用率，实现了*低耦合高内聚*的思想
### 类的多态
::: tip 多态
一个类的多种形态：重载、重写；
*[重载]*
  方法名相同，参数不同，叫做方法的重载
  JS中没有严格意义上的重载，如果方法名相同，那么就会保留最后一个方法，和传递的参数没有关系；
  JS中的重载：根据传递的实参不同，来实现不同的功能。可以把这种方法叫做重载。
*[重写]*
  JS中的重写：子类重写父类的方法
:::
### 类的继承
>子类继承父类的一些属性和方法

#### 原型继承
::: tip 原理
让子类的原型指向父类的一个实例（很少单独使用）
```js
Son.prototype=new Parent();
// 继承父类之后，需要手动添加constructor属性
Son.prototype.constructor=Son;
```
*特点：* 它是把父类中私有+公有的属性和方法的都继承到了子类的原型上（子类公有的）
*核心：* 原型继承是让子类和父类之间增加了原型链的连接关系，以后子类的实例想要父类中的方法，需要利用原型链查找机制一级一级向上查找来使用

*原型继承存在的问题：*
- 1、子类的原型指向了父类的一个实例E，如果E的某个属性的值是引用数据类型，那么我生成子类的一个实例F，我通过F来重写E的这个引用数据类型的值，那么子类的其它实例也会受影响；（注意：如果值是基本数据类型的则不会受到干扰）
- 2、不能向父类的构造函数传递参数。如果父类给其实例定义的私有属性的值跟传入的参数有关系，那么子类继承过来之后，所有子类实例的公有属性的值都是一样的，
:::
#### call继承
::: tip 原理
把父类当作普通函数在子类中执行，修改函数中的this为子类的实例。
```js
function A(){
	this.x=100;
}
function B(){
//一般都把call继承放在子类函数体中的第一行,这样做的好处就是子类私有的可以替换掉继承过来的结果；
	A.call(this);
	this.y=200
}
```
*特点：* 把父类私有的属性和方法克隆一份一模一样的作为子类私有的属性（父类公有的无法继承）
:::
#### 寄生组合式继承(call继承+Object.create继承)
::: tip 总结
寄生组合式继承完成了一个需求
 - 子类公有继承了父类公有的
 - 子类私有继承了父类私有的
 - 而且子类还可以扩展自己的实例公有的属性和方法（扩展到创建的空对象上），而不影响到父类

`Object.create()`：创建一个空对象，并把传入的参数当作空对象的原型；
*原理：* 把父类当作函数在子类中执行，修改函数中的this为子类的实例。用Object.create()创建空对象，并把传入的参数当作空对象的原型，把子类的原型指向空对象的原型。
```js
function A(){
	this.x=100;
}
function B(){
	this.y=200
}
// 创建一个空对象，让传入的参数当作空对象的原型，然后让B的原型指向这个空对象;
B.prototype=Object.create(A.prototype);
// 为了保证构造函数的完整性，我们要给子类的原型手动设置constructor属性值
B.prototype.constructor=B;
// Object.create在IE低版本不兼容，所以我们要自己模拟一个create方法。
Object.myCreate=function(){
	var Fn=new Function();
	Fn.prototype=argument[0];
	return new Fn();
}
// 以下写法兼容所有浏览器;
B.prototype=Object.myCreate(A.prototype);
```
*特点：* 把父类私有的给子类私有，把父类公有的给子类公有。
:::
#### ES6中的类和继承
::: tip ES6中的继承相当于寄生组合式继承
```js
class Father{//定义一个类；
	constructor（name,age）{//构造函数定义实例的私有属性
		this.name=name;
		this.age=age;
	}
	getName(){//公有的函数和方法
		console.log(this.name,this.age);
	}
	static like(){//static后写Father当做对象时的私有属性
		console.log("我是Father函数的私有属性")
	}
}
class Son extends Father{//子类Son继承父类Father
	constructor(name,age,color){
	//注意：super()只能用在子类的构造函数之中，用在其他地方会报错
		super(name,age);//super中的参数相当于把父类当作普通函数执行时传递给普通函数的参数
	//下面为子类的私有属性
		this.color=color;
	}
	//下面为子类公有的方法
	getColor(){
		console.log(this.color)
	}
	static my(){//static后写的是把Son当做对象时的私有属性
		console.log("我是Son函数的私有属性")
	}
}
关于super的两种情况：
注意，使用super的时候，必须显式指定是作为函数、还是作为对象使用，否则会报错。
1、作为函数执行时：
  只能在子类的构造函数中第一行写super()，此时就相当于Father.call(this);否则会报错(比如在子类的公有方法中执行super);
2、作为普通对象调用时
	在子类的普通方法中(公有方法或私有方法)，super指向父类的原型，相当于Father.prototype，而通过super.getName(),getName方法中的this依然是子类的实例，而不是super。
	在子类的静态方法中（把子类当作对象添加的方法），指向父类。
	
```
:::
### 为什么要手动修改constructor？
::: tip
```js
var a,b;
(function(){
  function A (arg1,arg2) {
    this.a = 1;
    this.b=2; 
  }

  A.prototype.log = function () {
    console.log(this.a);
  }
  a = new A();
  b = new A();
})()
a.log();
// 1
b.log();
// 1
```
a,b，他们同为类A的实例。因为A在闭包里，所以现在我们是不能直接访问A的，那如果我想给类A增加新方法怎么办？
这个时候就可以通过a.constructor.prototype 来给其所属类添加公有的属性和方法了
:::