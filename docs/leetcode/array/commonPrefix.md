---
title: 最长公共前缀
sidebarDepth: 0
---
[[toc]]
# 最长公共前缀
::: tip 
编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，则返回""
**示例1：**
输入: `["flower","flow","flight"]`
输出: `"fl"`

**示例2：**
输入: `["dog","racecar","car"]`
输出: `""`

**说明：**
所有输入只包含小写字母 `a-z`

思路：
拿到数组中第一个值当做公共前缀，去和后面的挨个作比较来修正这个前缀
```js
function longestCommonPrefix(ary){
  if(ary.length < 1) return ''
  let prefix = ary[0],i = 1
  while(i < ary.length){
    // startsWith 可以更换成正则
    if(ary[i].startsWith(prefix)){
      i++
    }else{
      prefix = prefix.slice(0, prefix.length - 1)
    }
  }
  return prefix
}
```
:::