---
title: 数组的交集
sidebarDepth: 0
---
[[toc]]
# 数组的交集
::: tip 
给定两个数组，编写一个函数来计算它们的交集。
**示例1：**
输入: `nums1 = [1,2,2,1]`, `nums2 = [2,2]`
输出: `[2,2]`

**示例2：**
输入: `nums1 = [4,9,5]`, `nums2 = [9,4,9,8,4]`
输出: `[4,9]`

**说明：**
输出结果中每个元素出现的次数，应与元素在两个数组中出现的次数一致。
我们可以不考虑输出结果的顺序。

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

## 如果是两个有序数组
::: tip
如果是两个有序递增的数组，则采用双指针的方式去解，而且不需要申请额外的空间，只需要把相等的值赋值给数组前面对比过的就OK了。

```js
function intersectOrder(a, b){
  let aI = 0,bI = 0, k = 0;
  while(aI < a.length && bI < b.length){
    if(a[aI] > b[bI]){
      bI++
    }else if(a[aI] < b[bI]){
      aI++
    } else {
      a[k] = a[aI]
      aI++
      bI++
      k++
    }
  }
  return a.slice(0,k)
}
```
:::