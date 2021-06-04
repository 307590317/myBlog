---
title: Vue 渲染更新源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 渲染更新源码解析

::: tip
此篇主要讲了Vue的数据驱动是怎么实现的，如何采用观察者模式，将数据改变和视图更新绑定在一起的，数据更改后，自动更新视图。
:::

```html
<div id="app">
  {{name}}
</div>
<script>
  const vm = new Vue({
    el: "#app",
    data: {
      name: "mrzhao"
    },
  });
  setTimeout(() => {
    vm.name = "zhongguo";
    // 需要手动更新视图 （目前还没有diff）
    vm._update(vm._render()) 
  }, 1000);
</script>
```
::: tip
上一篇讲完了首次渲染，`_update`就是更新视图的核心方法，数据再次更改时，我们需要手动调用`vm._update(vm._render());`来更新视图。此篇就是讲解通过观察者模式，在更改完数据后，自动触发视图更新。
:::

## 声明Watcher类

```js
// src/observer/watcher.js

// watcher的唯一id 每个watcher实例都有，根据数量递增，
let id = 0;

export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.options = options; //额外的选项 true代表渲染watcher
    this.cb = cb;
    this.exprOrFn = exprOrFn;
    this.id = id++; // watcher的唯一标识

    this.getter = exprOrFn;
    // 初始化watcher会让getter执行
    this.get();
  }

  get() { // 方便扩展
    this.getter();
  }
}
```

::: tip Watcher
Vue采用观察者模式来实现数据变化后，驱动视图更新。当数据初始化时取值时，会收集当前的渲染`watcher`，数据变化之后，通知渲染`watcher`更新视图。
:::

## 创建渲染watcher
::: tip
更新`mountComponent`方法，将
:::
```js
// src/lifecycle.js

export function mountComponent(vm, el) {
  // 修改为观察者模式，生成渲染watcher

  let updateComponent = () => {
    vm._update(vm._render());
  };
  // 最后一个参数为 true 代表是渲染watcher
  new Watcher(vm, updateComponent, ()=>{
    console.log('更新视图了')
  }, true);
}
```

## 声明存放watcher的Dep类
::: tip Dep
因为一个属性可能有多个地方使用比如在`Computed`中使用，在`watch`方法中使用，所以可能有多个`watcher`，这样每个属性就需要有一个自己收集`watcher`的地方，我们通过声明`Dep`类，来收集`watcher`。
:::
```js
// src/observer/dep.js

// 每个属性有一个dep，dep可以来存放watcher
let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 存放watcher
  }
}

// Dep类的静态属性，只有一个
Dep.target = null;

export function pushTarget(watcher) {
  Dep.target = watcher;
}

export function popTarget() {
  Dep.target = null;
}

export default Dep;
```

::: tip Dep
`Dep`类用来收集`watcher`，存入`subs`中，当有属性更新时，会调用方法循环`subs`，依次执行每个`watcher`的更新方法，做对应的更新。
:::

## 依赖收集

```js
// src/observer/index.js

// 响应式数据核心方法 defineReactive
function defineReactive(data, key, value) {
  observe(value);

  let dep = new Dep(); // 每次都会给属性创建一个dep  
  Object.defineProperty(data, key, {
    get() {
      // 对属性取值的时候 会走get方法，把watcher收集到dep里面--依赖收集
      if (Dep.target) {
        // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
        dep.depend();
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      // 如果赋值的新值也是一个对象  需要观测
      observe(newValue);
      value = newValue;
      // 当属性更新的时候，会走set方法，需要告诉当前的属性存放的watcher执行
      dep.notify();
    },
  });
}
```

