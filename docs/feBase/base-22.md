---
title: 22、JQ的语法、原理和实战
sidebarDepth: 0
---
[[toc]]
# 22、JQ的基础语法、核心原理和项目实战

## jQ的版本和下载
### jQuery版本
::: tip jQuery
1.x：兼容IE6-8，是目前PC端开发常用的类库。
2.x/3.x：不支持IE6-8，应用比较少，移动端开发用zepto.js

jQery常用版本
`jquery-1.9.3.js`<br>
`jquery-1.11.3.js`<br>
`jquery.min.js`
:::
### 下载JQ
::: tip 下载
官网下载：[http://jquery.com/](http://jquery.com/) 
GitHub：[https://github.com/jquery/jquery](https://github.com/jquery/jquery) 下载JQ的源码进行学习和分析 
看JQ的API手册：[http://jquery.cuishifeng.cn/](http://jquery.cuishifeng.cn/)
锋利的JQ第二版：对于JQ的基础知识和实战应用讲解的非常好
在npm中查看所有jQuery的版本号的命令 ：`npm view jquery versions`<br>
`npm install jquery` 是安装最新版本
如果我想要引入的是Jquery的1.7.2版本，则输入`npm intall jquery@1.7.2`
:::
## JQuery的核心原理解读(分析源代码)
::: tip 分析源代码
JQ是一个常用方法类库（常用dom库），提供了很多真实项目中需要使用的属性和方法（这些方法JQ已经帮我们完善了浏览器的兼容处理以及一些细节的优化）
jQuery本身是一个类
当我们在JS中执行
`$(selector，context)`<br>
`jQery(selector，context)` 
都是在创建一个JQ类的实例（`$ === jQuery`),这些实例都是一个类数组（我们把这个类数组称为jQuery对象），jQ的实例可以使用jQ原型上提供的公有的属性和方法；
```js
var jQuery=function(selector,context){
  return new jQuery.fn.init(selector, context);
};
//重构原型
jQuery.fn=jQuery.prototype={
  jquery: version,
  constructor: jQuery,
  ...
};
...
init = jQuery.fn.init=function(selector, context){
  if(typeof selector=="string"){
    ...
  }else if(selector.nodeType){
    ...
  }else if(jQuery.isFunction(selector)){
    ...
  }
  return jQuery.makeArray(selector,this );//=>返回的是一个类数组
}
init.prototype=jQuery.fn;
...
window.jQuery=window.$=jQuery;
```
项目中我们把`$()`称之为jQ的选择器，因为执行这个方法可以传递两个参数进去，通过`selector`我们可以获取到需要操作的DOM元素集合（jQ类数组集合），通过context可以获取到当前元素的上下文（不传递默认是document，如果传递，我们传递一个JS元素对象即可）；

`selector`支持三种格式：
传递的如果是个字符串，能够通过选择器获取到元素
传递的是个元素对象，它的意思是把`JS`原生对象转换为`JQ`对象
传递的是个函数，它代表等DOM结构加载完成再执行函数中对应的`JS`代码（类似于`window.onload`）
我们用`jQuery`获取的值一般都使用\$开头的变量名来存储（以后看见变量名是以\$开头的，我们就知道是JQ获取的实例，即JQ对象
`$()、jQuery()`对象获取的是一个类数组
- 第一个参数传递的如果是一个字符串，就是通过选择器获取到需要的元素集合（获取的都是类数组集合：如果没有获取到，结果就是一个空的集合，而不是`null`。通过原生的DOM方法获取JS原生对象获取不到的话，结果为`null`。）
<br>`$('.box a')`后代选择器<br>
`$('.box>a')`子代选择器
- 第一个参数传递的如果是个元素对象，就是把JS原生对象转化为JQ对象
- 第一个参数传递的如果是个函数
```js
$(function(){
  // 当页面中的DOM结构加载完成，就会执行回调函数中的JS代码
  // 类似于window.onload;等到页面中的DOM结构以及资源文件都加载完成才会执行对应的JS代码
})
$(document).ready(function(){
  // 这种写法和上面一模一样；
})
```
和window.onload有区别:
1、`$(function(){})`可以在同一个页面中使用多次，多次都生效（所以在使用JQ完成代码的时候，我们一般都会把代码放在回调函数中：首先不仅是等到结构加载完成再执行，而且还形成一个闭包）、
- 原理：
利用了DOM二级事件绑定（可以执行多次），监听的是`DOMContentLoaded`事件（DOM结构加载完成就会触发执行）

2、`window.onload`本身就是资源都加载完成才会执行，使用的是DOM零级事件绑定，在同一个页面中只能使用一次；
- `window.onload=function()`...
- `window.onload=function()`...
只留最后一个

JQ对象和原生JS对象的相互转化
```js
// ->把原生JS对象转化为JQ对象
var box = document.getElementById('box');
$box = $(box);//->$box存储的就是转化后的JQ对象

// ->把JQ对象转化为原生JS对象
var $body = $('body')
$body[0] // 获取集合中指定索引的原生JS对象（结果为原生JS对象）
$body.get(0) // 等价于$body[0]
$body.eq(0) // 获取指定索引的JQ对象（结果为JQ对象）
```
:::
### JQ既是一个类也是一个对象
>`jQuery.prototype`上设置了很多的属性和方法，这些是供JQ实例（DOM集合或者DOM元素）使用的属性和方法
```js
$('a').index() // 获取当前元素的索引(是在自己兄弟元素中的索引，它有几个兄弟元素，索引就是几)
$('body').data(key,value)  // 我们通过这个方法，可以获取到HTML结构上设置的data-xxx(前缀必须是data才可以用data方法获取到)的自定义属性的值
$('img').attr({src:"test.jpg",alt:"Test Image"}) // 设置或者批量设置或者获取当前元素的自定义属性（内置属性也可以）。如果是获取值，那么获取的值是字符串，如果需要用数值，则需要转化为number类型的；与removeAttr是一对。
//  设置的属性会在HTML结构上体现出来，attr的原理也是用内置的setAttribute来设置的；
$('.box').prop() // 和attr一样也是操作元素属性的，但是一般都操作表单元素的内置或者自定义属性  与removeProp是一对
$('.box').remove() // 从DOM中删除所有class名为box的元素。
$('.box').addClass('a') // 增加样式类
$('.box').removeClass('a') // 移除样式类
$('.box').toggleClass('a') // 当前样式有就移除，没有就添加
$('.box').html(val) // 不传val就是获取内容，传递了就是设置，每次都会把原有绑定的数据先当字符串拿出来，等价于innerHTML
$('input').val(value) // 表单元素value值的操作（设置或者获取）
$('input').css('width') // 设置或者批量设置或者获取元素的样式（获取的结果是带单位的）
offset() // 获取距离Body的偏移量
position() // 获取距离父级参照物的偏移
$(window).width() // 获取到当前浏览器一屏幕的宽度（获取一屏幕的宽度只能用这个）
$(window).height() // 获取到当前浏览器一屏幕的高度（获取一屏幕的高度只能用这个）
innerWidth()/innerHeight() // 等价于clientWidth/clientHeight
outerWidth()/outerHeight() // 等价于offsetWidth/offsetHeight
$('#box').on('click',function...) // JQ中的事件绑定
filter['fɪltə] // 同级过滤
children // 子代过滤器
  $('#box').children('.bg') // 等价于 $('#box>.bg')
find // 后代过滤器
  $('#box').find('.bg') // 等价于 $('#box .bg')
```
### JQ也是一个普通的对象
>在对象上也有一些自己的属性和方法（和实例没有任何的关系），这些都是工具类的方法
```js
	$.ajax({

	})
	$.each({
		
	})
```
### 引入多库 `$` 冲突的解决方法
```js
var j = $.noConflict()
// 如果当前项目中引入了两个类库，都是使用$操作，为了防止$使用权的冲突，JQ可以让$的使用权转让；此处返回的j就是代表原始$的变量，以后可以使用j()执行，使用jQuery()执行也可以；
var j = $.noConflict(true) // 参数代表深度转让，true代表深度转让，false代表只转让$的使用权，默认为false
// 深度转让，代表jQuery的使用权也转让出去了；
```
### each
::: tip jq中的each
jq中的`each`有两种，准确来说有三种
1、写在原型上的`each`：遍历JQ对象中的每一项
2、写在对象上的`each`：工具方法，可以用来遍历数组、类数组、对象等
```js
// 1、内置的each循环
$('a').addClass('sel') // => 相当于给每一个a都增加了sel这个样式类
$('a').css('width') // => 获取的时候只返回第一个元素的样式

// 2、原型上的each
$('a').each(function(index,item){
  // 参数传递顺序和原生JS中数组的forEach方法相反
  // index是当前遍历这一项的索引，item是当前遍历这一项的内容
  this // ->item当前遍历的这一项(原生JS对象)
})
// 3、jQ对象上的each方法
$.each([数组\类数组]，function(index,item){
  this // ->item;
})
$.each([对象]，function(key,value){
  this //->value;
  // JQ也是采用for in循环来遍历对象的，这样的话就可以把自己在原型上扩展的公有的属性和方法都遍历到；
})
```
:::
### extend
>`$.extend()`：把jQery当作一个对象扩展方法，这个操作一般是用来完善类库的
```js
//把jQuery当成一个对象扩展方法；
$.extend({	
	aa:function(){}		
});
$.aa();

```
>`$.fn.extend()`：把方法扩展到JQ的原型上，供JQ的实例使用，这个操作一般都是用来写JQ插件的
```js
//把jQuery当作构造函数，扩展到jQuery的原型上供它的实例使用；
$.fn.extend({
	bb:function(){
		this // ->这里的this是操作当前这个方法的JQ实例(JQ对象)，不需要再转换为JQ对象
	}
})
$('xxx').bb();
```
### animate
::: tip animate
JQ中提供了元素运动的动画库
`stop`：结束当前元素正在运行的动画，从当前位置继续执行下一个新动画；
`finish`：停止当前的动画并直接让元素运动到目标位置，从目标位置执行下一个动画。
`animate(target,duration,effect,callBack)`：
- `target`：目标值（是个对象）
- `duration`：多少毫秒完成
- `effect`：运动方式
- `callBack`：动画结束后做的事情

`show`<br>
`hide`<br>
`toggle`<br>
`fadeIn`<br>
`fadeOut`<br>
`fadeTo`<br>
`fadeToggle`<br>
`slideUp`<br>
`slideDown`<br>
`slideToggle`<br>
`delay`