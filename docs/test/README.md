---
title: 常用技巧总结
sidebarDepth: 0
---
[[toc]]
# 常用技巧总结
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