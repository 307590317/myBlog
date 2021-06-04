---
title: Vue 初始化渲染源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 初始化渲染源码解析

::: tip
此篇主要讲了将`html`字符串最终转化成`render`函数之后，又怎么生成虚拟`dom`(`vnode`)，再根据虚拟`dom`生成真实`DOM`结构渲染到页面上的过程
:::

```js
// src/init.js

import { initState } from "./state";
import { mountComponent } from "./lifecycle";
import { compileToFunction } from "./compiler/index";

export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    // el,data
    const vm = this;
    vm.$options = options; // 后面会对options进行扩展操作

    // 对数据进行初始化 watch computed props data ...
    initState(vm); // vm.$options.data  数据劫持

    // 如果有el元素，将数据渲染到模板上
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function(el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    // 挂载时需要把传入的el元素挂载到vm的$el属性上，为了之后DOM更新替换DOM
    vm.$el = el;
    // 把模板转化成 对应的渲染函数(render) =》 虚拟dom概念 vnode =》 diff算法 更新虚拟dom =》 产生真实节点，更新
    // 如果有render 就用render
    // 没有render 看有没有template  有就用
    // 没有template 就找el
    if (!options.render) {
      // 没有render用template，目前没render
      let template = options.template;
      if (!template && el) {
        // 用户也没有传递template 就取el的内容作为模板
        template = el.outerHTML;
      }
      // 最后需要把template转换成render函数
      let render = compileToFunction(template);
      // 生成render函数后挂载到vm的options属性上
      options.render = render;
    }
    // options.render 就是渲染函数
    // 调用render方法 渲染成真实dom 替换掉页面的内容
    mountComponent(vm, el); // 组件的挂载流程
  };
}
```

## 挂载核心方法 mountComponent

```js
// src/lifecycle.js

export function mountComponent(vm, el) {
  // 生成render函数之后会调用此方法，vm.options上会有render方法
  // 之后调用 vm._render()，会调用render方法 生成虚拟dom
  // 最后调用vm._update() 根据虚拟dom生成真实DOM渲染到页面上
  //   _update和._render方法都是挂载在Vue原型的方法  类似_init
  vm._update(vm._render());
}
```

::: tip mountComponent
`lifecycle.js`文件，表示生命周期相关功能 核心导出 `mountComponent`函数， 主要使用 `vm._update(vm._render())`方法进行实例挂载
:::

## _render 生成虚拟 DOM

```js
// src/render.js
import { createElement, createTextElement } from "./vdom/index";

export function renderMixin(Vue) {
  // 生成虚拟DOM的方法
  Vue.prototype._render = function() {
    const vm = this;
    // 我们解析出来的render方法，也有可能是用户写的
    let render = vm.$options.render;
    // 调用render方法生成虚拟DOM
    let vnode = render.call(vm);
    return vnode;
  };

  Vue.prototype._c = function() {
    // 生成元素的虚拟节点
    return createElement(this, ...arguments);
  };

  Vue.prototype._v = function(text) {
    // 生成文本的虚拟节点
    return createTextElement(this, text);
  };

  // 从vm实例上取值的方法
  Vue.prototype._s = function(val) {
    // 如果val的是一个对象  需要JSON.stringify
    if (typeof val == "object") return JSON.stringify(val);
    return val;
  };
}
```

::: tip _render
在原型上定义的`_render`方法主要调用了上一步`compileToFunction`转化而来的`render`方法，`render`方法中有`_c、_v、_s` 这些生成虚拟节点函数，我们还需要增加这些函数来生成虚拟`DOM`。
:::

```js
// src/vdom/index.js

// 创建虚拟元素节点对象
export function createElement(vm, tag, data = {}, ...children) {
  return vnode(vm, tag, data, data.key, children, undefined);
}

// 创建虚拟文本节点对象
export function createTextElement(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, data, key, children, text) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    // .....
  };
}
```

::: tip
`vdom`文件夹中，表示虚拟 `dom` 相关功能， `createElement` 和 `createTextNode` 方法最后都返回 虚拟的`vnode`对象
:::

## _update:虚拟dom转化成真实dom的核心方法

