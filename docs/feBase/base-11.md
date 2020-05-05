---
title: 11、数据类型检测与toString
sidebarDepth: 0
---
[[toc]]
# 11、数据类型检测与toString
## 1、`typeof value`
::: tip 检测一个值的类型：基本数据类型或者引用类型
检测当前值的数据类型，返回的结果：首先是一个字符串，其次字符串中包含了对应的数据类型  
*[TYPEOF局限]*
- 1、`typeof null`->"object" `null`为空对象指针 但是`null`不是对象数据类型；
- 2、不能具体细分是数组还是正则还是对象中的其他值，因为使用`typeof`检测数据类型对于对象数据类型的值返回的都是"object"
BAT面试题：
```js
console.log(typeof typeof []);
// typeof [] =>"object"
// typeof "object" =>"string"
```
:::
## 2、`A instanceof B`
::: tip 检测A实例是否属于B这个类（可以具体细分一个对象是数组还是正则）
A必须是对象数据类型，只要B在A的原型链上出现过，检测结果就是true；
*[instanceof局限性]*
- 1、不能用来检测和处理字面量方式创建出来的基本数据类型值；
  - 对于基本数据类型来说，字面量方式创建出来的结果和实例方式创建出来的结果是有一定区别的，从严格意义上来讲，只有实例创建出来的结果才是标准的对象，数据类型值也是标准的基本数据类型，也是标准的内置类的实例；对于字面量方式创建出来的结果是基本数据类型的值，不是严格的实例，但是由于JS的松散特点，导致了可以使用 内置类.prototype上提供的方法；
 
- 2、只要在原型链上能找到就返回true，所以在类的原型继承中，我们最后用instanceof检测出来的结果未必准确
:::
## 3、`constructor`
::: tip 获取当前实例所属类的构造函数的属性
与instanceof检测类似  可以处理基本数据类型的检测，一般检测不了object数据类型；
*[constructor局限性]*
- 1、我们可以把类的原型进行重写，在重写的过程中很有可能出现把之前的constructor给覆盖了，这样检测出来的结果就是不准确的
:::
## 4、`Object.prototype.toString.call().slice(8,-1)`
::: tip 最常用最准确的
借用`Object`基类原型上的`toString`方法，在执行这个方法的时候，让方法中的`this`指向需要检测的值，从而获取到当前值所属类的详细信息，进而检测出对应的数据类型
原理：`Object.prototype.toString`它的作用是返回当前方法的执行主体（方法中的`this`）所属类的详细信息
```js
var obj={name:"珠峰"};
console.log(obj.toString());// "[object Object]"  toString中的this是obj，返回的是obj所属类的信息
// 第一个 object 代表当前实例是对象数据类型的（固定的）
// 第二个 Object 代表的是obj所属的类是 Object
```
:::
## `toString`的理解:
::: tip toString
1、对于`Number、String、Boolean、Array、RegExp、Date、Function`原型上的`toString`方法都是把当前数据类型转换为字符串的类型（它们的作用仅仅是用来转换为字符串的）要把`Object`类型的值转换为字符串的话可以用`JSON.stringify(Object)`，例如`JSON.stringify({name："珠峰"})->{"name":"珠峰"}   `
2、`Object.prototype.toString`方法并不是用来转换为字符串的`({name："珠峰"}).toString()->"[object Object]"`

模拟内置`isArray`所写检测数据类型的方法：
```js
~function () {
  var obj = {
    isNumber: 'Number',
    isString: 'String',
    isBoolean: 'Boolean',
    isNull: 'Null',
    isUndefined: 'Undefined',
    isPlanObject: 'Object',
    isArray: 'Array',
    isRegExp: 'RegExp',
    isFunction: 'Function'
  };
  var check = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      //给check对象添加每个类的检测方法名和检测方法
      check[key] = (function (value) {
        return function (val) {
          return value===(Object.prototype.toString.call(val).slice(8,-1));
        }
      })(obj[key]);
    }
  }
  window.check = check;
}();
```