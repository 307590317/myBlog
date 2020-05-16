---
title: Vue核心
sidebarDepth: 0
---
[[toc]]
# Vue
::: tip
渐进式框架
声明式渲染（无需关心如何实现）、组件化开发、客户端路由（`vue-router`）、大规模的数据状态（`vuex`）、构建工具（`vue-cli`）
全家桶：`vue.js` + `vue-router` + `vuex+vue-cli` + `axios`
:::
## Vue核心知识点
>数据驱动(主要操作的是数据)
>
>数据变化会导致视图自动更新
>
>组件化开发
## 框架的模式
::: tip 模式
- `MVC`单向的数据绑定
  - 只能通过改变数据来改变视图
  - <img :src="$withBase('/assets/vue-1-1.png')" alt="vue-1-1">

`MVVM` 双向的数据绑定
- 视图发生改变，数据也会跟着变
- 数据发生改变，视图也会跟着改变 
:::

## vue的使用方式
>1、采用cdn：`<script src="https://unpkg.com/vue"></script>`
>
>2、在需要的项目中安装`vue`模块 `npm install vue`，安装之后导入`vue.js`文件 
### 跑环境
>初始化`package.json`文件，在项目中执行`npm init -y`可自动生成一个默认的`package.json`文件；
>
>由于项目依赖的模块较大，每次上传下载同步都很浪费时间，所以我们只需要上传`package.json`文件，里面写了所有的依赖模块，我们同步下来之后只需要在需要的项目中打开`cmd`窗口执行`npm install`，就可以把项目依赖的模块下载到；

## vue的双向数据绑定原理
::: tip 双向绑定原理
`Vue`采用数据劫持+发布订阅的方式来实现 数据的双向绑定。

先使用`Object.defineProperty`方法劫持数据的`get`和`set`属性（`get`用来依赖收集，`setter`用来派发更新），当数据发生变化时，通过发布订阅模式来通知订阅者，触发对应的监听回调。
```js
	let  obj = {name:'zhufeng',age:9};//数据
  let temp = {name:"lily"};//借助中间对象
  let input1 = document.getElementById("box2");//视图
  //对某一个对象使用了Object.defineProperty方法之后就要写对应的get和set方法了，不然无法像操作普通对象一样访问或者设置它的属性
  //此方法不兼容IE8及以下
  Object.defineProperty(obj,"name",{
    configurable:true,//属性是否可删除
    writable:false,//属性是否可修改
    enumerable:false,//属性是否可枚举
    get(){//获取obj的属性名对应的属性值时会调用该方法
      /*2*/ return temp['name'];
    },
    set(val){//设置obj的属性名对应的属性值时会调用此方法
      //实现视图变化数据跟着变：分两步，上面get中的为第二步（即再次读取的时候会调用get方法得到之前设置的值，以此来实现动态改变）
      //由于直接写obj.name = this.value;会导致循环调用set方法，所以要借助中间对象的形式把值赋给中间对象，获取obj.name的时候我们获取中间对象的最新值即可
      /*1、*/ temp.name=val;
      //实现数据变化视图改变
      input1.value=val;
    }
  });
  //为了初始化的时候让视图中（文本框中）有值：出现obj.name说明要访问这个属性就会用到defineProperty中的get方法
  input1.value=obj.name;
  //实现视图改变数据跟着改变
  input1.addEventListener("input",function(){
    obj.name = this.value;//当值变化时会调用set方法
	},false);
```
:::
## vue的生命周期与钩子函数
::: tip 生命周期
- `beforeCreate`：`el` 和 `data` 并未初始化 （此方法不常用）

- `created`：执行此方法时已经，完成了 `data` 数据的初始化，`el` 的初始化未完成。常在这个钩子函数中 发送`ajax`来获取数据
- `beforeMount`：（执行此方法时已经完成了 `el` 和 `data` 初始化 （已经赋予了对应的值））
  - 渲染`DOM`之前先确认下是否有要编译的根元素（有无`el`属性），有才继续确认是否具有模板属性`template`,如果有模版属性，则会用`template`的值替换掉HTML中的结构，`template`模版中只能有一个根元素（而且不能是文本）；
- `mounted`：（执行此方法时代表已经挂载结束了）
  - 把编译好的数据挂载到`DOM`元素上，最后渲染成真实的`DOM`元素；真实`DOM`已经渲染完成，可以操作`DOM`了
