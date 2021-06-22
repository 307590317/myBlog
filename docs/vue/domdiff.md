---
title: Vue DOMdiff(patch)源码解析
sidebarDepth: 0
---

[[toc]]

# Vue DOMdiff(patch)源码解析
::: tip diff
此篇主要讲了当数据发生变化之后，通过对比新旧虚拟节点`(vnode)`的`diff`算法，找到老的可复用节点，直接通过调整老的可复用节点进行最小化更新过程。
:::
```html
<div id="app">
  <li>{{msg}}</li>
</div>

<script>
  const vm = new Vue({
    el: "#app",
    data: {
      msg: `hello mrzhao`
    }
  })
  setTimeout(() => {
    vm.msg = "hello world";
  }, 1000);
</script>
```

## 更新patch方法

```js
// src/vdom/patch.js

// patch用来渲染和更新视图
export function patch(oldVnode, vnode) {
  // 对于组件是没有 oldVnode的
  if (!oldVnode) {
    return createElm(vnode); // 如果没有el元素，那就直接根据虚拟节点返回真实节点
  }
  if (oldVnode.nodeType == 1) { // 首次渲染的逻辑
    const oldElm = oldVnode; 
    const parentElm = oldElm.parentNode;
    let el = createElm(vnode);
    parentElm.insertBefore(el, oldElm.nextSibling);
    parentElm.removeChild(oldVnode);
    return el;
  } else { // diff 新旧 vnode节点进行更新
    /* 开始对比新老虚拟节点，更新DOM */

    // 如果标签名称不一样，则直接换成新的
    if(oldVnode.tag !== vnode.tag){
      // 用新的节点替换掉老的节点
      return oldVnode.el.parentNode.replaceChild(createElm(vnode),oldVnode.el)
    }
    /* 下面是新旧虚拟节点相同的情况 */
    // 如果新旧节点都是文本
    if (vnode.tag == undefined) {
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
      return;
    }
    /* 下面是新旧标签一致，并且不是文本的情况 */
    // 标签一样比较属性 , 拿到老的真实DOM赋给vnode，当成新的el，更新属性时要用
    let el = vnode.el = oldVnode.el; // 表示当前新节点(复用老节点)
    updateProperties(vnode, oldVnode.data) // data 中放了节点的属性

    // 返回最新的真实DOM
    return el
  }
}

// 更新 updateProperties 方法，增加第二个参数，有第二个属性时做对比更新
function updateProperties(vnode, oldProps = {}){
  let newProps = vnode.data || {};
  let el = vnode.el; //真实节点
  let newStyle = newProps.style || {}
  let oldStyle = oldStyle.style || {}
  for (let key in oldStyle) {
    // 老样式有，新的样式没有
    if (!newStyle[key]) {
      // 直接删除
      el.style[key] = ''
    }
  }
  for (let key in oldProps) {
    // 老属性有，新的属性没有
    if (!newProps[key]) {
      // 直接删除
      el.removeAttribute(key)
    }
  }
  for (let key in newProps) {
    // 样式需要特殊处理
    if (key === "style") {
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps.class;
    } else {
      // 给这个元素添加属性 值就是对应的值
      el.setAttribute(key, newProps[key]);
    }
  }
}
```

::: tip patch
`patch`方法中新增了`domdiff`的基本判断：标签名不同的更新、文本内容的更新以及属性的更新。更新了属性更新的核心方法`updateProperties`，增加了存在老属性时的对比情况处理。
:::

## path中对子节点的处理

