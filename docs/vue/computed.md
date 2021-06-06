---
title: Vue 计算属性(computed)源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 计算属性(computed)源码解析

```html
<div id="app">{{fullName}}</div>

<script>
  const vm = new Vue({
    el: "#app",
    data: {
      age: 100,
      firstName: "guo",
      lastName: "mei",
    },
    computed: {
      // 相当于 Object.defineProperty 中的 getter，不取值不会执行
      fullName: {
        get() {
          console.log("取值");
          return this.firstName + this.lastName;
        },
        set(newValue) {
          console.log(newValue);
        }
      }
    }
  })

  console.log(vm.fullName)
  console.log(vm.fullName)
  setTimeout(() => {
    vm.firstName = "su";
    console.log(vm.fullName);
  }, 1000);
</script>
```

::: tip computed
1、计算属性默认不会执行，只有获取计算属性的值的时候才会执行，相当于`Object.defineProperty`中的`getter`方法。
2、计算属性(`computed`)会对最终的返回值进行缓存，取值时不是每次取值都重新执行，只有依赖的值产生变化时才会重新执行，获取新的值。

计算属性也可以写成函数，或者写成对象`(get、set)`的形式
:::

## 计算属性的初始化

```js
// src/state.js
import Watcher from "./observer/watcher";

export function initState(vm) {
  // 状态的初始化
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
}

function initComputed(vm, computed) {
  const watchers = (vm._computedWatchers = {});
  for (let key in computed) {
    // useDef可能是 函数、对象
    let useDef = computed[key];
    let getter = typeof useDef === "function" ? useDef : useDef.get;
    // 将计算属性watcher存起来，以便后面做缓存的时候使用
    watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true });
    // 将key定义在vm上才能在页面上直接使用 {{fullName}}
    defineComputed(vm, key, useDef);
  }
}

const shardProperty = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {},
};

function defineComputed(vm, key, useDef) {
  if (typeof useDef === "function") {
    shardProperty.get = createComputedGetter(key);
  } else {
    shardProperty.get = createComputedGetter(key);
    shardProperty.set = useDef.set;
  }
  Object.defineProperty(vm, key, shardProperty);
}
```

::: tip cumputed
`initState`的时候如果`cumputed`属性存在，会调用`initComputed(vm, cumputed)`初始化属性，根据属性创建`watcher`，将`watcher`保存在`vm`实例的`_computedWatchers`属性上，以便后面做缓存使用。

`defineComputed`的作用
1、把`cumputed`的属性都挂载到`vm`实例上，这样才能在模板上使用，或者通过`vm`来调用。
2、拦截计算属性的`get`方法，判断是否需要重新取值。
:::

## createComputedGetter

```js
// src/state.js
function createComputedGetter(key) {
  return function() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // 如果其他的属性值改变了，则重新取值（其他值改变后，dirty会变为true）
      if (watcher.dirty) {
        watcher.evaluate();
      }

      return watcher.value;
    }
  };
}
```

::: tip createComputedGetter
`createComputedGetter`是主要的判断计算属性是否需要重新取值的方法，当`watcher`的`dirty`属性为`true`，代表计算属性需要重新取值。
:::

## 多个watcher的收集(dep升级)

