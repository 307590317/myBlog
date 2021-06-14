---
title: 未归纳知识点
sidebarDepth: 0
---
[[toc]]
# 未归纳知识点
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

## Mac电脑常用
:::tip
查询本机IP
`ifconfig en0 inet`

查看隐藏文件
`defaults write com.apple.finder AppleShowAllFiles -boolean true ; killall Finder`
`defaults write com.apple.finder AppleShowAllFiles -boolean false ; killall Finder`


window.URL.createObjectURL：生成一个包含传入数据的URL
:::