```js
// src/vdom/patch.js

// patch用来渲染和更新视图
export function patch(oldVnode, vnode) {
  // if (!oldVnode) {
  //   return createElm(vnode); 
  // }
  if (oldVnode.nodeType == 1) {
    // const oldElm = oldVnode; 
    // const parentElm = oldElm.parentNode;
    // let el = createElm(vnode);
    // parentElm.insertBefore(el, oldElm.nextSibling);
    // parentElm.removeChild(oldVnode);
    // return el;
  }else{ // diff 新旧 vnode节点进行更新
    /* 开始对比新老虚拟节点，更新DOM */
    // if(oldVnode.tag !== vnode.tag){
    //   return oldVnode.el.parentNode.replaceChild(createElm(vnode),oldVnode.el)
    // }
    // if (vnode.tag == undefined) {
    //   if (oldVnode.text !== vnode.text) {
    //     el.textContent = vnode.text;
    //   }
    //   return;
    // }
    // let el = vnode.el = oldVnode.el
    // updateProperties(vnode, oldVnode.data)

    /* 对子节点的处理 */
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 新老节点都有儿子，用了双指针的方式 来比对
      patchChildren(el, oldChildren, newChildren); // diff核心方法
    } else if (newChildren.length > 0) {
      // 老节点没儿子 新节点的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        // 将新节点的儿子创建成真实节点追加到DOM中
        let child = createElm(newChildren[i]);
        el.appendChild(child); 
      }
    } else if (oldChildren.length > 0) {
      // 老节点有儿子 新节点没儿子
      el.innerHTML = ``; // 直接清空老节点的儿子
    }
    // return el
  }
}
```

::: tip 子节点不同的判断
增加了对于子节点的判断。

- 1、新老节点都有子节点        ->   `patchChildren`对比更新
- 2、老节点没子节点，新节点有   ->    循环创建新的子节点，追加到`DOM`当中
- 3、老节点有子节点，新节点没有 ->    直接清空老节点的子节点
:::

## 对比子节点的核心方法patchChildren
```js
// src/vdom/patch.js

// 判断是否是相同节点，决定是否可复用老的DOM元素
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag == newVnode.tag && oldVnode.key == newVnode.key;
}

function patchChildren(el,oldChildren,newChildren){
  let oldStartIndex = 0; // 老的开始索引
  let oldStartVnode = oldChildren[oldStartIndex]; // 老的开始节点
  let oldEndIndex = oldChildren.length - 1; // 老的结尾索引
  let oldEndVnode = oldChildren[oldEndIndex]; // 老的结尾节点
  let newStartIndex = 0; // 新的开始索引
  let newStartVnode = newChildren[0]; // 新的开始节点
  let newEndIndex = newChildren.length - 1;  // 新的结尾索引
  let newEndVnode = newChildren[newEndIndex]; // 新的结尾节点

  // 乱序对比时，为了尽量复用老节点，会用到老节点的key与索引建立的map
  const makeIndexByKey = children =>{
    return children.reduce((memo, cur)=>{
      if(cur.key){
        memo[cur.key] = index
      }
      return memo
    },{})
  }
  
  const keysMap = makeIndexByKey(oldChildren);

  // 同时循环新老虚拟节点，有一方循环完毕就结束了
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 当老节点已经被移走了
    if(oldStartVnode == null){
      oldStartVnode = oldChildren[++oldStartIndex]
    }else if(oldEndVnode == null){
      oldEndVnode = oldChildren[--oldEndIndex]
    }else if (isSameVnode(oldStartVnode, newStartVnode)) {
    /* 
      情况1 老的头和新的头节点相同，继续比较两个虚拟节点(比较属性、儿子) 
      新老开始索引+1，都往后移动，继续比对新老虚拟节点
    */
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } 
    else if (isSameVnode(oldEndVnode, newEndVnode)) {
    /* 
      情况2 老的尾和新的尾节点相同，继续比较两个虚拟节点(比较属性、儿子) 
      新老结尾索引-1，都往前移动，继续比对新老虚拟节点
    */
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    else if (isSameVnode(oldStartVnode, newEndVnode)) {
    /* 
      情况3 老的头和新的尾节点相同，继续比较两个虚拟节点(比较属性、儿子) 
      将老的头节点移动到老的尾节点的下一个节点的前面
      老的开始索引+1，向前移动，新的结尾索引-1，向后移动，继续比对新老虚拟节点
    */
      patch(oldStartVnode, newEndVnode);
      //  此处只能放到老的结束节点的下一个节点的前面，不能直接追加到末尾
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 老的元素被移动走了，不用删除
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } 
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
    /* 
      情况4 老的尾和新的头节点相同，继续比较两个虚拟节点(比较属性、儿子) 
      将老的尾节点移动到新的头节点的前面
      老的结尾索引-1，向后移动，新的开始索引+1，向前移动，继续比对新老虚拟节点
    */
      patch(oldEndVnode, newStartVnode);
      el.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
    else{
      /* 
        情况5 乱序对比，以上情况都不符合，会用节点的key建立的map来进行节点对比
        如果元素不能复用，则直接创建新元素插入到老的开始节点的前面
        如果可以复用，将复用节点插入到老的开始节点的前面，继续比较两个虚拟节点(比较属性、儿子) 
        最后将新的开始索引+1，向前移动，继续比对新老虚拟节点
      */
      let moveIndex = keysMap[newStartIndex]
      // 索引不存在代表不能复用节点
      if(moveIndex == undefined){
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }else {
        // 可以复用
        let moveNode = oldChildren[moveIndex]
        oldChildren[moveIndex] = null // 将移走的节点置为null
        el.insertBefore(moveNode.el, oldStartVnode.el)
        patch(moveNode, newStartVnode);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  /* 下面是比对完成后新节点或老节点还有剩余的处理 */

  if (newStartIndex <= newEndIndex) {
    // 新节点有剩余，循环新节点，创建新节点插入到老节点的末尾
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // insertBefore方法 他可以appendChild功能 insertBefore(节点,null)  dom api
      /* 
        当新节点有剩余时有两种情况
        情况1-1、向后插入节点
        情况2-1、向前插入节点
       */
      // 根据新节点尾指针的下一个节点是否存在，存在则说明需要向节点前插入节点，不存在则向后追加节点。
      let anchor = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
      el.insertBefore(createElm(newChildren[i]), anchor);
    }
  }
  // 老节点剩余的，循环老节点，移除每一个。
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // 节点不为null时才删除
      if(oldChildren[i] != null) el.removeChild(oldChildren[i].el);
    }
  }
}
```