- `beforeUpdate`：当页面依赖的数据更改之后触发（此时`DOM`结构还没有重新加载）
- `updated`：`DOM`结构重新加载之后触发

调用`vm.$destroy()`之后触发下面两个事件：
- `beforeDestroy`：实例销毁之前调用。在这一步，实例仍然完全可用。（可在此处清除定时器，清除事件绑定）
- `destroyed`：`Vue` 实例销毁后调用。调用后，`Vue` 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。（意义不大）
:::
## 初始化vue时传入对象中的属性
### `el`
>表示`vue`的属性和方法对哪个`DOM`根元素起作用（对它的后代元素也起作用）
### `data` 
>`data`中的内容表示需要双向绑定时用到的数据，写在`data`中的属性都会挂载到当前`Vue`的实例上；（可以直接用`vm.msg`来调用）；
### `methods` 
::: tip
`methods`中的方法也将挂载到`Vue`的实例上。可以直接通过`vm`实例访问这些方法，或者在指令表达式中使用。方法中的 `this` 自动绑定为 `Vue`的实例。

在*指令表达式中*使用方法的时候，如果方法名后面不写括号，则会默认传入事件对象`MouseEvent`。写括号代表要传递参数，而不是直接执行，要手动传入事件对象`$event`。

*注意：*
- 1、`methods`中的方法名不能和`data`中的变量名一样，因为都会挂载到`vue`的实例上，重名会报错
- 2、不应该使用箭头函数来定义`method`中的方法，因为使用箭头函数会改变函数中的`this`，而我们要保证方法中的`this`都是`vue`的实例
- 3、`{{}}`中执行`method`中的方法，方法后面必须要加`()`，才代表执行
:::
### `filters`
::: tip
允许你在`filters`中定义自己的过滤器，可被用于一些常见的文本格式化。过滤器可以用在两个地方：双花括号中和 `v-bind` 表达式 (后者从 2.1.0+ 开始支持)。过滤器应该被添加在 `JavaScript` 表达式的尾部，由“管道”符号“`｜`”来指示；

