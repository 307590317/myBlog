---
title: Vue 异步更新源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 异步更新源码解析

::: tip
此篇主要讲了`Vue`中对于数据更新的性能优化，实现多次修改数据只更新一次视图。以及`$nextTick`方法的实现。
:::

```html
<div id="app">
  {{name}}
</div>
<script>
  const vm = new Vue({
    el: "#app",
    data: {
      name: "mrzhao",
    },
  });
  setTimeout(() => {
    vm.name = 1;
    vm.name = 2;
    vm.name = 3;
    vm.name = 4;
    vm.name = 5;
    vm.$nextTick(()=>{
      console.log(vm.$el)
    })
  }, 1000);
</script>
```

::: tip
按照之前的逻辑，数据取值时会做依赖收集，数据更新时，会触发视图更新，只要新值与老值不一样，就会触发视图更新，这样很浪费性能。
:::

## 升级 watcher

```js
// src/observer/watcher.js

import { queueWatcher } from "./scheduler";

export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    // 省略不更改的代码....
  }

  // 修改update方法
  update() {
    // 每次更新时，不在立即调用，而是存到队列中，等待批量更新
    // 而且是异步更新
    queueWatcher(this);
  }
  // 新增run方法，真正更新时调用的方法
  run(){
    this.get()
  }
}
```
::: tip
原本只要更改数据，就会调用`watcher`的`update`方法立即更新，现在不立即执行，先存放到队列当中，最终批量更新。
:::

```js
// src/observer/scheduler.js

import { nextTick } from "../utils";

let queue = []; // 存放watcher
let has = {}; // 用来watcher去重

// 动画  滚动的频率高，节流 requestFrameAnimation
function flushSchedulerQueue() {
  for (let i = 0; i < queue.length; i++) {
    // 触发watcher真正的更新
    queue[i].run(); 
  }
  // 更新完成之后清空队列
  queue = [];
  has = {};
  pending = false;
}

let pending = false;

// 实现批量更新队列机制
export function queueWatcher(watcher) {
  // 用id来去重
  const id = watcher.id;
  // 没有才往里放
  if (has[id] == null) {
    queue.push(watcher);
    has[id] = true;
    // 防抖处理
    if (!pending) {
      // 异步更新
      nextTick(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}
```

::: tip scheduler
`scheduler`用来做`watcher`的调度工作，对`watcher`进行了去重，更新时的防抖处理。最终通过核心异步方法`nextTick`实现`watcher`的更新。
:::

## 异步更新核心方法nextTick


```js
// src/util

export function isFunction(val) {
  return typeof val === "function";
}

export function isObject(val) {
  return typeof val == "object" && val !== null;
}
const callbacks = [];

function flushCallbacks() {
  callbacks.forEach((cb) => cb());
  waiting = false;
}

let waiting = false;

function timer(flushCallbacks) {
  // 定义异步方法-> 优雅降级（微任务优先）
  let timerFn = () => {};
  if (Promise) {
    timerFn = () => {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    // MutationObserver 监控DOM的变化，异步执行传入的方法
    let textNode = document.createTextNode(1);
    let observe = new MutationObserver(flushCallbacks);
    // 监控文本内容的变化，改变了会异步执行传入的回调
    observe.observe(textNode, {
      characterData: true,
    });
    timerFn = () => {
      textNode.textContent = 3;
    };
  } else if (setImmediate) {
    timerFn = () => {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFn = () => {
      setTimeout(flushCallbacks);
    };
  }
  timerFn();
}

// 微任务是在页面渲染前执行 我取的是内存中的已经计算完的dom，不关心是否渲染完毕
export function nextTick(cb) {
  // 除了渲染watcher，还会存放用户手动调用存入的回调方法，会按照顺序存入
  callbacks.push(cb); 

  if (!waiting) {
    timer(flushCallbacks); // vue2 中考虑了兼容性问题 vue3 里面不在考虑兼容性问题
    waiting = true;
  }
}

```

## $nextTick 挂载原型
::: tip $nextTick
最后将`nextTick`扩展到`Vue`的原型上，供用户调用
:::
```js
// src/render.js
import { nextTick } from "./util";

export function renderMixin(Vue) {
  Vue.prototype.$nextTice = nextTick
  // ...省略其他代码
}

```

## 批量异步更新原理
::: tip 批量异步更新
多次同步修改数据时，在第一次修改数据时，就会把对应的`watcher`放入`queue`队列中（会根据watcher的id做去重处理），之后再同步修改数据，就不会再往`queue`队列中存放`watcher`了。当同步代码执行完成后，开始调用`$nextTick`执行微任务异步执行`flushSchedulerQueue`，调用`watcher`的`run`方法，取到最终的值，更新视图。
:::

## $nextTick中为什么能拿到最新的DOM结构
::: tip
`$nextTick`方法不是微任务异步更新么？微任务不是在渲染之前执行完成么？为什么在`$nextTick`中能拿到最新的`DOM`结构呢？

因为使用了`$nextTick`来统一渲染`watcher`执行 和 用户`$nextTick`回调执行 的类型，都是同一个`timerFn`，所以就会根据放入回调函数的顺序来执行响应的回调。当数据更新时，放入渲染`watcher`，之后放入用户的回调，渲染`watcher`执行完更新逻辑后，内存中的`DOM`节点已经更新完毕，所以之后再执行用户回调的时候就能获取到内存中的最新的`DOM`节点。
:::