```js
// src/lifecycle.js

// lifecycle文件中增加 _update方法
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
  // 将虚拟节点转换成真实的dom
  Vue.prototype._update = function (vnode) {
    
    const vm = this;
    // patch方法是对比虚拟节点差异的主要方法
    vm.$el = patch(vm.$el, vnode); // 将vm.$el更新为新的真实DOM替换掉老的
  };
}

// export function mountComponent(vm, el) {
//   // 生成render函数之后会调用此方法，vm.options上会有render方法
//   // 之后调用 vm._render()，会调用render方法 生成虚拟dom
//   // 最后调用vm._update() 根据虚拟dom生成真实DOM渲染到页面上
//   //   _update和._render方法都是挂载在Vue原型的方法  类似_init
//   vm._update(vm._render());
// }
```

```js
// src/vdom/patch.js

// patch用来渲染和更新视图 今天只介绍初次渲染的逻辑
export function patch(oldVnode, vnode) {
  // 根据传入的oldVnode的nodeType是否有值判断是首次渲染还是视图更新
  // 首次渲染时，传入的vm.$el就是用户传入options中的el选项  所以是真实dom
  // 视图更新的时候  vm.$el 就被替换成了更新之前的老的虚拟dom
  const isRealElement = oldVnode.nodeType; // 真实DOM节点nodeType为1，虚拟节点没有
  if (isRealElement) { // 首次渲染的逻辑
    const oldElm = oldVnode; // <div id="app">{{name}}<div>
    const parentElm = oldElm.parentNode; // body
    // 将虚拟dom转化成真实dom节点
    let el = createElm(vnode);
    // 插入到 老的el节点下一个节点的前面 就相当于插入到老的el节点的后面
    // 这里不直接使用父元素appendChild是为了不破坏替换的位置
    parentElm.insertBefore(el, oldElm.nextSibling);
    // 删除老的el节点
    parentElm.removeChild(oldVnode);
    return el;
  }else{
    // diff 新旧 虚拟节点
  }
}

// 根据虚拟节点创建真实的节点
function createElm(vnode) {
  let { tag, data, key, children, text } = vnode;
  //   判断虚拟dom 是元素节点还是文本节点
  if (typeof tag === "string") { // 元素节点的tag有值，文本节点没有tag属性
    //  虚拟节点的el属性指向真实dom
    vnode.el = document.createElement(tag);
    // 解析虚拟dom属性
    updateProperties(vnode);
    // 循环子节点递归创建并将子节点放入父节点
    children.forEach((child) => {
      return vnode.el.appendChild(createElm(child));
    });
  } else {
    //   文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 解析vnode的data属性 映射到真实dom上
function updateProperties(vnode) {
  let newProps = vnode.data || {};
  let el = vnode.el; //真实节点
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
`_update`中将虚拟`DOM`转化成真实`DOM`的核心方法就是 `patch`， 首次渲染和后续视图更新都用这一个方法。只是首次渲染的时候传的第一个参数是真实`DOM`. 首次渲染思路就是根据虚拟`dom(vnode)`，调用原生`js`方法生成真实`dom`节点，之后替换掉 `el` 选项的位置
:::

## 将扩展的_render 和_update方法混入

```js
// src/index.js

import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";

// Vue2.0中 可以看出Vue就是一个构造函数
function Vue(options) {
  // 当用户new Vue时 就调用原型上的init方法进行vue的初始方法
  this._init(options);
}

// 为了利于代码维护，方便以后扩展，拆分逻辑到不同的文件中 模块化的概念

// 在Vue原型上扩展初始化方法
initMixin(Vue); // _init、$mount方法

// 扩展_render、_s、_c、_v 方法
renderMixin(Vue); 

// 扩展_update 方法
lifecycleMixin(Vue);
export default Vue;
```
::: tip 渲染流程
- 1、`init` 主要做了状态的初始化 （数据劫持 对象 、 数组）
- 2、`$mount` 找 `render`方法  （`el`->`template`-> `ast`对象 -> `codegen`生成字符串`code` -> `render`函数
- 3、`_render`生成虚拟`DOM`
- 4、`_update`方法根据虚拟`DOM`生成真实`DOM`并替换老的真实DOM，首次渲染完成
:::