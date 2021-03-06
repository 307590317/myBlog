---
title: Vue 生命周期源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 生命周期源码解析
::: tip lifecycle
此篇主要讲了`Vue`的组件中生命周期钩子函数的实现原理，以及混入(`mixin`)方法的实现原理。
:::
```html
<div id="app"></div>
<script>
  Vue.mixin({
    beforeCreate(){
      console.log('bfeoreCreate mixin1')
    }
  })
  Vue.mixin({
    beforeCreate(){
      console.log('bfeoreCreate mixin2')
    }
  })
  const vm = new Vue({
    el: "#app",
    bfeoreCreate(){
      console.log('bfeoreCreate')
    }
  })
</script>
```



## 全局api mixin函数

```js
// src/globalApi/index.js
// 源码中拆分了 mixin，此处只罗列 mixin的逻辑 就不做拆分了
import { mergeOptions } from "../utils";

export function initGlobalApi(Vue) {
  // 类上的options属性用来存放全局的配置, 每个组件初始化的时候都会和options选项进行合并
  Vue.options = Object.create(null) 
  // Vue.component
  // Vue.filter
  // Vue.directive

  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options);
    return this;
  };
}
```
::: tip initGlobalApi
`globalApi`，看名字就知道，定义了很多`Vue`可全局调用的`api`方法，主要讲生命周期的原理，和`mixin`混入方法。核心就是利用`mixin`方法，将组件的生命周期钩子函数和`Vue.options`中的生命周期钩子函数进行合并，最终赋值给组件，供组件调用。
:::
```js
// src/index.js

import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { initGlobalApi } from "./globalApi";

function Vue(options) {
  this._init(options);
}

// 在Vue原型上扩展初始化方法
initMixin(Vue); // _init、$mount方法

// 扩展_update 方法
lifecycleMixin(Vue);

// 扩展_render、_s、_c、_v 方法
renderMixin(Vue); 

// 初始化在Vue类上扩展的API
initGlobalApi(Vue)

export default Vue;
```

::: tip
在`Vue`的`index`文件中引入`initGlobalApi`，进行初始化。
:::

## 核心方法mergeOptions

```js
// src/util

export function isObject(val) {
  return typeof val == "object" && val !== null;
}

// 采用策略的模式来处理生命周期
let strats = {}; // 存放各种策略
let lifeCycleHooks = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

// 生命周期合并的核心方法，将所有的钩子函数都合并成一个函数数组，最后循环数组依次执行

/*          父                        子                      合并后的值
            {}               { beforeCreate:Fn }  =>  { beforeCreate:[fn] }
    { beforeCreate:[fn] }    { beforeCreate:fn }  =>  { beforeCreate:[fn,fn]  }
*/
function mergeHook(parentVal, childVal) {
  // 如果子存在
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal); // 后续
    } else {
      return [childVal]; // 第一次父的beforeCreate没值，用子的fn生成一个数组
    }
  } else { // 子中没有生命周期函数调用就直接返回父的值
    return parentVal;
  }
}

// 生命周期的合并
lifeCycleHooks.forEach((hook) => {
  strats[hook] = mergeHook;
});

// mixin核心方法
export function mergeOptions(parent, child) {
  const options = {}; // 合并后的结果
  // 遍历父亲
  for (let key in parent) {
    mergeField(key);
  }
  // 遍历儿子，防止儿子有值，父亲没有值
  for (let key in child) {
    // 父亲有值，就直接跳过，遍历父亲时已经处理过
    if (parent.hasOwnProperty(key)) {
      continue;
    }
    mergeField(key);
  }
  // 核心合并方法
  function mergeField(key) {
    let parentVal = parent[key];
    let childVal = child[key];
    // 策略模式(处理生命周期的合并逻辑)
    if (strats[key]) {
      // 如果有对应的策略就调用对应的策略即可
      options[key] = strats[key](parentVal, childVal);
    } else {
      // 如果都是对象就用子的覆盖父的
      if (isObject(parentVal) && isObject(childVal)) {
        options[key] = { ...parentVal, ...childVal };
      } else {
        // 父亲中有，儿子中没有
        options[key] = child[key] || parent[key];
      }
    }
  }
  return options;
}
```

::: tip mergeOptions
`mergeOptions`方法主要对父、子的属性进行合并，会对父、子的属性分别遍历，处理多种情况下的合并。对于生命周期，有自己合并策略`mergeHook`，就采用自己的合并策略进行合并。最后将父、子的生命周期函数都合并成一个数组，等待调用。
:::

## 与组件中的生命周期混入

```js
// src/init.js
import { mergeOptions } from "./util";

Vue.prototype._init = function (options) {
  const vm = this;
  // 需要对Vue的实例的生命周期进行合并 (Vue.options与用户传入的options合并)
  // 采用vm.constructor 是为了让继承Vue子类也可以使用
  // vm.constructor.options 相当于 Vue.options | Vue的子类.options
  vm.$options = mergeOptions(vm.constructor.options, options);

  // 初始化状态
  initState(vm);

  // 如果有el属性 进行模板渲染
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
};
```

## 生命周期的调用

```js
// src/lifecycle.js

export function callHook(vm, hook) {
  let handlers = vm.$options[hook];
  // 拿到生命周期需要执行的方法，循环调用。
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      // 生命周期函数中的this都是当前实例
      handlers[i].call(vm);
    }
  }
}
```
::: tip callHook
在`lifecycle`文件中新增调用生命周期的`callHook`方法。
:::

```js
// src/init.js
import { callHook } from "./lifecycle.js";

Vue.prototype._init = function (options) {
  // const vm = this;
  // vm.$options = mergeOptions(vm.constructor.options, options);
  callHook(vm, "beforeCreate"); 
  // initState(vm);
  callHook(vm, "created"); 
  // if (vm.$options.el) {
  //   vm.$mount(vm.$options.el);
  // }
};
```
```js
// src/lifecycle.js
export function mountComponent(vm, el) {
  // vm.$el = el;
  callHook(vm, "beforeMount"); 
  // let updateComponent = () => {
  //   vm._update(vm._render());
  // };
  // new Watcher(vm,updateComponent,() => {
  //   console.log('更新视图了')
  // },true);
  
  // 如果已经挂载过就不需要再执行mounted钩子函数了
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
}
```
::: tip 执行钩子函数
在`vm`对应的时期调用`callHook`方法执行对应时期的钩子函数。
:::
