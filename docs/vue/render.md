---
title: Vue 模板编译源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 模板编译源码解析

```html
<div id="app">{{age}}</div>

<script>
  const vm = new Vue({
    el: "#app",
    data: {
      name: 100,
    },
    // render(h) {
    //   return h('div',{id:'a'},'mrzhao')
    // },
    // template:`<div id="a">{{name}}</div>`
  });
</script>
```
::: tip
对于传入的`el`或者`template`属性，最后都会被解析成`render`函数，以便后面更新视图。
:::

## 处理 render 方法

```js
// src/init.js

import { initState } from "./state";

import { compileToFunction } from "./compiler/index";

export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    // el,data
    const vm = this
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
      options.render = render;
    }
    // options.render 就是渲染函数
    // 调用render方法 渲染成真实dom 替换掉页面的内容
  };
}
```

::: tip render
`initMixin`中会集中对`el`属性和`template`属性做处理，统一处理成`render`函数，方便后续更新视图时直接调用生成真实DOM，替换页面的内容
:::

## 核心方法compileToFunction
::: tip compileToFunction
`compileToFunction`方法是将模板转化成`render`函数的核心方法
:::
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

## 多个 watcher 的收集

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

在计算属性首次取值时，会走劫持后的`createComputedGetter`包装后的返回函数，对应的`watcher`的`dirty`属性为`true`，调用`evaluate`方法，内部会走`get`方法。此时依赖值将收集计算属性`watcher`，之后调用`popTarget`将`Dep.target`设为栈中上一个`watcher`。此时需要调用`watcher.depend`让依赖值收集渲染`watcher`。
:::
