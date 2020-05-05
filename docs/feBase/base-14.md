---
title: 14、Js操作DOM的属性和方法
sidebarDepth: 0
---
[[toc]]
# Js操作DOM的属性和方法
>操作真实的DOM结构是比较消耗性能的(尽量减少)
## DOM的映射机制
>浏览器在渲染页面的时候，给每一个元素都设置很多内置的属性(包含样式的)，当我们在JS中把堆内存中的某些东西修改了，大部分情况下，浏览器都会检测到你的修改，按照最新的修改的值重新渲染页面中的元素。
## DOM的重绘和回流
### 重绘（repaint）针对某一个元素
::: tip
元素几何属性发生改变或者样式发生改变而不影响布局的称之为重绘。浏览器会把当前元素重新的进行渲染(DOM性能消耗低)
触发重绘的场景：
- color的修改
- text-decoration的修改
- background-color的修改
- a:hover也会造成重绘
- :hover引起的颜色等不导致回流的style变动
:::
### 回流(reflow)针对整个页面
::: tip
元素的布局或者几何属性需要改变，浏览器会把整个页面的DOM结构进行重新计算，计算出所有元素的最新位置，然后再渲染(DOM性能消耗非常大)
- 1、width/height/border/margin/padding的修改
- 2、动画，：hover等伪类引起的元素表现改动，display=none等造成页面回流
- 3、appendChild等DOM元素操作
- 4、font类style的修改
- 5、background的修改，部分background的修改只触发重绘，IE不用考虑
- 6、scroll页面，不可避免
- 7、resize页面，桌面版本进行浏览器大小的缩放。
- 8、读取元素属性(`offsetLeft、offsetTop、offsetHeight、offsetWidth、scrollTop/Left/Width/Height、clientTop/Left/Width/Height、getComputedStyle()、currentStyle(in IE)`);
:::
### 如何解决重绘和回流
::: tip 优化
```js
// 浏览器优化
offsetTop、offsetLeft、offsetWidth、offsetHeight
scrollTop、scrollLeft、scrollWidth、scrollHeight
clientTop、clientLeft、clientWidth、clientHeight
width、height
getComputedStyle()
getBoundingClientRect

// 所以，我们应该避免频繁的使用上述的属性，他们都会强制渲染刷新队列。

CSS:
/* 
  避免适用table布局；
  避免使用CSS表达式
  使用`transform`代替`top`
  使用`visibility`代替`display:none`；因为前者只会引起重绘，而后者会引发回流（布局改变）
  尽可能在 DOM 树末端通过改变 class 来修改元素的 style 属性：尽可能的减少受影响的 DOM 元素。
  避免设置多层内联样式，CSS选择器从右往左查找，避免节点层级过多；
  将动画效果应用到`postion：absolute`或`fixed`的元素上，这样只会重绘不会回流。 
*/

Javascrpit：
/* 
  避免频繁操作样式（可以使用文档碎片来批量添加DOM元素）
  避免频繁操作DOM
  避免频繁读取会引发重绘/回流的属性（若实在需要，就用变量缓存）
  对具有复杂动画的元素使用绝对定位使其脱离文档流；
*/
```
:::
### 获取节点
#### `document.getElementById()`
::: tip
在文档中通过元素的ID名来获取一个元素，只能通过document对象来调用，document属于Document类的一个实例，只有在Document类的原型上才有`getElementById`这个方法。
我们把document称之为上下文（context）：上文和下文，也就是获取元素时候限制的那个范围。
获取的结果是一个对象数据类型的值，在JS中使用DOM提供的方法，获取的元素都是对象，所以我们把获取的结果称之为 ‘元素对象’。
- 1.如果页面中的ID重复了，我们获取的结果是ID对应的第一个元素对象
- 2.在IE7及以下会把表单元素中的name属性值当做ID来使用；而且会忽略ID的大小写（项目中尽量不要让表单的`name`和其他元素的id相同）
- 3.我们如果把JS放在结构下面，我们可以直接使用ID值来获取这个元素（不需要通过`getElementById`来获取），而这种方式会把页面中所有ID为同一个的都获取到（只有一个的话获取的是元素对象，多个的话获取的是类数组集合）=>不推荐
*注意：不要让表单元素的name属性值和其他元素的id重复、不要用id的大小写来区分不同的元素*

不通过直接操作ID值的方式如何获取多个相同ID的元素?
```js
var allList=document.getElementsByTagName('*');
var ary=[];
for(var i=0;i<allList.length;i++){
	allList[i].id===xxx?ary.push(allList[i]):null
}
return ary;
```
:::
#### `context.getElementsByTagName()`
::: tip
在指定上下文中通过元素的标签名来获取子子孙孙元素中的一组元素，获取到的元素是类数组集合，通过索引来调用某一个
- 1、以数字作为属性名，每一个属性存储的都是获取到的每一个li，JS中我们把数字属性名叫做“索引”（索引是逐级递增的）
- 2、有一个length属性存储的是当前集合中LI的个数

具备以上的两个特点特别像数组，但是，它不是数组，所以我们把他称之为“类数组”
:::
#### `document.getElementsByName()`
::: tip
*在指定上下文中通过元素的name属性来获取一组元素（类数组：节点集合 NodeList）*
在IE浏览器下只对表单元素起作用
这个方法应用于获取具有同样name 的表单元素
:::
#### `context.getElementsByClassName()`
>通过元素的样式类名来获取（class值）一组元素，获取的也是一个类数组集合，通过索引来调用某一个；
>
>`getElementsByClassName()`是项目中最常用的一种方法，但是这个方法在IE6-8下不兼容