::: tip diff
- 情况1：老的头和新的头节点相同<br>
<img :src="$withBase('/assets/vue-diff-1.png')" alt="vue-diff-1">
- 情况2：老的尾和新的尾节点相同<br>
<img :src="$withBase('/assets/vue-diff-2.png')" alt="vue-diff-2">
- 情况3：老的头和新的尾节点相同<br>
<img :src="$withBase('/assets/vue-diff-3.png')" alt="vue-diff-3">
- 情况4：老的尾和新的头节点相同<br>
<img :src="$withBase('/assets/vue-diff-4.png')" alt="vue-diff-4">
- 情况5：乱序对比，以上情况都不符合，会用节点的key建立的map来进行节点对比<br>
<img :src="$withBase('/assets/vue-diff-5.png')" alt="vue-diff-5">
- 情况1-1：新节点有剩余，向后追加<br>
<img :src="$withBase('/assets/vue-diff-1-1.png')" alt="vue-diff-1-1">
- 情况2-1：新节点有剩余，向前插入<br>
<img :src="$withBase('/assets/vue-diff-2-1.png')" alt="vue-diff-2-1">
:::

## 升级_update方法应用diff更新
```js
// src/lifecycle.js

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const prevVnode = vm._vnode; // 保留上一次的vnode
    vm._vnode = vnode;
    // 初次渲染 vm._vnode不存在
    if (!prevVnode) {
      vm.$el = patch(vm.$el, vnode);
    } else {
      // 更新时Diff
      vm.$el = patch(prevVnode, vnode);
    }
  };
}
```
::: tip _update
升级过之后，再次更新数据时，更新视图时就会走`patch`方法，最少化的更新`DOM`。
:::