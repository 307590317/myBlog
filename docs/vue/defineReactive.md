---
title: Vue 响应式数据源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 响应式数据源码解析

```html
<div id="app">
  {{name}}
</div>
<script>
  const vm = new Vue({
    el: "#app",
    data: {
      name: "mrzhao",
      ary:[[2,3]]
    },
  });
  setTimeout(() => {
    vm.name = "zhongguo";
    vm.ary.push(4)
    vm.ary[0].push(5)
  }, 1000);
</script>
```

::: tip Vue
Vue 的特点就是数据驱动视图，数据变化会导致视图自动更新。这样我们就不需要关心 DOM 操作了，只需要更改数据就可以了。Vue2 内部通过`defineProperty`方法实现了响应式的数据变化，接下来解析原理。
:::

## 数据的初始化

```js
// src/index.js

import { initMixin } from "./init";

// Vue2.0中 可以看出Vue就是一个构造函数
function Vue(options) {
  // 当用户new Vue时 就调用原型上的init方法进行vue的初始方法
  this._init(options);
}

// 为了利于代码维护，方便以后扩展，拆分逻辑到不同的文件中 模块化的概念

initMixin(Vue); // 在Vue原型上扩展初始化方法

export default Vue;
```

::: tip
为了方便维护、扩展，所以把不同的逻辑拆分到不同的文件里，通过 import 导入，有利于代码分割。
:::

```js
// src/init.js
import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    const vm = this;
    // 实例上有个属性$options 表示的是用户传入的所有属性
    vm.$options = options;
    // 初始化状态
    initState(vm);
  };
}
```

```js
// src/state.js
import { observe } from "./observer/index";

// vue的数据 props、methods、data、compunted、watch都在这里初始化
export function initState(vm) {
  // 将所有数据都定义在 vm属性上，并且后续更改 需要触发视图更新
  // 拿到用户的参数
  const opts = vm.$options;
  // 初始化顺序如下 props -> methods -> data -> computed -> watch
  // if (opts.props) initProps(vm, opts.props)
  // if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    // 数据的初始化
    initData(vm);
  }
  // if (opts.computed) initComputed(vm, opts.computed)
  // if (opts.watch) initWatch(vm, opts.watch)
}

function initData(vm) {
  // 拿到用户传入的data
  let data = vm.$options.data;
  // 对data类型进行判断 如果是函数 获取函数返回值作为对象（data写成函数是为了防止数据在组件间共享）
  data = vm._data = typeof data === "function" ? data.call(vm) : data;

  // 将_data中的数据全部代理到vue实例(vm)上，取值时用this.name 代替 this._data.name
  for (let key in data) {
    proxy(vm, "_data", key);
  }

  // 观测数据，核心方法
  observe(data);
}
// 代理方法，将_data上的属性直接代理到vm上
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}
```

::: tip initState
对数据进行了代理，将传入的数据代理到了 vue 实例上，在页面中就可以用`this.xxx`来使用数据。此外还通过`observe`方法对数据进行了观测，目的是为了实现响应式的数据
:::

## 核心观测类 Observer

```js
// src/observer/index.js
import { arrayMethods } from "./array";

class Observer {
  constructor(data) {
    // 对对象中的所有属性 进行劫持
    this.walk(data);
  }
  walk(data) {
    // 对象
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

// vue2 会对对象进行遍历 将每个属性 用defineProperty 重新定义 性能差

function defineReactive(data, key, value) {
  // value有可能是对象，也需要递归进行观测 （性能差）
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      console.log("获取值");
      return value;
    },
    set(newV) {
      if (newV !== value) {
        console.log("设置值");
        observe(newV); // 用户赋值是对象时，也需要将这个对象进行劫持
        value = newV;
      }
    },
  });
}

export function observe(data) {
  // 如果不是对象则直接return
  if (!(val !== null && typeof val == "object")) {
    return;
  }

  return new Observer(data);
}
```