```js
// src/observer/dep.js

// 最初采用Dep.target来存放watcher，这样只能存一个
Dep.target = null;

// 增加栈结构存放多个watcher
let stack = [];

export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1]; // 取栈中最后一个watcher（上一个Dep.target的watcher）
}
```
::: tip
最初只有渲染`watcher`，所以不需要栈结构。当计算属性`watcher`引入后，计算属性依赖的值不只要收集计算属性`watcher`，还要收集渲染`watcher`，以便依赖值更新后通知渲染`watcher`更新视图对计算属性重新取值。此时就需要引入栈结构来存放多个`watcher`。
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
    // this.user = !!options.user;
    this.lazy = !!options.lazy; // 是不是计算属性watcher
    this.dirty = this.lazy; //计算属性watcher的更新标识（true：需要更新，false：不更新）
    // this.cb = cb;
    // this.options = options;
    // this.id = id++;
    // this.deps = [];
    // this.depsId = new Set();

    // if (typeof exprOrFn == "string") {
    //   this.getter = function() {
    //     let path = exprOrFn.split(".");
    //     let obj = vm;
    //     for (let i = 0; i < path.length; i++) {
    //       obj = obj[path[i]];
    //     }
    //     return obj;
    //   };
    // } else {
    //   this.getter = exprOrFn;
    // }

    // 如果是计算属性watcher，默认不需要取值
    this.value = this.lazy ? undefined : this.get();
  }
  get() {
    pushTarget(this); // Dep.target = watcher
    const value = this.getter.call(this.vm); // render() 方法会去vm上取值 vm._update(vm._render)
    popTarget(); // Dep.target = null; 如果Dep.target有值说明这个变量在模板中使用了

    return value;
  }
  update() {
    // 计算属性依赖的值更新了会通知计算属性watcher更新
    // 如果是计算属性watcher，就把dirty改为true  代表计算属性需要重新取值
    if(this.lazy){
      this.dirty = true
    }else{
      queueWatcher(this);
    }
  }
  // 计算属性重新取值方法
  evaluate(){
    this.value = this.get()
    this.dirty = false
  },
  // 计算属性watcher存了依赖的属性的dep，当Dep.target上还有值时，需要依赖的值去收集渲染watcher
  depend(){
    let i = this.deps.length
    while(i--){
      this.deps[i].depend()
    }
  },
  // run() {
  //   let newValue = this.get();
  //   let oldValue = this.value;
  //   this.value = newValue;
  //   if (this.user) {
  //     if (newVal !== oldVal || isObject(newVal)) {
  //       this.cb.call(this.vm, newVal, oldVal);
  //     }
  //   } else {
  //     this.cb.call(this.vm);
  //   }
  // }
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

::: tip Watcher 改造
1、对计算属性`watcher(options.lazy = true)`增加`lazy、dirty`属性，`lazy`表示计算属性`watcher`，`dirty`表示计算属性`watcher`是否需要重新取值。计算属性`watcher`在初始化时是不需要调用`this.get`取值的
2、计算属性依赖的值更新了会通知计算属性`watcher`更新（`update`方法），此时需要把计算属性`watcher`的`dirty`设为`true`，这样下次计算属性取值时就会更新值。
3、`evaluate`：计算属性`watcher`更新值的方法
4、`depend`：计算属性`watcher`存了依赖的属性的`dep`，当`Dep.target`上还有值时，需要依赖的属性去收集渲染`watcher`
:::

## 再次修改 createComputedGetter

```js
// src/state.js
function createComputedGetter(key) {
  return function() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // if (watcher.dirty) {
      //   watcher.evaluate();
      // }

      // Dep.target存在则说明存在渲染watcher，计算属性依赖的值也需要收集渲染watcher，方便后续值改变了更新视图
      if (Dep.target) {
        watcher.depend();
      }
      // return watcher.value;
    }
  };
}
```

::: tip createComputedGetter
计算属性本身并没有走`observe`方法进行观测，所以并没有`dep`，并不会去收集渲染`watcher`。

计算属性依赖的值比如`firstName`，只会收集计算属性`fullName`的`watcher`，如果`firstName`没有取过值（`get`时才会做依赖收集），就不会收集渲染`watcher`。当`firstName`发生变化后，只会通知计算属性`watcher`调用`update`方法将`ditry`属性改为`true`，但是没有收集渲染`watcher`，不会触发视图更新，计算属性也就不会重新取值。

所以需要让依赖的属性也收集渲染`watcher`，依赖的值改变了之后不仅要通知计算属性`watcher`将`ditry`改为`true`，还需要通知渲染`watcher`更新视图，对计算属性`fullName`重新取值。

在计算属性首次取值时，会执行劫持后的`createComputedGetter`包装后的返回函数。对应的`watcher`的`dirty`属性为`true`，调用`evaluate`方法，内部会走`get`方法。此时依赖值将收集计算属性`watcher`，之后调用`popTarget`将`Dep.target`设为栈中上一个`watcher`。此时需要调用`watcher.depend`让依赖值收集渲染`watcher`。
:::
