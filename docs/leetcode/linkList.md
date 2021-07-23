---
title: 链表
sidebarDepth: 0
---
[[toc]]
# 链表相关的算法

## 删除链表倒数第N个节点
::: tip 
给定一个链表，删除链表的倒数第 n 个节点，并且返回链表的头结点。

**示例1：**
给定一个链表: `1->2->3->4->5`, 和 `n = 2`.
当删除了倒数第二个节点后，链表变为 `1->2->3->5`.

**说明：**
给定的 n 保证是有效的。

思路：
采用`map`去存储<元素，出现次数>，再循环另外一个数组查找重复出现的。
```js
function intersect(a, b){
  const map = {}, res = []
  let lenA = a.length, lenB = b.length
  while(lenA--){
    map[a[lenA]] = (map[a[lenA]] || 0) + 1
  }
  while(lenB--){
    if(map[b[lenB]]){
      res.push(b[lenB])
      map[b[lenB]]--
    }
  }
  return res
}
```
:::



