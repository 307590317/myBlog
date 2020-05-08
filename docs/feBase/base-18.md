---
title: 18、Js中的DOM盒子模型
sidebarDepth: 0
---
[[toc]]
# Js中的DOM盒子模型

## CSS中的盒子模型
::: tip css中的盒子模型有两种，分别是 
- ie 盒子模型
- 标准 w3c 盒子模型
:::
### w3c中的CSS盒子模型
::: tip 标准盒子模型
<img :src="$withBase('/assets/base-18-1.png')" alt="base-18-1">
width、height：不是盒子的宽高，而是盒子中内容的宽度和高度
盒子真正的宽=width+padding(left+right)+border(left/right);
:::

### CSS3盒子模型与IE中（IE8以下）的盒子模型
::: tip IE盒子模型
<img :src="$withBase('/assets/base-18-2.png')" alt="base-18-2">
width和height不仅仅是内容的宽度，而是代表整个盒子的宽度(已经包含了padding和border)，以后修改的padding或者border，只会影响盒子中内容的高度，盒子的大小不会改变
:::

### css3中的盒子模型属性 `box-sizing `
```css
box{
	box-sizing:border-box;
}
box-sizing的可能值:content-box（default），border-box,inherit(从父类继承)。
content-box: border和padding不计算入width之内，盒子的宽度=width+padding+border
border-box: border和padding计算入width之内，盒子的宽度=width
```
### 如何选择 *w3c盒子模型* ?
>在网页的顶部加上`<!DOCTYPE html>`声明。假如不加 doctype 声明，那么各个浏览器会根据自己的行为去理解网页，即 ie 浏览器会采用 ie 盒子模型去解释你的盒子，而火狐会采用标准 w3c 盒子模型解释你的盒子，所以网页在不同的浏览器中就显示的不一样了。如果加了 doctype 声明，那么所有浏览器都会采用标准 w3c 盒子模型去解释你的盒子，网页就能在各个浏览器中显示一致了。

## JS盒模型属性
>通过JS盒子模型属性获取到的结果都是不带单位的，而且只能是正 数（会默认的进行四舍五入），而且只有scrollTop和scrollLeft可读写，其他都是只读属性；

### `clientWidth、clientHeigit(内容宽度+padding)`
::: tip (只读属性，每次访问都会重新计算，最好用变量保存)
**`clientWidth`：内容宽度Width+左右填充padding**

**`clientHeight：`内容高度height+上下填充padding**

当前盒子可视区域的宽度和高度
可视区域：内容宽高+左右填充padding
和内容是否溢出，以及是否设置了overflow：hidden没有关系
```html
//获取当前浏览器可视窗口(一屏幕)的宽度
document.documentElement.clientWidth  || document.body.clientWidth
```
:::

### `clientTop、clientLeft(盒子边框的高度和宽度)`
::: tip
**`clientTop：`盒子上边框的宽度相当于border-top**

**`clientLeft：`盒子左边框的宽度相当于border-left**

获取的就是边框的宽度
:::
### `offsetWidth、offsetHeight(内容宽度+padding+border)`
::: tip 只读属性
**`offsetWidth：`盒子宽度+pading+border**

**`offsetHeight：`盒子高度+pading+border**

在`clientWidth`和`clientHeight`的基础上加上了左右或者上下边框的宽度，和内容是否溢出也没关系；
:::
### `offsetParent、offsetLeft、offsetTop`
::: tip
**`offsetParent：`当前元素的父级参照物（在同一个平面中，最外层的元素是里面所有元素的父级参照，和HTML层级结构没有必然的联系。一个页面中所有的父级参照物都是body。标准流中为body）**

*父级参照物可通过position： absolute relative fixed来改变；三个中任何一个都可以改变父级参照物，但是只能改变定位元素子元素的父级参照物，定位的元素的父级参照物不改变。*

**`offsetLeft：`当前元素距离其父级参照物的内边框的左偏移量 **

**`offsetTop：`当前元素距离其父级参照物的内边框的上偏移量**

在IE8当中，上述两个值是从当前元素的外边框距离其父级参照物的外边框的偏移量
:::
### `scrollWidth、scrollHeight、scrollTop、scrollLeft`
::: tip 
`scrollWidth、scrollHeight`
[没有内容溢出时]
- 获取的结果和`clientWidth`、`clientHeight`是一样的

[有内容溢出的时候]
- scrollHeight：真实内容高度+上填充padding(因为内容溢出下padding已经计算了所以不用加)
- scrollWidth：真实内容宽度+左填充padding(因为内容溢出右padding已经计算了所以不用加)
scrollLeft/scrollTop：横向或纵向滚动条卷去的宽度/高度(只有这两个可读写)
存在最大最小值：最小为0，最大为：真实内容的高度/宽度（scrollHeight）- 一屏幕的高度clientHeight

<img :src="$withBase('/assets/base-18-3.png')" alt="base-18-3">
:::
## 获取元素具体的样式值
::: tip
1、ele.style.xxx
- 获取当前元素所有写在行内样式上的值（只有写在行内样式上的才能获取到）

2、getComputedStyle/currentStyle（IE8及以下使用currentStyle）都带单位；
- getComputedStyle(ele，当前元素的伪类一般为null)，获取的是一个对象数据类型的值，如果需要获取某一项需要用点或者[]来访问获取结果的某个属性
- ele.currentStyle （currentStyle是元素的一个属性，而不是一个方法）获取结果也是对象数据类型的，获取某一项也要通过点或者[]来访问；

*通过getComputedStyle/currentStyle获取的结果都是字符串；*
:::
