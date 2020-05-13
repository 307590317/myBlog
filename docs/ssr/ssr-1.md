---
title: nuxt
sidebarDepth: 0
tags:
  - SSR
---
[[toc]]
# nuxt(基于vue 的服务器渲染 框架)

## `nuxt.js(vue ssr)`
::: tip 特点
- 1. 基于 `Vue.js`
- 2. 自动代码分层
- 3. 服务端渲染
- 4. 强大的路由功能，支持异步数据
- 5. 静态文件服务
- 6. `ES6/ES7` 语法支持
- 7. 打包和压缩 `JS `和 `CSS`
- 8. HTML头部标签管理
- 9. 本地开发支持热加载
- 10. 集成`ESLint`
- 11. 支持各种样式预处理器： `SASS、LESS、 Stylus`等等
:::

## `nuxt` 安装

### 安装`vue-cli`(脚手架)

```sh
npm install vue-cli -g

vue -V 查看安装状态
```

### 使用vue安装nuxt

```sh
vue init nuxt/starter demo
```

### 安装依赖

```sh
cnpm install
```

### 启动

```sh
npm run dev
```



## nuxt配置项

### 配置IP和端口
>`/package.json`

```json
"config":{
  "nuxt":{
    "host":"127.0.0.1",
    "port":"1818"
  }
}
```

### 配置全局CSS
>`/assets/css/normailze.css`
```css
html{
  color:red;
}
```
>`/nuxt.config.js`
```sh
css:['~assets/css/normailze.css']
```
### 配置 `webpack` 的 `loader`
>`nuxt.config.js`里是可以对`webpack`的基本配置进行覆盖的
>
>`url-loader`来进行小图片的64位打包。就可以在`nuxt.config.js`的`build`选项里进行配置。

```js
build: {
  loaders:[
    {
      test:/\.(png|jpe?g|gif|svg)$/,
      loader:"url-loader",
      query:{
        limit:10000,
        name:'img/[name].[hash].[ext]'
      }
    }
  ],
  /*
  ** Run ESLint on save
  */
  extend (config, { isDev, isClient }) {
    if (isDev && isClient) {
      config.module.rules.push({
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /(node_modules)/
      })
    }
  }
}
```

## `Nuxt` 的路由配置和参数传递

### 路由跳转 1
```sh
pages ----- 创建文件 自动匹配添加路由(不推荐)
about/index.vue
home/index.vue
```
```vue
<template>
  <div>
    <h2>News Index page</h2>
      <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">Home</a></li>
    </ul>
  </div>
</template>
```

### 路由跳转2 `nuxt-link`
```sh
pages ----- 创建文件 自动匹配添加路由（尽可能使用）

about/index.vue

home/index.vue
```
```vue
<template>
  <div>
    <h2>News Index page</h2>
      <ul>
      <li><nuxt-link :to="{name:'index'}"></nuxt-link></li>
      <li><nuxt-link :to="{name:'about'}"></nuxt-link></li>
    </ul>
  </div>
</template>
```

### 传递参数

```vue
<template>
  <div>
    <ul>
      <li><nuxt-link :to="{name:'news',params:{newsId:3306}}">NEWS</nuxt-link></li>
    </ul>
  </div>
</template>
```
### 接收参数

```vue
<template>
  <div>
    <h2>News Index page</h2>
    <p>NewsID:{{$route.params.newsId}}</p>
      <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </div>
</template>
```

## `nuxt`动态路由和参数校验

### 动态路由
```sh
_id.vue的文件，以下画线为前缀的Vue文件就是动态路由，

/pages/news/_id.vue 
```
### 路由模板

```vue
<template>
  <div>
    <h2>News-Content [{{$route.params.id}}]</h2>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </div>
</template>
```

### 传递参数

```vue
<template>
  <div>
    <h2>News Index page</h2>
    <p>NewsID:{{$route.params.newsId}}</p>
      <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/news/123">News-1</a></li>
      <li><a href="/news/456">News-2</a></li>
      <li><nuxt-link :to="{name:'news-id',params:{id:39}}">News-2</nuxt-link></li>
    </ul>
  </div>
</template>
```

```js
//动态参数校验
export default {
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)  //只能是数字，如果不是数字，跳转到nuxt提起准备的404页面
  }
}
```

## Nuxt的路由动画效果

### 全局动画
::: tip 透明过渡效果
`/assets/css/main.css(没有请自行建立)`
```css
.page-enter-active, .page-leave-active {
  transition: opacity 2s;
}
.page-enter, .page-leave-active {
  opacity: 0;
}
```

