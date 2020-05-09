---
title: 28、移动端常用类库
sidebarDepth: 0
---
[[toc]]
# 28、移动端常用类库

## Zepto
::: tip
一个小型的，专门针对于移动端开发的JS类库，它的开发原理以及使用方式都非常接近于jq，所以很多人也把它称之为小型JQ
1、`zepto`不支持IE6-8,有一些方法连IE高版本都不支持，是专门为移动端准备的；
2、`zepto`只实现了部分JQ中常用的方法，有一些方法在`zepto`中无法使用，例如：JQ支持`animate、hide、show、slideDown、slideUp`……这些动画，但是`zepto`中只有`animate`，其他快捷动画不支持
`zepto`类库的体积比jQuery小很多
3、`zepto`中提供了移动端专用的事件操作方法，而jquery中没有；
- `tap`(点击)
- `singleTap`(单击)
- `doubleTap`(双击)
- `longTap`(长按)
- `swipe`(滑动)
- `swipeUp`(上滑)
- `swipeDown`(下滑)
- `swipeLeft`(左滑)
- `swipeRight`(右滑)...
- `pinchIn/Out`:放大缩小
```js
$('selector').tap(function(e){
  // 实现点击的时候要做什么事
  // e：手指事件对象 this：当前操作的元素
})
```
4、`zepto`中的`animate`支持`transform`变形，`jQuery`中是不支持的
```js
$('selector').stop().animate({
  top:100,
  rotate:'360deg'
},1000,'linear',function(){
})
```
:::
## Swiper
::: tip swiper其实是一个UI组件，目的就是解决移动
如果我们采用的滑动效果（`effect`）是3D的（`coverflow`），最好不要采用无缝衔接（loop：true），这块的处理是有bug的；
`zepto`中常用的属性：
```js
initialSlide:设定初始化时slide的索引。
direction:可设置滑动的方向：水平(horizontal)或垂直(vertical)。
speed:滑动一次所需要的时间
autoplay:自动轮播的时间间隔，不设置不会自动轮播
loop:设置为true 则开启无缝滚动模式
autoplayDisableOnInteraction:用户操作swiper之后，是否禁止自动轮播。默认为true：停止。
effect:切换效果。"slide"	位移切换(默认)
				"fade"  淡入
				"cube"  方块
				"coverflow"3d流
				"flip"  3d翻转
onlyExternal:值为true时，slide无法拖动
pagination:是否有分页器（如果需要，则需要给个标签类名），
	演示pagination:<div class="swiper-pagination"></div>
	pagination:'.swiper-pagination'
paginationType:分页器样式类型:'bullets'	圆点（默认）
							'fraction'  分式 
							'progress'  进度条
							'custom'    自定义
paginationClickable:设置为true时，点击分页器的指示点分页器会控制Swiper切换
prevButton:'.swiper-button-prev'(上一张图片的按钮)
nextButton:'.swiper-button-next'(下一个图片的按钮)
lazyLoading:设为true开启图片延迟加载,要将图片img标签的src改写成data-src，并且增加类名swiper-lazy。
lazyLoadingInPrevNext:设为true允许将延迟加载应用到最接近的slide的图片（前一个和后一个slide）。
```
:::