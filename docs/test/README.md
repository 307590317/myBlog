---
title: 常用技巧总结
sidebarDepth: 0
---
[[toc]]
# 常用技巧总结

## chrome浏览器自带截图功能
::: tip 截图（可以截长图）
找到想要截图的网页，打开控制台，同时按下 ctrl+shift+p 出来搜索框，输入截图，即可选择截图方式
:::

## element UI
::: tip
`input`为密码输入时 取消自动填充密码 添加 `autocomplete="new-password"`
`<el-input v-model="ruleForm.password" maxlength="20" placeholder="请输入密码" show-password autocomplete="new-password"/>`


`cascader` 级联选择器

清空级联选择器的默认选项 :

1、清空绑定的值（把绑定的值置为空数组）  
2、清空选中高亮代码如下
`this.$refs.cascaderRef.$refs.panel.activePath = []`

`datatimepicker`日期时间选择器禁用方式：
以选中的开始日期的0点为准向前向后范围7天内的时间
```js
pickerOptions: {
  onPick: time => {
    if (time.minDate && !time.maxDate) {
      // 起始时间为选择那天的当天0点
      this.timeStart = Date.parse(new Date(time.minDate).toDateString())
    }
  },
  disabledDate: time => {
    // 减1000毫秒 是到当天的23:59:59
    const date = Date.parse(new Date().toDateString()) + 8.64e7 - 1000
    if (this.timeStart) {
      const endTime = this.timeStart + 8.64e7 * 7 - 1000 > date ? date : this.timeStart + 8.64e7 * 7 - 1000
      return time.getTime() > endTime || time.getTime() < this.timeStart - 8.64e7 * 6 // 由于是到当天的23:59:59，所以要往前凑6天
    } else {
      return time.getTime() > date
    }
  }
}
```
:::

## 颜色 RGB 转换为十六进制
```js
const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
rgbToHex(0, 51, 255); 
// Result: #0033ff
```

## 复制 粘贴功能
```js
const copyToClipboard = (text) => navigator.clipboard.writeText(text);
copyToClipboard("Hello World");
```
## echarts
::: tip
解决chart图`legend`展示顶部文字切割的问题:  修改 legend:textStyle:lineHeight:14
:::
## Mac电脑常用
:::tip
查询本机IP
`ifconfig en0 inet`

查看隐藏文件
`defaults write com.apple.finder AppleShowAllFiles -boolean true ; killall Finder`
`defaults write com.apple.finder AppleShowAllFiles -boolean false ; killall Finder`

`cd ~/.ssh`       进入.ssh文件
`ls `             查看当前文件夹下的所有文件
`cat id_rsa.pub`  查看公钥
`vim id_rsa.pub`  进入id_rsa.pub文件
按字母 `i` 键 进入编辑模式，编辑完成后按`ESC`键退出编辑，输入`:wq`保存并退出
`ssh-keygen -t rsa -C "zhaoyu@xxxxx.com"` 生成邮箱对应的密钥

window.URL.createObjectURL：生成一个包含传入数据的URL
:::

## vscode

### Vscode 恢复终端默认展示
::: tip 终端默认展示
在`setting.json`配置中修改`"terminal.integrated.tabs.enabled":false`
:::

