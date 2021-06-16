---
title: Vue 侦听器(watch)源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 侦听器(watch)源码解析

```html
<div id="app">{{name}}</div>
<script>
  const vm = new Vue({
    el: "#app",
    data: {
      name: "mrzhao",
      info: {
        age: 25,
      },
    },
    watch: {
      // 常用的写法
      name(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
      // 对象写法
      name: {
        handler() {},
        immediate: true,
      },
      // methods中放方法的写法
      name: "nameWatch",
      // 数组的写法
      name: [
        function(newVal, oldVal) {
          console.log(newVal, oldVal);
        },
        function(a, b) {
          console.log(a, b);
        },
      ],
      // 函数的写法
      "info.age"(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
    },
    methods: {
      nameWatch(newVal) {},
    },
  });
  setTimeout(() => {
    vm.name = "zhongguo";
  }, 1000);
</script>
```

::: tip watch
侦听器(watch)写法种有很多，可以写成 函数、对象、字符串、数组，对象形式可以增加额外的属性如：immediate（立即触发回调），deep（深度监听对象）
:::

## 侦听器的初始化

```js
// src/state.js

export function initState(vm) {
  // 状态的初始化
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  // if (opts.computed) {
  //   initComputed(vm, opts.computed);
  // }
  if (opts.watch) {
    // 初始化watch
    initWatch(vm, opts.watch);
  }
}

function initWatch(vm, watch) {
  for (let key in watch) {
    // handler可能是 函数、对象、字符串、数组
    let handler = watch[key];
    // 如果watch写成了数组 [function(){},function(){}]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, expOrFn, handler, options = {}) {
  // 字符串代表传入的是methods中的方法
  if (typeof handler === "string") {
    handler = vm[handler];
  } else if (typeof handler === "object") {
    // 传入的是对象，对象中有回调
    options = handler; // 存到options上 之后要用到如deep、immediate属性
    handler = handler.handler;
  }
  // 主要方法为Vue原型上的$watch方法来生成用户的watcher
  return vm.$watch(expOrFn, handler, options);
}
```

::: tip createWatcher
`initState`的时候如果`watch`属性存在，会调用`initWatch(vm, watch)`,根据`watch`的属性，判断属性的值是数组还是其他类型的，是数组就循环数组调用`createWatcher`，其他类型就直接调用`createWatcher`，来创建用户的属性观测`wather`
:::

## $watch

```js
// src/state.js
import Watcher from "./observer/watcher";

export function stateMixin(Vue) {
  Vue.prototype.$watch = function(exprOrFn, cb, options = {}) {
    options.user = true; // 区分用户watcher

    // vm,name,用户回调，options.user
    const watcher = new Watcher(this, exprOrFn, cb, options);
    // 如果有immediate 属性则立即执行回调
    if (options.immediate) {
      cb(watcher.value);
    }
  };
}
```

::: tip $watch
核心方法，扩展在`Vue`的原型上，用户也可以在 vue 组件中直接调用`this.$watch`来创建`watcher`监听属性
:::
## Watcher 类的改造

```js
// src/observer/watcher.js
import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let id = 0;
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    // this.vm = vm;
    // this.exprOrFn = exprOrFn;
    this.user = !!options.user; // 是不是用户watcher
    // this.cb = cb;
    // this.options = options;
    // this.id = id++;
    // this.deps = [];
    // this.depsId = new Set();

    // watch可能写成字符串 比如 info.age
    if (typeof exprOrFn == "string") {
      this.getter = function() {
        // 当我数据取值时 ， 会进行依赖收集
        // info.age   vm['info']['age']
        let path = exprOrFn.split("."); // [info,age]
        let obj = vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]];
        }
        return obj; 
      };
    } else {
      this.getter = exprOrFn; // updateComponent
    }

    // 首次需要取值
    this.value = this.get(); // 默认初始化 要取值
  }
  // get() {
  //   pushTarget(this); // Dep.target = watcher
  //   const value = this.getter.call(this.vm); // render() 方法会去vm上取值 vm._update(vm._render)
  //   popTarget(); // Dep.target = null; 如果Dep.target有值说明这个变量在模板中使用了

  //   return value;
  // }
  // update() {
  //   // vue中的更新操作是异步的
  //   queueWatcher(this); // 多次调用update 会将watcher缓存
  // }
  run() {
    let newValue = this.get();
    let oldValue = this.value;
    this.value = newValue; // 为了保证下一次更新时 上一次的最新值是下一次的老值
    // 用户的 watch
    if (this.user) {
      // 如果两次的值不相同  或者值是引用类型 因为引用类型新老值是相等的 他们是指向同一引用地址
      if (newVal !== oldVal || isObject(newVal)) {
        this.cb.call(this.vm, newVal, oldVal);
      }
    }else{
      // 渲染watcher
      this.cb.call(this.vm);
    }
  }
  // addDep(dep) {
  //   let id = dep.id;
  //   if (!this.depsId.has(id)) {
  //     this.depsId.add(id);
  //     this.deps.push(dep);
  //     dep.addSub(this);
  //   }
  // }
}

export default Watcher;
```
::: tip Watcher改造
1、对用户`watcher(options.user = true)`传入的`exprOrFn`做了兼容处理，转换成去`vm`上取值的函数。并在初始化时调用拿到第一次的旧值保存到`watcher`的`value`属性上
2、在属性更新的时候会调用`run`方法，如果是用户`watcher`，执行用户回调`cb`的时候将老值和新值传过去，就行了
:::