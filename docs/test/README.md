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
### chart文字切割

::: tip
解决chart图`legend`展示顶部文字切割的问题:  修改 legend:textStyle:lineHeight:14
:::
### css渐变色与echarts 渐变色互转

::: tip
```css
background:linear-gradient(90deg, red, blue);
```
```js
import * as echarts from 'echarts/core';
new echarts.graphic.LinearGradient(
                    0.5,// x
                    0,  // y
                    0.5,// x2
                    1, // yx
                    '#999',
                  )
```
从上面可以看出来，其实就是 `echarts` 用了坐标的形式，而 `css` 使用的角度。所以针对坐标和角度进行转换即可
```js
/**
 * 线性渐变，前四个参数分别是 x0, y0, x2, y2
 * x y 语义
 *
 * x=0.5 y=0,     x2=0.5, y2=1   从上到下
 * x=1   y=0.5,   x2=0.5,   y2=0   从下到上
 * x=0   y=0.5,   x2=1,   y2=0.5 从左到右
 * x=1   y=0.5,   x2=0,   y2=0.5 从右到左
 * 
 * css 中 0deg 是从上到下，顺时针方向是从左到右渐变（90deg => 左到右）
 *
 * */
const echartsToCssDeg = ({ x: x1, y: y1, x2, y2 }) => {
  const getYAngle = function (cx, cy, x2, y2) {
    const x = Math.abs(cx - x2);
    const y = Math.abs(cy - y2);
    const tan = x / y;
    const radina = Math.atan(tan); //用反三角函数求弧度
    let angle = Math.floor(180 / (Math.PI / radina)) || 0; //将弧度转换成角度
    /**
     * 根据目标点判断象限（注意是笛卡尔坐标）
     * 一： +，+
     * 二： -，+
     * 三： -，+
     * 一： +，-
     */

    //  * 二、三象限要加 180°
    if (x2 < 0 && y2 >= 0) {
      angle = 180 + angle;
    }
    if (x2 < 0 && y2 < 0) {
      angle = 180 + angle;
    }

    // 一、二象限 === 0 就是 180°
    if (angle === 0) {
      if ((x2 >= 0 && y2 > 0) || (x2 <= 0 && y2 > 0)) {
        angle = 180 + angle;
      }
    }

    return angle;
  };

  /**
   * 1、将 二维 坐标看成一个正方形（[0, 0],[1, 0],[1, 1],[0, 1]）， 坐落于一象限
   * 2、根据二维坐标转一个新的坐标（相对于正方形中心点的，所以线段会贯穿正方形），
   *    把相对于笛卡尔坐标系中心点的坐标，转为相对于正方形中心点的坐标
   *    eg: x 0.5 => 0，
   *        y 0   => -0.5
   *
   *        其实就是  x - 0.5,  y - 0.5
   */
  return getYAngle(x1 - 0.5, y1 - 0.5, x2 - 0.5, y2 - 0.5); 
};
const CssDegToEcharts = (deg) => { 
  // 假定旋转半径 0.5 
  const start = { x: 0, y: -0.5 };
  const end = {};
  end.x2 = start.x * Math.cos((deg * Math.PI) / 180) - start.y * Math.sin((deg * Math.PI) / 180);
  end.y2 = start.x * Math.sin((deg * Math.PI) / 180) + start.y * Math.cos((deg * Math.PI) / 180);
    
  // 算出对应其他象限中对应的点
  end.x = 0 - end.x2;
  end.y = 0 - end.y2;
  
  end.x += 0.5;
  end.y += 0.5;
  end.x2 += 0.5;
  end.y2 += 0.5;
  return end; 
}
```
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
:::

## window电脑常用
::: tip
window.URL.createObjectURL：生成一个包含传入数据的URL
:::

### window 10 yarn network connection
::: tip
window 10  yarn时遇到下面问题
info There appears to be trouble with your network connection.Retrying...

测试下是不是ipv6不通导致的
```shell
ping -4 registry.npmmirror.com # 测试 IPv4 是否联通?
ping -6 registry.npmmirror.com # 测试 IPv6 是否联通?
```

如果v4 可以 v6不通的话就说明是window10 ipv6导致的问题
可以先暂时提高v4的优先级，yarn时适用ipv4,安装完之后再改回去

`win + R` 打开命令行输入cmd,按`Ctrl+Shift+Enter`以管理员身份打开。然后输入以下内容：
```shell
# 1. 以系统管理者身份执行 命令提示字元，查询连线顺序

netsh interface ipv6 show prefixpolicies
# 可以看到IPv4 ::ffff:0:0/96 的顺序是 35

# 2. 修改顺序，让 IPv4 优先，数字越大，优先性愈高
netsh interface ipv6 set prefixpolicy ::ffff:0:0/96 60 4

# 3. 改回原来顺序
`netsh interface ipv6 set prefixpolicy ::ffff:0:0/96 35 4
```
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