::: tip Observer
`Observer`类是核心的观测类，最核心的方法是`defineReactive`方法，内部采用`Object.defineProperty`方法对数据的`get`和`set`的方法进行劫持，我们可以在获取值的时候做依赖收集，在设置值的时候通知视图更新，这样就能通过只操作数据来驱动视图更新

此时的`Observer`类会对对象类型的数据进行观测，对于对象新增的属性(属性值不为对象的)不会做代理，只对已有属性和新属性的值为对象的属性做代理，这也是 vue2 目前存在的问题。

对于数组类型的值，采用这种深度递归的方式去观测，是十分浪费性能的，通过数组下标修改值时，也会触发`set`执行，所以对于数组类型的值，我们要单独处理。
:::

## 数组类型值的观测

:::tip
那么对于数组类型的值，我们只需要在调用能修改数组的方法中做出响应即可，对于通过数组下标修改数组的，不需要支持。。Vue 只推荐调用变异方法来修改数组，而不是通过数组下标修改数组。
:::

```js
// src/obserber/index.js
import { arrayMethods } from "./array";

class Observer {
  constructor(value) {
    // 给每个属性值增加不可枚举属性 __ob__ 值为 Observer的实例，代表已经被观测过。
    Object.defineProperty(value, "__ob__", {
      value: this, // Observer的实例
      enumerable: false, // 不可枚举的
    });
    // data.__ob__ = this; // 所有被劫持过的属性都有__ob__

    // 对于数组类型，需要单独处理
    if (Array.isArray(value)) {
      // 数组劫持的逻辑：对能改变原数组的方法进行改写， 切片编程  高阶函数
      value.__proto__ = arrayMethods;
      // 如果数组中的数据是对象类型，需要监控对象的变化
      this.observeArray(value);
    } else {
      this.walk(value); //对象劫持的逻辑
    }
  }
  // 对数组中的对象类型的数据也需要递归劫持
  observeArray(data) {
    // 如果数组里放的是对象类型，也做了观测
    data.forEach((item) => observe(item));
  }
}
```

```js
// src/observer/array.js

// 保留原来的数组原型
let oldArrayPrototype = Array.prototype;
export let arrayMethods = Object.create(oldArrayPrototype);

// arrayMethods.__proto__ = Array.prototype 继承

let methods = ["push", "shift", "unshift", "pop", "reverse", "sort", "splice"];

methods.forEach((method) => {
  // 用户调用的如果是以上七个方法 会用我们劫持的方法，否则用原来的数组方法
  arrayMethods[method] = function(...args) {
    //  args 是参数列表 arr.push(1,2,3)
    const res = oldArrayPrototype[method].call(this, ...args); // arr.push(1,2,3);
    
    // this表示调用数组方法的数据本身
    let ob = this.__ob__; // 可以通过 __ob__ 属性拿到观测当前数组的observer实例

    let inserted;
    // 下面根据 inserted 判断数组是否新增数据
    switch (method) {
      case "push":
      case "unshift":
        inserted = args; // 就是新增的内容
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    // 如果有新增的内容 inserted是一个数组，需要调用 observer实例 的原型方法 observeArray继续劫持
    if (inserted) ob.observeArray(inserted);

    return res
  };
});
```
## 更新observe方法
```js
// src/observer/index.js

export function observe(data) {
  // 如果不是对象则直接return
  if (!(val !== null && typeof val == "object")) {
    return;
  }
  // 如果观测过了，就直接返回观测当前数据的observer实例，防止重复观测
  if(data.__ob__){
    return data.__ob__
  }
  return new Observer(data);
}
```
::: tip __ob__属性
`Observer`类在观测时会给数据增加不可枚举的`__ob__`属性，值为观测当前数据的`observer`实例，有以下作用：
1、防止重复观测数据：在调用`observe`方法时判断是否有`__ob__`属性来防止重复观测
2、在数组调用方法给数组新增数据时，需要对新增数据也进行观测，方便数组拿到自身的`observer`实例，调用`observer`实例原型方法`observeArray`对新增数据进行观测
3、当数组更改时也需要触发视图更新，也需要调用`observer`实例的相关方法
:::
