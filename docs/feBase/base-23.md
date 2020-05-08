---
title: 23、事件
sidebarDepth: 0
tags:
  - 事件
---
[[toc]]
# 事件
>事件是浏览器天生就赋予元素的行为，而不是通过代码添加给它的，当我们点击或者滑入滑出元素时，就已经触发了它的事件，只是我们没有给它赋予对应的操作而已；
## PC端常用事件
### 1、表单常用事件行为
```js
blur：失去焦点
focus：获取焦点
input：在 value 改变时触发
change：内容改变且失去焦点后触发
select：被选中事件
```
### 2、键盘常用事件行为
```js
keydown： 键盘按下
keyup：键盘抬起
keypress ：一直按着键盘而且文本框中有内容输入的时候才会触发；
```
### 3、鼠标常用事件行为
```js
click：点击
dblclick：双击(300ms内连续触发两次点击事件，即双击事件)
mouseover：鼠标滑过
mouseout：鼠标离开
mouseenter：鼠标进入
mouseleave：鼠标离开
mousemove：鼠标移动
mousedown：鼠标左键按下
mouseup：鼠标左键抬起
mousewheel：鼠标滚轮滚动(无冒泡传播)
```
### 4、其他常用事件行为
```js
load：加载成功
error：加载失败
scroll：滚动滚动条触发事件(无冒泡传播);
resize：window.onresize浏览器窗口的大小改变触发这个事件
```
## 移动端常用事件
### 移动端键盘事件
>移动端的键盘一般都是虚拟键盘，虽然部分手机存在`keydown/keyup`但是兼容不好，所以我们想用键盘事件的时候，使用input事件代替
>
>`box.oninput=function(){}`
### 移动端手指事件
::: tip
`click(单击)、load、scroll、blur、focus、change、input(代替keyup keydown)`

*移动端的click事件是单击事件，但是click事件会有300ms的延迟，如果在300毫秒之内有第二次点击，就不属于click了，没有触发第二次点击才属于click*(如何解决？不用click)
单手指事件：
```js
touchstart：手指按下
touchend：手指离开 
touchmove：手指在屏幕上滑动
touchcancel：意外取消
```
:::
## 事件绑定
>给元素的某一个事件绑定方法，目的是为了让当前元素的某个事件触发的时候，我们给它对应的操作；
>
>给元素的某一个事件绑定对应的方法，常用的有两种方法：
### DOM0级事件绑定
>`box.onclick=function(){}`;
>
>*浏览器把click这个事件行为挂载到了当前元素的onclick这个私有属性上,我们绑定对应的方法是在给对应的属性赋值，所以当click行为触发的时候，当前元素的onclick所对应的方法就可以执行*
### DOM2级事件绑定
::: tip DOM2
标准浏览器：
`box.addEventListener('click',function(){},false)`；
IE6-8：
`box.attachEvent('onclick',function(){})`;
*浏览器把click这个事件行为挂载到了内置的事件池所对应的事件类型上。我们可以通过addEventListener把click时需要执行的方法绑定到内置的事件池当中，当对应的事件行为触发的时候，浏览器会自动的到事件池中找到click类型下的方法来执行。*

`addEventListener`这个方法是定义在元素所属`EventTarget`这个类的原型上的;
:::
## 事件对象
>当元素的某一个事件行为触发，不仅会把对应的方法执行，而且浏览器还会默认的给这个方法传递一个值当作方法的参数，我们把传递的这个值称为*事件对象*
### 鼠标事件对象
::: tip
1、因为这个值是对象数据类型的值，里面存储了很多的属性名和属性值，这些是用来记录当前鼠标操作的相关信息的。如：鼠标位置、触发的行为类型、触发的事件源等
2、`MouseEvent`记录的是页面中唯一一个鼠标当前操作的相关信息，和到底是在哪个元素上触发的没有关系。

*标准浏览器：*

用`addEventListener`绑定方法：给所有方法中传递的`e(MouseEvent)`都是同一个对象，同一个内存地址，不同的是我们每次不同的操作都会重新获取同一个内存地址中不同的值；

*在IE6-8下*

用`attachEvent`绑定事方法：在给方法传递`window.event`之前，会先把`window.event`进行深拷贝一份，然后再传递给要执行的方法。所以我们每次操作重新获取的不是`window.event`中的值，而是拷贝后的`window.event`里面的值；

`MouseEvent`中的很多属性都是只读属性，只读属性只能拿来用，而不能赋值，如`e.clientX`，如果在标准浏览器中写`e.clientX=20`，不会报错，但是不起作用。下面的代码依然执行；但是在IE6-8下就会报错，下面的代码不再执行；