## 更新Watcher类
```js
// src/observer/watcher.js

import { pushTarget, popTarget } from "./dep";

// watcher实例的id  每次new Watcher都会自增
let id = 0;

export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    // this.vm = vm;
    // this.exprOrFn = exprOrFn;
    // this.cb = cb;
    // this.options = options;
    // this.id = id++; 
    this.deps = []; 
    this.depsId = new Set(); //用来去重dep

    // this.getter = exprOrFn;
    // 实例化就会默认调用get方法
    // this.get();
  }
  get() {
    // 在调用getter之前先把当前watcher实例放在Dep.target上
    pushTarget(this);
    //如果是渲染watcher 那么就相当于执行 vm._update(vm._render())，这个方法在render函数执行的时候会去vm上取属性值，就会触发definedReactive的get方法，Dep.target上有值，就会做依赖收集
    // this.getter();
    // 之后重置Dep.target属性的值
    popTarget(); 
  }
  //  把dep放到deps里面 同时做去重处理，同样的  同一个watcher也只会保存在dep一次
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      //  直接调用dep的addSub方法  把当前watcher实例添加到dep的subs容器中
      dep.addSub(this);
    }
  }
  // 数据更新之后，会循环执行watcher，执行update方法，更新视图。
  update() {
    this.get();
  }
}
```

## 更新Dep类

```js
// src/observer/dep.js


let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 存放watcher
  }
  // definedReactive的get方法中会调用此方法
  depend() {
    // Dep.target有值时代表有watcher，需要做双向收集
    if (Dep.target) {
      // watcher的addDep会做去重处理，
      Dep.target.addDep(this);
    }
  }
  // 收集watcher
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 数据更新时会调用，循环watcher执行update方法
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}

// Dep类的静态属性，只有一个
Dep.target = null;

export function pushTarget(watcher) {
  Dep.target = watcher;
}

export function popTarget() {
  Dep.target = null;
}

export default Dep;
```
::: tip 
此时对象的依赖收集已经完成了，但是对于数组类型的值，走的不是`defineReactive`方法，所以还需要对数组类型的数据做额外的处理，让数组也进行依赖收集。
:::

## 数组的依赖收集
```js
import { isObject } from "../utils";

export function observe(data) {
  // 如果是对象才观测
  if (!isObject(data)) {
    return;
  }
  if (data.__ob__) {
    return data.__ob__;
  }
  // 默认最外层的data必须是一个对象
  return new Observer(data);
}

function defineReactive(data, key, value) {
  // value有可能是对象
  let childOb = observe(value); // 对于属性值是对象的，也需要递归观测
  // let dep = new Dep(); 

  Object.defineProperty(data, key, {
    get() {
      // if (Dep.target) {
        // dep.depend(); 

        // childOb（Observer实例）有值就代表value可能是数组，可能是纯对象
        if (childOb) {
          //对于 { arr:[1,2,4] } ，数组[1,2,4]的dep也需要收集watcher
          childOb.dep.depend();
          // 对于[1,2,4,[5,6,7]]这种多维数组，我们需要循环收集watcher
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }

      }
      // return value;
    },
    // set(newV) {
    //   if (newV !== value) {
    //     observe(newV);
    //     value = newV;
    //     dep.notify();
    //   }
    // },
  });
}

// 对于属性的值是多维数组的，需要递归收集watcher
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    // current是数组里面的数组 [[[[[]]]]]
    let current = value[i]; 
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}
```
::: tip 数组的依赖收集
对于属性值是数组的数据，我们还需要数组的`dep`对`watcher`做依赖收集，这样的话，调用数组变异方法修改数组时，就能触发数组的`dep`循环执行`watcher.update`方法更新视图。对于数组中嵌套数组的（多维数组），还需要递归收集`watcher`，这样才能在只修改内部数组时，也触发视图更新。
:::

## 数组的派发更新
```js
// src/observer/array.js

methods.forEach((method) => {
  arrayMethods[method] = function(...args) {
    /* 
    const res = oldArrayPrototype[method].call(this, ...args);
    let ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    if (inserted) ob.observeArray(inserted); 
    
    */

    // 数组改变，触发视图更新
    ob.dep.notify()
    return res
  };
});
```