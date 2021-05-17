---
title: React面试题
sidebarDepth: 0
---
[[toc]]
# 100道面试题

## React/Vue 在列表组件中写key的作用是什么？
::: tip key
```js
// 假设我们的列表元素数组数据如下
[1,2,3,4,5]

// v-for渲染出来后的虚拟DOM节点（Virtual Dom）
[
  '<div>1</div>', // id： A
  '<div>2</div>', // id:  B
  '<div>3</div>', // id:  C
  '<div>4</div>', // id:  D
  '<div>5</div>'  // id:  E
]

// 修改数据后
[3,2,4,6,7]

// v-for(不带key)渲染出来后的虚拟DOM节点（Virtual Dom）
[
  '<div>3</div>', // id： A
  '<div>2</div>', // id:  B
  '<div>4</div>', // id:  C
  '<div>6</div>', // id:  D
  '<div>7</div>'  // id:  E
]

// v-for(带有key)渲染出来后的虚拟DOM节点（Virtual Dom）
[
  '<div>3</div>', // id:  C
  '<div>2</div>', // id:  B
  '<div>4</div>', // id:  D
  '<div>6</div>', // id:  F
  '<div>7</div>'  // id:  G
]
```
不写`key`时，并且使用`简单的模板`时，可以更高效的复用节点(节点位置不变，节点内容改变)，这就是`就地复用`。
diff时，相比来说也是不带`key`更快，因为有`key`时，在增删节点上有耗时。
但是这种`就地复用`也是有副作用的：比如表单组件的复用问题，比如有状态组件复用问题。


`key`的作用是为了在数据变化的时候强制更新组件，消除`就地复用`组件带来的问题；在判断两个`VNode`是否为同类型时会调用`sameVnode`方法，会优先判断`key`是否相同

相关问题例子：拖拽排序导致的问题
在`vue`中使用`Sortable`拖拽排序，拖拽`table`中的`DOM`直接修改真实`DOM`的位置，然后在拖拽完成回调里修改`data`中的数据，就会出现`A`和`B`拖拽交换位置之后，我们也在回调里改完`data`中的数据之后，`A`和`B`又换了回去。
原因如下：
```js
// data中的数据
['A','B','C','D']

// 渲染成的真实DOM结构
[$A,$B,$C,$D]

// 数据对应的虚拟DOM结构
[
  {elm:$A,text:'A'},
  {elm:$B,text:'B'},
  {elm:$C,text:'C'},
  {elm:$D,text:'D'}
]

// 假设拖拽排序后真实DOM变为如下
[
  $B(内容展示'B'),
  $A(内容展示'A'),
  $C(内容展示'C'),
  $D(内容展示'D')
]

// 由于我们只改了真实DOM的位置，而虚拟DOM结构并没有改变依然是
[
  {elm:$A,text:'A'},
  {elm:$B,text:'B'},
  {elm:$C,text:'C'},
  {elm:$D,text:'D'}
]

// 此时我们把数据也按照拖拽后的顺序排列
['B','A','C','D']

// 这时，根据Diff算法，计算出的patch为，VNode的前两项是同类型的节点（sameVnode判断函数）可以直接复用节点，只修改内容，所以直接更新，将真实DOM $A中的内容更新为'B'，将真实DOM $B中的内容更新为'A'。
[
  {elm:$A,text:'B'},
  {elm:$B,text:'A'},
  {elm:$C,text:'C'},
  {elm:$D,text:'D'}
]

// 内容更新后，真实DOM就又变为了如下
[
  $B(内容展示'A'),
  $A(内容展示'B'),
  $C(内容展示'C'),
  $D(内容展示'D')
]
```
根本原因是虚拟DOM和真实DOM之间出现了不一致，而且在diff时节点又被直接复用，只更新了节点中的内容。
解决办法是通过给节点增加唯一的`key`值，添加`key`之后在判断两个VNode是否为同一类型时会调用`sameVnode`方法，如果都满足，则判定老的节点可以复用，通过`patchVnode`判断如何更新。
```js
function sameVnode (a, b) {
  return (
    a.key === b.key &&                    // 判断key
    a.tag === b.tag &&                    // 判断标签名称
    a.isComment === b.isComment &&        // 判断是否是注释
    isDef(a.data) === isDef(b.data) &&    // 判断节点上的class,attribute,style以及绑定的事件
    sameInputType(a, b)  // 判断如果是input标签，则继续判断input类型是否相同 typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
    // isTextInputType = val => { text:true, number:true, password:true, search:true, email:true, tel:true, url:true }[val]
  )
}
```
:::

## Recat 中 `setState` 更新（同步异步）
::: tip 
这里的异步代表的是多个`state`更新会合并到一起进行批量更新；

如果是由`React`引发的事件处理（比如`onClick`点击事件），调用`setState`不会同步更新`this.state`,除此之外的`setState`调用会同步更新`this.state`。所谓"除此之外"指的是绕过`React`通过原生的`addEventListener`直接添加的事件处理函数,还有通过`setTimeout/setInterval`产生的异步调用

在`React`的`setState`函数中，会根据一个变量`isBatchingUpdates`判断是直接更新`this.state`还是放在队列中等待批量更新，而`isBatchingUpdates`默认为false，表示`setState`会同步更新`this.state`，但是还有一个`batchedUpdates`函数，这个函数会把`isBatchingUpdates`改为true，而当`React`在调用事件处理函数之前就会先调用`batchedUpdates`，造成的后果，就是由`React`控制的事件处理过程`setState`不会同步更新`this.state`
:::