#### `document.documentElement()获取HTML元素`
#### `document.body：获取body元素`
### 在移动端获取元素常用的方法（IE6-8下不兼容）
#### `document.querySelector()`
>获取一个

#### `document.querySelectorAll()`
::: tip 获取多个
类数组集合(获取到的元素集合或节点集合不存在DOM映射，因为获取到的集合不是标准的`NodeList`，而是属于`StaticNodeList`(静态集合))
`document.querySelector("#tab")`;ID选择器
`document.querySelectorAll("#tab li ")`;// 层级选择器
`document.querySelectorAll("input[type='radio']")`; // 过虑选择器
:::
#### className:
>通过这个属性可以获取或者设置当前元素对象的样式类
#### innerHTML:
>通过这个属性可以获取或者设置元素里面的内容
#### innerText:
::: tip
通过这个属性可以设置或者获取元素里面的文本内容
火狐中不支持innerText属性，我们用textContent代替innerText
`innerHTML`与`innerText`的区别：
- `innerHTML`可以把增加内容中的HTML标签进行识别，innerText只能设置或者获取文本内容，不能识别HTML标签，HTML标签会被当作文本处理
:::

#### style属性：
>通过这个属性我们可以获取或者设置元素的样式（只能是元素的行内样式，获取或者设置都是，写在内嵌或者外链中的css样式无法获取到）

#### window.getComputStyle(元素，伪类)[属性值] || 元素.currentStyle[属性值]：

>获取当前元素经过浏览器计算的属性值，不管是写在哪的；

### 获取关系的属性

#### `childNodes`：获取所有的子节点
>获取当前元素的所有子节点（节点集合：类数组）
注：不仅是元素子节点，文本、注释等都会包含在内；子节点说明只是在儿子辈分中查找；

#### `childredn`：获取所有的元素子节点
::: tip
获取所有的元素子节点（元素集合）
在IE6-8下获取的结果和标准浏览器中有区别：会把注释节点当作元素节点获取到
:::
#### `parentNode`：获取元素的父亲节点（元素对象）
#### `previousSibling`：获取哥哥节点（包括文本或注释）
#### `nextSibling`：获取弟弟节点（包括文本或注释）
>IE6-8下不兼容
#### `previousElementSibling`：获取上一个元素节点
#### `nextElementSibling`：获取下一个元素节点
#### `firstChild`：获取所有子节点中的第一个
#### `lastChild`：获取所有子节点的最后一个
>firstElementChild/lastElementChild IE6-8下不兼容
### 节点类型
::: tip 节点类型
| 节点类型  |    nodeType | nodeName  | nodeValue |
| :--------: | :-------: | :-----------: | :--------: | 
|元素节点   |         1         |大写的标签名|     null     |
| 属性节点  |         2         |大写的属性名|属性值|
| 文本节点  |         3         |       #text     |文字内容|
| 注释节点  |         8         |   #comment |注释内容|
| document |         9         |  #document |null|
在标准浏览器下，我们把空格和回车都当成文本节点处理
ele.tagName:获取当前元素的标签名（获取的一般都是大写）,tagName只有元素节点才有；
:::
### `新建节点`
#### `document.createElement(元素标签)`: 动态创建一个元素节点
#### `document.createAttribute(元素属性)`: 动态创建一个属性节点
#### `document.createTextNode(文本内容)`: 动态创建一个文本节点
### `插入节点`
#### `appendChild()`：把元素添加到指定容器的末尾位置
>容器.appendChild（元素）
#### `insertBefore(a,b)`：把新的元素a，添加到老的元素b之前
>容器.insertBefore（a,b）
### `替换节点`
#### `replaceChild(a,b)`：用a元素来替换容器中的b元素
>容器.replcaeChild(a,b);
### `复制节点`
#### `cloneNode（true/false）`：克隆元素节点，true表示包括所有子节点，默认为false
>要克隆的元素.cloneNode（），无法克隆元素绑定的事件
### `删除节点`
#### `removerChild()`:从容器中删除指定元素
>容器.removeChild（元素）
### 属性操作
#### `getAttribute(元素属性名)`:获取元素节点中指定属性的属性值
>元素节点.getAttribute（元素属性名）
#### `setAttribute(元素属性名)`:设置或者改变元素节点的属性值（一般都是操作自定义属性）
>元素节点.setAttribute（属性名，属性值），可以设置自定义的属性，会修改html结构，直接在html中体现出来。用setAttribute设置的只能用getAttribute来获取，只能用removeAttribute来删除
>
>`注意:在IE6-8下无法修改和设置class属性`

#### `removeAttribute`(元素属性名):删除元素节点的属性
>元素节点.removeAttribute（属性名）

### `获取属性值的方式`
::: tip 设置或者获取自定义属性有xxx.属性名=属性值和 xxx.setAttribute(元素属性名)两种方式，有以下区别
1、xxx.属性名 结果体现在对象的属性上。与HTML结构无关。
2、xxx.setAttribute(属性名)  结果体现在DOM结构上，即在HTML结构中可以看到；
如果使用DOM的内置属性操作元素，那么元素就会被当作特殊对象，和HTML结构产生映射关系(即结果会呈现在HTML结构上)
:::