*注意:*
- 1、`filters`方法中的`this`都是`window`
- 2、`｜` 后面的方法执行的时候，会默认的把 `｜`之前的值当作第一个参数传递给`｜`后面的方法 ;
- 3、`filters`中的方法在`{{}}`中执行的时候，可以不写括号；
```html
	<!-- 在双花括号中 -->
	{{ message | toFixed(2)}} toFixed方法执行时不改变原数据，只是改变message的显示效果
	<!-- 在 `v-bind` 中 -->
	<div v-bind:id="rawId | toFixed"></div>
```
```js
filters: {
  toFixed(val,pra){
    return '￥'+val.toFixed(pra);
  }
}
```
:::
### `computed`
>计算属性（会有缓存），不是方法：某一个属性的值依赖于其他值的改变而改变时，可使用`computed`，把需要绑定的属性写在`computed`中，只会跟依赖的值产生关系。属性中默认会有`set`和`get`方法，如果把计算属性写成函数，则默认只调用`get`方法（`get`方法必须要有返回值）；`computed`不支持异步；
### `watch`
>监听属性（默认只监控所给属性的第一层）：`watch`中的方法名应该与`data`中的要监听的属性名相同。只有当 *监听的值发生变化* 的时候才会触发对应的方法；`watch`支持异步，当需要异步的时候，`watch`还支持设置中间状态；
>
>如果想要深度监控，则需要写为对象的形式，并且修改`deep：true`来实现深度监控，还可以添加`immediate:true`属性，`immediate`的作用：在第一次绑定的时候就会触发`watch`监听；
### computed 与 method 的区别
::: tip
- 1、缓存：计算属性会根据依赖的属性（归`vue`管理的数据，可以响应式的变化）进行缓存，只有在它的相关依赖发生改变时才会重新求值；
- 2、在`{{}}`中使用的时候，方法名后必须要加`()`来执行，而计算属性如果不需要传递参数，则不需要写`()`；
- 3、方法是不管数据有没有发生改变，都会重新计算，且`get`方法必须有返回值；
:::
### 什么时候用computed什么时候用watch
::: tip
当数据依赖于多个值的改变而改变时，我们就需要用`computed`；
```html
<div id="app">
    <input type="text" v-model="val"> {{fullName}}
</div>
```
```js
let vm = new Vue({
  el:'#app',
  data:{
    val:'',
    firstName:'zhaoyu',
    lastName:'zy'
  },
  computed:{
    fullName(){
      //只要依赖的其中一个值改变，就会执行此方法；
      return this.firstName+this.val+this.lastName;
    }
  }
});
```
当监听的值发生改变的时候，数据需要跟着变，就要用`watch`，需要异步操作的时候，就必须用`watch`
```js
let vm = new Vue({
  el:'#app',
  data:{
    val:'',
    firstName:'zhaoyu',
    lastName:'zy',
    fullName:''
  },
  watch:{
  //val的值改变了才会触发下面的方法,而且会默认传入两个参数，新的值和老的值
    val(newV,oldV){
      this.fullName = this.firstName+this.val+this.lastName;
    }
  //如果写成一个函数的形式（如上的形式），则只会监控第一层级属性对应的值，第一层级的值发生改变才会触发函数执行；如果要实现深度监控，则要写成如下对象的形式,将deep深度监控属性赋值为true；
    val:{
    //监控时发生改变就会触发此方法，方法名必须是handler
      handler(newV){
        localStorage.setItem('todo',JSON.stringify(newV));
      },
      deep :true,
      immediate: true //第一次绑定的时候就触发watch 
    }
  }
});
```
`{{}}`：其中可放表达式、可以放赋值运算、计算、三元运算符（尽量少写逻辑运算）
:::
## vue的实例拥有的属性
::: tip vue实例属性
此处的`this`是`vue`的实例
- `this.$data` vm上的响应式的数据，是个对象
- `this.$watch` 监控data中的数据，在变化时可执行对应的回调函数
- `this.$el` 挂载的`DOM`根元素
- `this.$set` 后加的属性实现响应式变化的方法
- `this.$nextTick(()=>{})`  异步方法，渲染`DOM`完成后获取到需要的最新的数据
- `this.$refs.xxx` 获取`ref`值为`xxx`的`vue`对象（可通过`this.$refs.xxx.$el`获取`DOM`元素）（通过`v-for`循环出来的可以获取多个，否则只能获取一个）
```html
	<!-- 尽管有 prop 和 事件，但是有时仍然需要在 JavaScript 中直接访问子组件。为此可以使用 ref 为子组件指定一个引用的值。如： -->
	<div id="parent">
		 <user-profile ref="profile"></user-profile>
	</div>
```
*注意*：`DOM`渲染是异步的，如果数据变化后想要获取最新的真实`dom`中的内容，需要等待页面渲染完成后再去获取，所有的`DOM`操作最好放在`nextTick`方法中异步来获取最新的`DOM`;
:::
### 为什么data中的属性会出现响应式的变化?
::: tip data 数据的响应式
`vue`会循环`data`中的属性，依次增加`getter`和`setter`方法，来实现响应式的变化。（只要是初始化时`data`中存在的属性都会被增加`getter`和`setter`方法，后来添加的属性不会实现双向数据绑定。下面的例子中属性`a`中没有`school`属性，所以修改`vm.a.school`的属性值不会导致视图刷新。）

使用`this.$set`可以给对象或数组添加响应式的数据变化例如：
- `this.$set(this.a,'school',1)`
```js
let vm=new Vue({
  el:'#app-3',
  data:{
    msg:'zhufeng'，
    a:{}
  }
  methods:{}
});
```
```html
<!-- 页面中使用 -->
<div id="app">
{{a.school}}
</div>
```
:::
## `jQuery` 和 `Vue` 的区别
>jQuery通过选择器来获取DOM对象并对其进行赋值、取值、绑定事件等操作，其数据和视图是在一起的。而Vue通过Vue对象将数据和视图分离开来。对数据进行操作不需要引用DOM对象，而其内部又实现了数据的双向绑定，我们只需要关注数据的变化即可，这就是MVVM模式。

## `Vue3.0` 为什么放弃了 `Object.defineProperty` 而采用了 `Proxy`?
>`Object.defineProperty`只能劫持对象的属性，因此我们需要对每一个对象的属性都依次遍历。在`Vue 2.x`中，是采用 递归+遍历的方式来实现对数据的监控的，如果属性值也是对象，则需要进行深度遍历，显然，如果能劫持一个完整的对象才是更好的选择。`Proxy`可以劫持完整的对象，并返回一个新的对象。`Proxy`不仅可以代理对象，还可以代理数组。