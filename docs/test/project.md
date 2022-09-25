---
title: 项目常用
sidebarDepth: 0
---
[[toc]]
# 项目常用

## 图片转 `base64`
```js

//网图转base64
function getBase64(url,cb) {
 var img = new Image();
  img.crossOrigin = 'Anonymous';//使用跨域图像
  img.onload = function() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = img.width, height = img.height;
    canvas.width = width;
    canvas.height = height;
    context.drawImage(img,0,0,width,height);
    var src = canvas.toDataURL("image/png");
    cb(src);
  };
  img.src = url;
}

//本地图片转base64
function getBase64(file,cb) {
 var reader = new FileReader();
 reader.onload = function(){
	 cb(this.result);
 }
 reader.readAsDataUrl(file);
}
```

## 上传图片前选择并预览
### `FileReader` 方法预览
```js
//本地图片转base64
function getBase64(file,cb) {
  var reader = new FileReader();
  reader.onload = function(){
    cb(this.result);
  }
  reader.readAsDataUrl(file);
}
```
### `createObjectURL` 方法预览
```js
function getObjectURL(file) {
	var url = null ;
  // 浏览器兼容处理
  if (window.createObjectURL != undefined) { // basic
    url = window.createObjectURL(file) ;
  } else if (window.URL != undefined) { // mozilla(firefox)
    url = window.URL.createObjectURL(file) ;
  } else if (window.webkitURL != undefined) { // webkit or chrome
    url = window.webkitURL.createObjectURL(file) ;
  }
  return url ;//转化出的图片为blob模式图片
}
```

## 发送数据埋点时为什么使用1×1像素的透明gif图？
::: tip
- 1、`gif`图片的体积最小
- 2、没有跨域问题（`image`支持 ）
- 3、图片请求不占用`ajax`请求限额；
- 4、不会阻塞页面加载，只需要`new Image()`就行了，通过`onerror`和`onload`检测发送状态；
:::

## 监听复制事件
::: tip
为了实现禁止复制功能，需要监听`copy`事件，做对应的处理
```js
body.addEventListener("copy", function (e) {
  e.clipboardData.setData('text/plain', ''); // 将剪切板中的数据改为空
  
  e.preventDefault();// 用我们的数据来覆盖用户选中的数据，不写这个会默认采用用户选中的数据
});
```
:::

## 监听粘贴事件paste简单解析
::: tip 
可以用`js`给页面中的元素绑定`paste`事件的方法，当用户鼠标在该元素上或者该元素处于`focus`状态，绑定到`paste`事件的方法就运行了。
绑定的元素可以是任意元素，如果是给`document`绑定了，就相当于全局了，任何时候的粘贴操作都会触发。
粘贴事件提供了一个`clipboardData`的属性，如果该属性有`items`属性，那么就可以查看`items`中粘贴的数据
```js
const body = document.body;
body.addEventListener("paste", function (e) {
  if (!(e.clipboardData && e.clipboardData.items)) {
    return;
  }
  var item = e.clipboardData.items[0];
  if (item.kind === "string") {
    item.getAsString(function (str) {
      console.log(str);
      // 粘贴文字                  https://xxxxx.png
      // 复制图片地址后粘贴          https://xxxxx.png
      // 鼠标右键复制图片后粘贴      <meta charset='utf-8'><img src="https://xxxxx.png?token=xxx"/>
    });
  } else if (item.kind === "file") {
    var file = item.getAsFile();
    console.log(file);
    // 截图后粘贴      File {name: "image.png" …}
  }
});
```
:::

## 移动端点击出现蓝框
::: tip
```css

/* 解决在安卓上的点击出现篮框问题 */
body{
  -webkit-tap-highlight-color:rgba(0,0,0,0);
}


/*下面是解决ios上去除微信点击蓝色边框 */
a:focus,
p:focus,
div:focus,
input:focus{
  -webkit-tap-highlight-color:rgba(0,0,0,0);
}
```
:::

## 上滑加载
::: tip
```vue
/* elementUI 提供的 InfiniteScroll 无限滚动（PC移动端都能用）  */
<template>
  <ul
      class="list"
      style="overflow:auto"
      v-infinite-scroll="loadMore"
      infinite-scroll-immediate="false"
      :infinite-scroll-disabled="loading || noMore"
  >
      <div
          v-if="!loading && list.length==0"
          class="myProposal-noData"
      >
          无数据
      </div>
      <li
          class="item-box"
          v-for="(item, index) in list"
          :key="index"
      >
          ...
      </li>
      <Loading v-if="loading" />
  </ul>
</template>

/* 移动端可以用vant 提供的list组件 */
<template>
  <van-list
      v-model="loading"
      :finished="noMore"
      :immediate-check="false"
      loading-text="加载中"
      @load="getFinishedRecords"
      :offset="10"
  >
      <no-data
          v-if="!loading && records.length==0"
          text="无数据"
          type="empty"
          class="noData"
      />
      <div
          v-for="(item,index) in records"
          :key="index"
      >
      </div>
  </van-list>
</template>
<script>
import { List } from 'vant';

export default {
    name: 'CoinDeatil',
    components: {
        'van-list': List,
    },
}
</script>
```

## 根据dom生成图片(base64)
::: tip
```js
/* 安装并引入 html2canvas */
import html2canvas from 'html2canvas';

createImg(){
  const dom = this.$refs.this.$refs
  const canvas = await html2canvas(dom, { scale: 2 });
  const image = canvas.toDataURL("image/jpeg"); // image: base64
}
```
:::