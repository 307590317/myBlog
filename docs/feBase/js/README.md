---
title: 常用基础知识总结
sidebarDepth: 0
---
[[toc]]

# 常用基础知识总结

http://static.kancloud.cn/jschentt/js-interview-essentials/2510316

## 1、 `background` 中的 `url` 后面要加空格隔开不然 `IE` 下不显示
## 2、处理 `IE7` 下 `li` 元素之间有间隔的问题
>不给li元素设置宽度，给li元素下的子元素设置宽度，撑开li元素即可
## 3、 `inline-block` 元素间产生空白问题
>行内元素在排版的时候，元素之间的空白字符（空格、回车、换行等）都会被浏览器处理，根据css中`white-space`属性的处理方式（默认为`normal`，忽略文本开头、结尾及换行符前面的空白符，并把换行符转换为空格，如果有多个连续的空白符，会合并多余空白符为一个），原来HTML代码中的回车换行被合并成一个空白符，在字体大小不为0的情况下，空白符占据一定宽度，所以inline-block的元素之间就出现了空隙。

::: tip `去除inline-block元素间间距的N种方法`
- 1.删除Html中的换行或者空格
- 2.用Html注释代替换行
- 3.使用margin负值（由于外部环境不确定，此方法不适合大规模使用）
- 4.给其父元素设置`font-size:0; -webkit-text-size-adjust:none;`（兼容谷歌浏览器）,在子元素上设置正确的`font-size`
- 5、给子元素设置 `float:left`;
:::
## 4、单行省略与多行省略
>单行省略
```css
.singleOut{
	overflow:hidden;
	text-overflow:ellipsis;
	white-space:nowrap;
}
```
>多行省略（仅支持webkit）
```css
.morelineOut{
	overflow:hidden;
	display:-webkit-box;
	-webkit-line-clamp:2;(最后一行行号)
	-webkit-box-orient:vertical;
}
```
## 5、清除浮动
::: tip 
- 1、额外标签法：在父元素末尾插入额外标签并令其清除浮动（clear）以撑大父容器方法浏览器兼容性好，没有什么问题，缺点就是需要额外的（而且通常是无语义的）标签。
- 2、使用after伪类   
```css
#box:after{ 
	content:"";
	visibility:hidden; 
	display:block; 
	clear:both;
	height:0;
	font-size:0;
}
这种方法兼容性一般，但经过各种 hack 也可以应付不同浏览器了，同时又可以保证html比较干净，所以用得还是比较多的。（注意：作用于浮动元素的父亲）
```
- 3、设置父元素overflow为hidden或者auto这种做法就是将父容器的overflow设为hidden或auto就可以在标准兼容浏览器中闭合浮动元素.如无特殊情况，一般推荐使用hidden属性。
- 4、浮动外部元素，float-in-float 这种做法就是让父容器也浮动成员访问".">new(带参数)>函数调用"()"
:::
## 6、因为键名称只能是字符串，b/c单作建会调用toString得到的都是[object Object]，a[b],a[c]都等价于a["[object Object]"]，那就是更新[object Object]这个键的值了,所以对象中调用对象属性会得到  对象[[object Object]]
## 7、盒子模型的区别（w3c盒子模型和IE怪异盒子模型）
>w3c盒模型的`width`不包含`padding`和`border`，IE怪异盒子模型的`width`包含`padding`和`border`；
## 8、ie5.5之后已经不支持document.body.scrollX对象了
## 9、对`(function(window,undefined){})(window)`的理解？
>A：这是jquery最外层代码，(function(window,undefined){})是内层表达式，返回值是函数，
		而(function(window,undefined){})()是一个立即执行的匿名函数
Q:为什么传window，后面不传undefined？
		A:传window是为了速度，加快内部查找的速度
   		不传undefined是为了安全， IE,FF低版本，undefined可以赋值
   		声明了又不传值的话，值肯定是undefined，所以外界影响不了了

## 10、图片懒加载的目的
>减少第一次打开时候，请求资源的次数，让页面加载速度更快（打开页面的速度更快）
## 11、text-indent：用于定义块级元素中第一行的文本缩进；
## 12、纯CSS隐藏滚动条（依然可以滚动）
```css
&::-webkit-scrollbar{
  background-color:transparent;
  width: 0px;
}
::webkit-scrollbar   //1 滚动条整体部分，其中的属性有width,height,background,border（就和一个块级元素一样）等。
::webkit-scrollbar-button //2 滚动条两端的按钮。可以用display:none让其不显示，也可以添加背景图片，颜色改变显示效果。
::webkit-scrollbar-track   //3  外层轨道。可以用display:none让其不显示，也可以添加背景图片，颜色改变显示效果。
::webkit-scrollbar-track-piece //4  内层轨道，滚动条中间部分（除去）。
::webkit-scrollbar-thumb  //5  滚动条里面可以拖动的那部分
::webkit-scrollbar-corner  //6  边角
::webkit-resizer  //7   定义右下角拖动块的样式
原文：https://blog.csdn.net/github_36487770/article/details/78750589 
```
## 13、IOS滑动平滑属性
> `-webkit-overflow-scrolling : touch; `
## 14、padding-bottom在火狐浏览器下不生效的解决方案：
>就是说，一旦我们给box设置了`overflow`属性，`overflow`就会规定，如果超出了自身内容大小，就会规定是否需要剪裁到它的`padding edge`
		因此，在火狐和IE浏览器看起来似乎更加符合规范。这个题目上，class为.div2的节点的内容超出了自身的高度，此时设置了`overflow: auto`，因此`overflow`属性会将超出的部分剪裁到padding edge，所以会出现`padding-bottom`失效的问题
		而在Chrome和Opera下，当.div2这个节点的内容超出了自身的高度时，设置`overflow: auto`会将超出的部分剪裁到content edge，而不是padding edge。因此我们仍然可以看到`padding-bottom`的值
		解决方案：而在Chrome和Opera下，当.div2这个节点的内容超出了自身的高度时，设置`overflow: auto`会将超出的部分剪裁到content edge，而不是padding edge。因此我们仍然可以看到`padding-bottom`的值
## 15、Sortable与VUE结合的坑
> https://www.jianshu.com/p/d92b9efe3e6a
## 16、Chrome 中文界面下默认会将小于 12px 的文本强制按照 12px 显示,
>可通过加入 CSS 属性 `-webkit-text-size-adjust: none;` 解决。
## 17、PC检测、手机机型检测
```js
var isPc = /mobile|android|iphone|ipad|phone/i.test(navigator.userAgent)

var isWeixin = /MicroMessenger/i.test(navigator.userAgent);
var isiPhone = /iPhone|iPod/i.test(navigator.userAgent);
var isiPad = /iPad/i.test(navigator.userAgent);
var isAndroid = /Android/i.test(navigator.userAgent);
var isWeibo = /Weibo/i.test(navigator.userAgent);
var isIOS = (isiPad || isiPhone);
```