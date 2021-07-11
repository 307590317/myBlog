---
title: Vuex源码解析
sidebarDepth: 0
---

[[toc]]

# Vuex 源码解析

::: tip vuex
`vuex`作为一个全局状态管理器，采用集中存储管理所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。数据流的变动非常清晰， 此篇讲了`vuex`的原理，`vuex`单向数据流的模式，以及`vuex`中的状态是如何变成响应式的。
:::

```vue
<!-- src/app.vue -->
<template>
  <div id="app">
    我的名字 {{ this.$store.state.name }} 我的年龄 {{ this.$store.state.age }}
    <br />
    我的年龄是 {{ this.$store.getters.myAge }} <br />
    我的年龄是 {{ this.$store.getters.myAge }}
    <button @click="$store.commit('changeAge', 10)">更改年龄+10</button>
    <button @click="$store.dispatch('changeAge', 20)">异步年龄+20</button>
  </div>
</template>
<script>
export default {
  name: "app",
};
</script>
```

```js
// src/store/index.js

import Vue from "vue";
import Vuex from "./vuex";

Vue.use(Vuex);

let store = new Vuex.Store({
  state: {
    // state = > data
    name: "mrzhao",
    age: 20,
  },
  mutations: {
    // method  commit 同步更改状态
    changeAge(state, payload) {
      state.age += payload;
    },
  },
  actions: {
    // 异步操作 调用api接口 dispatch， 多次commit mutation
    changeAge({ commit }, payload) {
      setTimeout(() => {
        commit("changeAge", payload);
      }, 1000);
    },
  },
  getters: {
    // 计算属性
    myAge(state) {
      return state.age + 10;
    },
  },
  strict: true, // 如果不是在mutation中操作的状态会发生警告
});

export default store;
```

```js
// src/main.js
import Vue from "vue";
import App from "./App.vue";
import store from "./store";

Vue.config.productionTip = false;

// 所有组件都能执行的方法 Vue.mixin({beforeCreate}), 拿到store挂载到自己的身上
let vm = new Vue({
  name: "root",
  store, // 此store的目的是让所有组件都能访问到store对象
  render: (h) => h(App),
}).$mount("#app");
```

::: tip
在使用`vuex`时，通过`Vue.use`方法将`vuex`当成插件来调用。然后初始化一个全局的`store`，挂载到`vue`的根节点上，这样就能在所有的`vue`组件上拿到`store`了。下面是实现原理。
:::

## install 初始化函数

::: tip install
通过`Vue.use(vuex)`的方式来调用`vuex`时，就说明传入的`vuex`要么有`install`方法，则调用`install`方法。要么本身就是一个函数，则直接执行函数
:::

```js
// src/vuex/install.js
export let Vue;
// vue.use在调用时，会执行插件的install方法注册插件，并向install方法传递Vue对象作为第一个参数
function install(_Vue) {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      // 获取根组件上的store 将他共享给每个组件
      let options = this.$options;
      if (options.store) {
        // 根组件
        this.$store = options.store;
      } else {
        // 子组件则从父组件上拿到全局的store
        if (this.$parent && this.$parent.$store) {
          this.$store = this.$parent.$store;
        }
      }
    },
  });
}
// 父  this.$store -》 子 this.$store -》孙子 this.$store
export default install;
```

::: tip stroe 的注入
`install`中通过`Vue.mixin`方法在`beforeCreate`这个生命周期中注入`store`，将`$store`放在根组件上，子组件通过`$parent`的方式拿到父组件上的`$store`，这样就能让每个组件都能拿到全局的`store`
:::

## Store 核心类

```js
// src/vuex/store.js
class Store {
  constructor(options) {
    // 拿到用户传的各个值，没有的话默认值为对象
    let { state = {}, getters = {}, mutations = {}, actions = {}, strict } = options;
  }
}
```
### state响应式的实现
```js
// src/vuex/store.js
import { Vue } from './install'

class Store {
  constructor(options) {
    let { state = {}, getters = {}, mutations = {}, actions = {}, strict } = options;
    // 通过vue实例的data是响应式的来实现state的响应式
    // this表示当前Store的实例，比如 $store
    this._vm = new Vue({
      // 因为要全局使用，所以不需要写成函数的形式
      data : {
        // $符开头的数据不会被挂载到实例上，但是会挂在到当前的_data上，减少了一次代理，取值时可以直接this._vm._data.$$state来取值
        $$state: state
      }
    })
  }
  // 通过$store.state时就会走下面的方法
  get state(){
    return this._vm._data.$$state
  }
}

export default Store;
```
::: tip state的响应式
通过`vue`组件中`data`数据是响应式数据的原理，`new Vue`生成一个`vue`实例`_vm`，将用户传入的`state`放在`_vm`的`data`属性上。编写`state()`方法，当在页面中通过`$store.state.xxx`取值时，就到对应的`_vm._data.$$state`上去取值。以此来实现`state`的响应式
:::

### getters

::: tip getters
`getters`相当于一个计算属性
:::
会 new Vue 来生成一个 vue 实例 vm，通过 vm 来实现 state 和 getters 的响应式
通过将 state 放在 vm 的 data 上来实现响应式的原理。
通过将 store 的 getters 中的方法放在 vm 的 computed 上来实现计算属性，当在页面中调用 getters 中的方法时 ，需要去 computed 上取值（走代理去 vm 上取对应的计算属性）。