`nuxt.config.js`里加入一个全局的`css`文件

```js
css:['assets/css/main.css']  // 链接按钮需要设置为:<nuxt-link>
```
:::

### 单独设置页面动画效果
::: tip
`/assets/css/main.css(没有请自行建立)`
```css
.test-enter-active, .test-leave-active {
  transition: all 2s;
  font-size:12px;
}
.test-enter, .test-leave-active {
  opacity: 0;
  font-size:40px;
}
```

```js
export default {
  transition:'test'
}
```
:::
## `Nuxt` 的默认模板和默认布局

### 默认模板
::: tip 创建默认模板
在根目录创建`app.html`，在`nuxt.config.js`里面`header`配置项目。可以设置
每个页面上都加入`JSpang.com` 这几个字。可以使用默认模板

```html
<!DOCTYPE html>
<html lang="en">
<head>
  {{ HEAD }}
</head>
<body>
  <p>jspang.com 技术胖的博客</p>
  {{ APP }}
</body>
</html>

<!-- {{HEAD}} 读取的是nuxt.config.js信息 -->
<!-- {{APP}} 读取的是pages文件夹下的主体页面 -->
```
:::

### 创建默认布局
::: tip 创建默认布局
位置:根目录下的`layouts/default.vue`。

不需要添加头部信息，只是关于`template`标签内容

```vue
<template>
  <div>
    <p>JSPang.com  技术胖的博客</p>
    <nuxt/>
  </div>
</template>
```

`<nuxt/>`就相当于每个页面的内容，把通用的样式放入这个默认模板里面

*总结*：要区分默认模版和默认布局的区别，模版可以订制很多头部信息，包括IE版本的判断；模版只能定制`里的内容，跟布局有关系。在工作中修改时要看情况来编写代码。
:::

## nuxt 404页面和个性 `meta` 设置

### 错误页面
>`layouts/error.vue` 文件

```vue
<template>
  <div>
    <h2 v-if="error.statusCode==404">404页面不存在</h2>
    <h2 v-else>500服务器错误</h2>
    <ul>
        <li><nuxt-link to="/">HOME</nuxt-link></li>
    </ul>
  </div>
</template>
<script>
export default {
  props:['error'],
}
</script>
```

### 个性 `meta` 设置
::: tip 点击页面链接修改
`/pages/news/index.vue`
```html
<li><nuxt-link :to="{name:'news-id',params:{id:123,title:'jspang.com'}}">News-1</nuxt-link></li>
```

根据接收值变成独特的`meta`和`title`标签

`/pages/news/_id.vue`

```html
<template>
  <div>
    <h2>News-Content [{{$route.params.id}}]</h2>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </div>
</template>
<script>
export default {
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  },
  data(){
    return{
      title:this.$route.params.title,
    }
  },
//独立设置head信息
  head(){
    return{
      title:this.title,
      meta:[
        {hid:'description',name:'news',content:'This is news page'}
      ]
    }
  }
}
</script>
```
*注意*：为了避免子组件中的`meta`标签不能正确覆盖父组件中相同的标签而产生重复的现象，建议利用 hid 键为`meta`标签配一个唯一的标识编号。
:::
## `asyncData` 方法获取数据
```html
<template>
  <div>
    <h1>姓名：{{info.name}}</h1>
    <h2>年龄：{{info.age}}</h2>
    <h2>兴趣：{{info.interest}}</h2>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  data(){
    return {
      name:'hello World',
    }
  },
  async asyncData(){
    let {data}=await axios.get('https://api.myjson.com/bins/8gdmr')
    return {info: data}  //不能使用This.info
  }
}
</script>
```

## 静态资源和打包
>图片资源库 放在`static`中

### 直接引入图片
>`<div><img src="~static/logo.png" /></div>`

### CSS引入图片
```css
<style>
  .diss{
    width: 300px;
    height: 100px;
    background-image: url('~static/logo.png')
  }
</style>
```
### 打包
>`npm run generate`
>
>然后在`dist`文件夹下输入`live-server`就可以了。

## 预处理less
> 安装需要的loader后指定lang就可以直接使用
>
>`npm i less less-loader --save--dev`
```js
//  全局css
css: [
  {
    src: 'static/less/base.sass',
    lang: 'less'
  }
],
// 页面中使用
<style lang="less" scoped></style>

```

[详细链接](https://www.cnblogs.com/buzhiqianduan/p/7922525.html)