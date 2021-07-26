---
title: SSR(服务器渲染)
sidebarDepth: 0
tags:
  - SSR
---

[[toc]]
# SSR(服务器渲染)
>`SSR`: 服务端渲染 在`node`端对`vue`页面进行渲染`HTML`文件 返回给浏览器

## SSR优点
> `SEO` : 不同于`SPA`的`HTML`只有一个无实际内容的`HTML`和一个`app.js`，`SSR`生成的`HTML`是有内容的，这让搜索引擎能够索引到页面内容。
>
>更快内容到达时间 传统的`SPA`应用是将`bundle.js`从服务器获取，然后在客户端解析并挂载到`dom`。而`SSR`直接将`HTML`字符串传递给浏览器。大大加快了首屏加载时间。

## SSR原理
::: tip 
在打包的时候会打包出来两套代码，一套客户端代码，一套服务端代码，服务端的`html`模板有对应的占位符(`<!--vue-ssr-outlet-->`)，以便渲染完成之后替换掉占位符，生成完整的`HTML`文件。
服务端打包出的文件不需要引入打包出的`js`，需要用`excludeChunks`排除`js`。
服务端打包出的`server.boundle.js`是用来给`node`端读取(`fs.readFileSync`)字符串来生成完整的`HTML`页面的，所以打包的时候写配置`target:"node"`，以及`output:{ libraryTarget:'commonjs2' }`。

客户端激活`js`:需要在根元素上写一个`id='app'`，以便客户端执行注入的`js`时能找到对应挂载的节点。
客户端注入`js`:通过`html-webpack-plugin`这个插件，在`webpack.server.js`中配置插件的`client`字段路径为客户端打包出来的`client.boundke.js`，然后需要在服务端的`html`里采用`ejs`的方式写一个`script`，
`<script src="<%=htmlWebpackPlugin.options.client%>"><script>`,这样在`webpack`打包完成后，就会自动把`src`的值替换为`html-webpack-plugin`插件`client`的值。
:::