### Vscode 文件目录检索增加智能提示
::: tip 智能提示
在`setting.json`配置中新增
```json
"path-intellisense.mappings": {
  "@": "${workspaceRoot}/src"
}
```
在项目根目录新增`jsconfig.json`文件
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "exclude": [
    "node_modules"
  ]
}
```
:::

## 移动端字体大小与所写样式不一致问题
::: tip
场景：
通过meta标签(name=viewport)去修改相关的scale以此来适配不同大小的手机
```html
<meta name="viewport" content="width=750, initial-scale=0.52,maximum-scale=0.52,minimum-scale=0.52, user-scalable=no,target-densitydpi=device-dpi,minimal-ui,uc-fitscreen=no,viewport-fit=cover">
```
引起的问题：
通过以上方法做HTML适配会导致 HTML中的字体样式有时会出现跟所写的css样式不一样，如字体写了font-size:28px,但是实际上会出现font-size 表现为31.333px这种问题。

问题原因：
这个特性被称做「Text Autosizer」，又称「Font Boosting」、「Font Inflation」，是 Webkit 给移动端浏览器提供的一个特性：这个特性是为用户因页面内容多而缩放页面导致字体变小看不清楚而设计的。目的是为了让用户缩放页面后保证在即不需要左右滑动屏幕，也不需要双击放大屏幕内容的前提下，也可以让人们方便的阅读页面中的文本。

但是在某些场景下我们不需要这个特性，如何限制这个特性达到我们想要的结果呢？

解决方案：
1：Font Boosting 仅在未限定尺寸的文本流中有效，给元素指定宽高，就可以避免 Font Boosting 被触发。
2、可通过指定max-height来避免触发。比如 .class {max-height:100%;}
3、.class{ text-size-adjust:none; } // 目前项目在用
4、指定initial-scale = 1

原文地址：https://segmentfault.com/a/1190000015234607
:::

## 打出的dist包直接本地访问
::: tip
需要先全局安装 Http-server 模块，之后进入到index.html所在的文件夹，执行 Http-server -p 端口号
Http-server -p 8001
:::

## node.js模块依赖及版本号
::: tip
Node.js最重要的一个文件就是`package.json`，其中的配置参数决定了功能。例如下面就是一个例子
```json
{
  "name": "test",
  "version": "1.0.0",
  "description": "test",
  "main": "main.js",
  "keywords": [
    "test"
  ],
  "author": "wade",
  "license": "MIT",
  "dependencies": {
    "express": "^4.10.1"
  },
  "devDependencies": {
    "jslint": "^0.6.5"
  }
}
```
:::

### dependencies与devDependencies
::: tip
一个node package有两种依赖，一种是`dependencies`，另一种是`devDependencies`，其中前者依赖的项是正常运行该包时所需要的依赖项，而后者则是开发的时候需要的依赖项，像一些进行单元测试之类的包。简单来记就是下面的
`"dependencies": {}`     //生产环境

`"devDependencies": {}` //开发环境

在`package.json`所在目录执行`npm install`的时候，`devDependencies`里面的模块也会被安装的。
如果我们只想安装`dependencies`里面的包，可以执行 `npm install --production`
如果只安装`devDependencies`，可以执行`npm install --dev`
同理，使用`npm install node_module –save`自动更新`dependencies`字段值，
使用`npm install node_module –save-dev`自动更新`devDependencies`字段值。
:::

### 版本号
::: tip
每一个模块后面对应的就是他的版本号，如"^4.10.1"。下面是几个版本的表达式
| 表达式     |    版本范围      |
| :--------:|   :-------:     |
| >=1.2.7   |	  大于等于1.2.7  |
| >=1.2.7 <1.3.0 |	1.2.7,1.2.8,1.2.9 |
| 1.2.3 - 2.3.4 |	>=1.2.3 <=2.3.4 |
| 1.2 - 2.3.4  |	>=1.2.0 <=2.3.4 |
| 1.2.3 - 2.3  |	>=1.2.3 <2.4.0  |
| 1.2.3 - 2  |	>=1.2.3  < 3.0.0  |
| * |	>=0.0.0 |
| 1.x(等价于1.X)	| >=1.0.0 <2.0.0  |
| 1.2.x	  | >=1.2.0 <1.3.0  |
| ""(等价于*) |	>=0.0.0 |
| 1(等价于1.x.x)  |	>=1.0.0 <2.0.0  |
| 1.2(等价于1.2.x)  |	>=1.2.0 <1.3.0  |
| ~1.2.3(>=1.2.3 <1.(2+1).0)  |	>=1.2.3 <1.3.0  |
| ~1.2(>=1.2.0 <1.(2+1).0)  |	>=1.2.0 <1.3.0  |
| ~1(>=1.0.0 <(1+1).0.0)  |	>=1.0.0 <2.0.0  |
| ~0.2.3(>=0.2.3 <0.(2+1).0)  |	>=0.2.3 <0.3.0  |
| ~0.2(>=0.2.0 <0.(2+1).0)  |	>=0.2.0 <0.3.0  |
| ~0(>=0.0.0 <(0+1).0.0)  |	>=0.0.0 <1.0.0  |
| ~1.2.3-beta.2 |	>=1.2.3-beta.2 <1.3.0 |
| ^1.2.3  |	>=1.2.3 <2.0.0  |
| ^0.2.3  |	>=0.2.3 <0.3.0  |
| ^0.0.3  |	>=0.0.3 <0.0.4  |
| ^1.2.3-beta.2 |	>=1.2.3-beta.2 <2.0.0 |
| ^0.0.3-beta |	>=0.0.3-beta <0.0.4 |
| ^1.2.x  |	>=1.2.0 <2.0.0  |
| ^0.0.x  |	>=0.0.0 <0.1.0  |
| ^0.0  |	>=0.0.0 <0.1.0  |
| ^1.x  |	>=1.0.0 <2.0.0  |
| ^0.x  |	>=0.0.0 <1.0.0  |
:::