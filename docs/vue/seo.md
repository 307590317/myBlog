---
title: Vue首屏渲染优化与SEO
sidebarDepth: 0
---

[[toc]]

# Vue首屏渲染优化与SEO

::: tip
对于展示类型的页面，可以使用`SSR`服务端渲染的方式来提高首屏加载的速度，以及`SEO`的优化，那么对于`SPA`类型的项目，如何提高首屏的加载速度以及`SEO`的优化呢
:::

## 路由懒加载
::: tip
在路由中采用懒加载的写法，。此方法会将懒加载的页面分成多个`js`打包，减小了单个文件的大小。`path`到对应的路由时，才会异步的加载对应的页面以及数据，这样可以提高首屏页面加载的速度，减少不必要的页面加载
:::

## 通过CDN引入第三方库
::: tip
项目开发中，会用到很多第三方库，如果可以按需引入，只引入自己需要的组件来减少所占的空间。但也会有一些不能按需引入，我们可以采用`CDN`外部加载，在`index.html`中从`CDN`引入第三方库（国内采用https://www.bootcdn.cn/）。通过`CDN`引入，可以通过CDN加速，获得更快的访问速度。目前采用引入依赖包生产环境的`js`文件加载，直接通过`window`可以访问暴露出的全局变量，不必通过`import`引入、`Vue.use`注册。
在`webpack`打包配置中添加`externals`字段在运行时去外部获取这些扩展依赖。`key`为依赖包的名称，`value`是源码抛出的全局变量。
```js
module.exports = {
  //...
  externals: {
    vue: 'Vue',
    vuex: 'Vuex',
    'vue-router': 'VueRouter',
    axios: 'axios',
    'element-ui': 'ELEMENT'
  },
};
```
:::

## 开启gzip压缩
::: tip
`gzip`压缩是一中`http`请求优化方式，通过减少文件体积来提高加载速度。`html、js、css`文件甚至`json`数据都可以用它压缩，可以减小60%以上的体积。前端配置`gzip`压缩，并且服务端使用`nginx`开启`gzip`，用来减小网络传输的流量大小。客户端和服务端必须共同支持`gzip`。前端压缩需要安装`compression-webpack-plugin`插件。
```js
// 在webpack中配置如下
// webpack.prod.config.js
const CompressionWebpackPlugin = require('compression-webpack-plugin')

plugins: [
  new CompressionWebpackPlugin({
    test: /\.js$|\.html$|\.css/, // 都压缩哪些文件
    threshold: 10240, // 
    deleteOriginalAssets: false // 不删除源文件，对于不支持的浏览器还会继续请求源文件
  })
]


// nginx启用gzip
// nginx -s reload ：修改配置后重新加载生效
http {
  gzip on; # 开启Gzip
  gzip_static on; # 开启静态文件压缩
  gzip_min_length  1k; # 不压缩临界值，大于1K的才压缩
  gzip_buffers     4 16k;
  gzip_http_version 1.1;
  gzip_comp_level 2;
  gzip_types     text/plain application/javascript application/x-javascript text/javascript text/css application/xml application/xml+rss; # 进行压缩的文件类型
  gzip_vary on;
  gzip_proxied   expired no-cache no-store private auth;
  gzip_disable   "MSIE [1-6]\.";
  // 其他配置....
}

``` 
:::

## SPA预渲染
::: tip
对于`spa`类的项目，要想更快的话，只有预渲染。需要用到`prerender-spa-plugin`。
预渲染原理：构建阶段生成匹配预渲染路径的`html`（写的每个需要预渲染的路由都有一个对应的`html`）。构建出来的`html`文件已有部分内容。

需要用到`prerender-spa-plugin`来做预渲染，它是一个`webpack`插件，用于在单页应用中预渲染静态`html`内容。

`prerender-spa-plugin`原理：在`webpack`构建阶段的最后，在本地启动`node`服务，启动`Puppeteer`，通过`Puppeteer`这个`node`提供的无头浏览器（没有用户界面的浏览器），提供的`API`来模拟用户访问需要预渲染的路由，`node`服务收到请求处理后并返回对应的页面，之后`Puppeteer`处理返回的页面并渲染，拿到最终渲染的页面内容并替换掉之前打包的`html`文件。

使用预渲染路由模式必须用`history`模式。因为`hash`不会被带到服务器，路由信息会丢失。

```js
// 在webpack中引入并使用
// webpack.prod.config.js
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

// 加到plugins对象中
// 预渲染配置
new PrerenderSPAPlugin({
  // 生成文件的路径，也可以与webpakc打包的一致
  // 这个目录只能有一级，如果目录层次大于一级，在生成的时候不会有任何错误提示，在预渲染的时候只会卡着不动。
  staticDir: path.join(__dirname, 'dist'),
  //必需，要渲染的路由。index有参数，就需要写成 /index/param1。
  routes: ['/login'],
  //必须，要使用的实际渲染器，没有则不能预编译
  renderer: new Renderer({
      inject: {},
      headless: false, //渲染时显示浏览器窗口。对调试很有用。  
      // 在 main.js 中 document.dispatchEvent(new Event('render-event'))，两者的事件名称要对应上。
      renderAfterDocumentEvent: 'render-event'
  })
})

// main.js
new Vue({
  router,
  store,
  render: h => h(App),
  mounted () {
    // 增加预渲染触发事件
    document.dispatchEvent(new Event('render-event'))
  }
}).$mount('#app')

// 如果用了`nginx`做代理，nginx还需要一些配置
location = / {
  try_files /home/index.html /index.html;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

**解决预渲染的`SEO`问题**

需要安装`vue-meta-info`包。
```shell
npm install vue-meta-info --save
```
在`main.js`中引入
```js
import MetaInfo from 'vue-meta-info'
Vue.use(MetaInfo)
```
然后在各个`vue`页面里面配置属于自己的`meta`标签
```vue
<script>
export default {
  // 配置title和meta数据
  metaInfo: {
    title: 'title',
    meta: [
      {
        name: 'keywords',
        content: '关键字'
      },
      {
        name: 'description',
        content: '描述'
      }
    ]
  },
  data () {
    return {}
  }
}
</script>
```
:::

