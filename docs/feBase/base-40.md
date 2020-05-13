---
title: 40、水平垂直居中
sidebarDepth: 0
---
[[toc]]
# 40、水平垂直居中

## 水平居中
### 1、行内元素
>若是行内元素，给其父元素加`text-align:center;` 即可实现水平居中
```css
.parent{
  text-align: center;
}
.child{
	display: inline-block;
}
```
### 2、块级元素
>若是块级元素，该元素设置 `margin:0 auto` 即可
### 3、子元素包含 `float:left` 属性
>若子元素带有浮动属性，为了让子元素水平居中，则可让父元素宽度设置为`fit-content`,并且配合`marin`即可实现居中。
>
>(`fit-content`是`CSS3`中给`width`属性新加的一个属性值,它配合`margin`可以轻松实现水平居中, 目前只支持`Chrome` 和 `Firefox`浏览器.)
```css
.parent{
  width: -moz-fit-content;
  width: -webkit-fit-content;
  width: fit-content;
  margin: 0 auto;
}
```
### 4、使用 `flex`
>使用`flex`布局，可以轻松的实现水平居中, 子元素设置如下
```css
.son{
	display: flex;
  justify-content: center;
}
```
### 5、使用CSS3新增的 `transform` 属性，子元素设置如下
```css
.son{
	position:absolute;
	left:50%;
	transform:translateX(-50%);
}
```
### 6、使用绝对定位
```css
.son{
	//未知宽高
	position:absolute;
	left:0;
	top:0;
	right:0;
	bottom:0;
	margin: auto;
	
	//知道宽高
	position:absolute;
	left:50%;
	width:200px;
	margin-left:-100px;
}
```
## 垂直居中
### 1、元素高度不定
>table-cell配合vertical-align
>优点：元素高度可以动态改变，不需要在CSS中定义
```css
.parent{
   display: table;
}
.son{
	display:table-cell;
	vertical-align:middle;
}
```
### 2、使用 `flex` 布局
>`flex` 2012版
```css

.parent{
	display:flex;
	align-items:center;
}
```
>`flex`2009版（不支持IE）
```css
.parent{
	display:box;
	box-orient:vertical;
	box-pack:center;
}
```
### 3、使用 `transform`
```css
.son{
	position:absolute;
	top:50%;
	transform:translateY(-50%);
}
```
### 4、使用绝对定位
```css
.son{
	//高度固定
	position:absolute;
	top:50%;
	height:500px;
	margin-top:-250px;
	
	//高度不固定
	position:absolute;
	top:0;
	left:0;
	right:0;
	bottom:0;
	margin:auto;
}
```

## 用JS方法实现
```js
	//首先让盒子先绝对定位，然后设置盒子的left和top值即可
	left = (当前浏览器窗口的宽度-内容的宽度)/2+'px'
	left = ((document.documentElement.clientWidth || document.body.clientWidth)-ele.offsetWidth)/2+'px'
	top = (当前浏览器窗口的高度-内容的高度)/2+'px'
	top = ((document.documentElement.clientHeight || document.body.clientHeight)-ele.offsetHeight)/2+'px'
```