*注意*:
`MouseEvent`事件对象的获取在**标准浏览器**中是给方法传递的参数，我们只需要定义形参`e`就可以获取到。
如果用`DOM0`级事件绑定，在IE6-8下浏览器不会给方法传递参数，`e`的值为`undefined`，如过我们需要，则需要用`window.event`来获取。
如果用`DOM2`级事件绑定，在IE6-8下浏览器会给方法传递参数，`e`的值就是`window.event`；
`e.type`：存储的是当前鼠标触发的行为类型 
`e.clientX/e.clientY`:当前鼠标触发点距离当前窗口左上角的x/y轴的坐标值	
`e.pageX/e.pageY`:当前鼠标触发点距离body最左上角的x/y轴的坐标值	（IE6-8下没有这两个属性）
`e.target`：事件源（当前点击的那个元素），当前鼠标触发的是哪个元素，那么它存储的就是那个元素。（IE6-8下不兼容，我们用`e.srcElement`来获取事件源）
`e.preventDefault`:阻止浏览器的默认行为;（IE6-8下不兼容，用`e.returnValue=false`  或者直接在函数中`return false`都可以阻止默认行为
`e.stopPropagation:`阻止事件的冒泡传播。(IE6-8下不兼容，使用`e.cancelBubble=true`来代替）
```js
box.onclick = function(e){
	console.dir(e);
	e = e || window.event;
	e.target = e.target || e.srcElement;
	e.target // 事件源（当前点击的那个元素），当前鼠标触发的是哪个元素，那么它存储的就是那个元素。（IE6-8下不兼容，我们用e.srcElement来获取事件源）
	e.stopPropagation //  阻止事件的冒泡传播。(IE6-8下不兼容，使用e.cancelBubble=true来代替）
	e.type //  存储的是当前鼠标触发的行为类型 
	e.clientX/e.clientY //  当前鼠标触发点距离当前窗口左上角的x/y轴的坐标值	
	e.pageX/e.pageY //  当前鼠标触发点距离body最左上角的x/y轴的坐标值	（IE6-8下没有这两个属性，下面有解决方法）
	e.preventDefault //  阻止浏览器的默认行为;（IE6-8下不兼容，用e.returnValue=false  或者直接return false都可以阻止默认行为
}
// IE6-8不兼容处理
box.onclick=function(e){
	if(typeof e==='undefined'){
		//说明是IE6-8;
		//处理e使用IE6-8下的window.event
		e = window.event;
		//处理事件源
		e.target = e.srcElement
		//处理e.pageX和e.pageY
		e.pageX = e.clientX + (document.documentElement.scrollLeft||document.body.scrollLeft);
		e.pageY = e.clientY + (document.documentElement.scrollTop||document.body.scrollTop);
		//处理浏览器的默认行为
		e.preventDefault = function(){
			e.returnVaule = flase;
		}
		//处理冒泡传播
		e.stopPropagation = function(){
			e.cancelBubble = true;
		}
	}
}
```
:::
### 键盘事件对象
::: tip KeyboardEvent
`code`：当前键盘的按键名称(IE6-8下没有这个属性)；
`which`：和`keyCode`一样对应的也是键盘码的值（它不兼容IE6~8）
`e.keyCode`:当前键盘上的每一键对应的值（IE下只有这个）
空格（space）：32
回退（Backspace）：8
回车（Enter）：13
删除（Del）：46
四个方向键：左37 上 38 右39 下 40
<img :src="$withBase('/assets/base-23-1.png')" alt="base-23-1">
:::

### 移动端手指事件对象 
::: tip touches & changedTouches & targetTouches
存储的是当前屏幕上每一个手指操作的位置信息
`touches`：只有手指在屏幕上我们才可以获取对应的信息值（手指离开屏幕就没有相关信息了），这样就无法获取手指信息了；
`changedTouches`：手指在屏幕上的时候，和`touches`获取的信息一样，但是它可以记录手指离开屏幕一瞬间所在的位置信息（最常用）；
```js
TouchEvent
	type:'touchstart',
	target:事件源，
	touches:
		0:{
			clientX:xxx,
			clientY:xxx,
			pageX:xxx,
			pageY:xxx
		}
	length:1
```
移动端的click事件是单击事件，但是click事件会有300毫秒的延迟，如果在300毫秒之内有第二次点击，就不属于click了，没有触发第二次点击才属于click。
如何解决？
在移动端开发中，我们需要的一些操作(例如：点击、单击、双击、长按、滑动、左滑、右滑、上滑、下滑...)都是基于内置原生的`touchstart/touchmove/touched`事件模拟出来的效果
而多手指操作(如：旋转、缩放..)都是基于gesture事件模型模拟出来的效果
移动端事件库
- FastClick.js:解决CLICK事件300MS的延迟
- TOUCH.JS:百度云手势事件库 [https://github.com/Clouda-team/touch.code.baidu.com](https://github.com/Clouda-team/touch.code.baidu.com)
- HAMMER.JS
- Zepto.js:被誉为移动端的小型JQ<br>
	[https://github.com/madrobby/zepto.git](https://github.com/madrobby/zepto.git)<br>
	[http://www.bootcss.com/p/zeptojs/](http://www.bootcss.com/p/zeptojs/)<br>
	ZEPTO专门的准备了移动端常用的事件操作:<br>
  tap(点击)、singleTap(单击)、doubleTap(双击)、longTap(长按)、swipe(滑动)、swipeUp(上滑)、swipeDown(下滑)、swipeLeft(左滑)、swipeRight(右滑)...
:::

## A标签的默认行为及阻止
::: tip a标签的默认行为
- 1、超链接：点击a标签实现页面的跳转
- 2、锚点定位：通过`hash`值定位到当前页面(或其他页面)的指定ID元素的位置；
- 3、阻止a标签默认跳转行为
```html
<a href="javascript:;">阻止a标签的默认跳转行为</a>
<a href="javascript:void 0">阻止a标签的默认跳转行为</a>
```
如过a标签的`href`中有内容，那么点击a标签的时候，会先触发绑定的方法，再按`href`中的地址进行页面跳转
```html
<a href="www.baidu.com" id='link'>阻止a标签的默认跳转行为</a>
```
```js
link.onclick = function(){
	return false
}
```
:::
## DOM2级事件流的三个阶段
>### 1、捕获阶段：
>从外向里依次查找元素 ，查找到事件源为止，为截获事件提供了机会
>### 2、事件处理阶段：
>执行当前操作的事件源所对应的方法
>### 3、冒泡阶段：
>从内到外依次触发相关行为（我们常用的就是冒泡阶段），只能向上传播。
::: tip DOM2级事件流
当前元素的某个事件行为被触发，他所有的祖先元素（一直到`document`）的相关事件行为也会被依次触发（顺序从内向外），如果祖先元素的这个行为绑定了方法，绑定的方法也会被触发执行，我们把事件的这种传播机制叫做：冒泡传播；
<img :src="$withBase('/assets/base-23-2.png')" alt="base-23-2">

`mouseover` 和 `mouseenter`的区别
- `mouseover`：鼠标滑到元素上，*存在事件的冒泡传播机制*
- `mouseenter`：鼠标进入元素里面，*阻止了事件的冒泡传播机制*

鼠标从父元素进入到子元素
`mouseover`：先触发父元素的`mouseout`事件(因为鼠标已经不在父元素上了，`mouseover`本意是鼠标在元素上才算触发)，再触发子元素的`mouseover`，由于冒泡传播，还会触发父元素的`mouseover`事件

`mouseenter`：进入，从大盒子进入到小盒子，没有触发大盒子的`mouseleave`事件，但是触发了小盒子的`mouseenter`事件，浏览器阻止了它的冒泡传播，所以大盒子的`mouseenter`不会被触发；
:::
## 事件委托
::: tip 利用了事件的冒泡传播机制(触发当前元素的某个行为，它祖先元素的相关行为都会被触发)
如果一个容器中的很多元素都需要绑定点击事件，我们没有必要一个个的绑定，利用事件的冒泡传播机制，只需要给最外层容器绑定一个点击事件即可。在这个方法执行的时候，通过事件源的区分来进行不同的操作；

*好处*
- 1、事件委托性能比单独一个个绑定方法会提高50%；
- 2、可以给动态增加的元素也绑定事件

`jQuery`中除了`bind，on，click，mouseover`这些绑定事件的方式外，还提供了一种`delegate`（1.7以前用的是`live`）方法，我们用`delegate`方法完成`jQuery`中的事件委托；

`$menu.delegate('h3','click',function (e) {})`
第一个参数是选择器，第二个参数是触发事件，第三个参数是绑定的方法，传入的e为事件对象，`jQuery`中已经处理了e 的兼容问题；
`on`方法和`delegate`都可以实现事件委托，用`on `方法要自己判断事件源，`delegate`只是不需要判断事件源了而已；
:::