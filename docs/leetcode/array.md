---
title: 数组
sidebarDepth: 0
---
[[toc]]
# 数组相关的算法

## 数组的交集
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

## 最长公共前缀
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

## 股票买卖的最佳时机
::: tip
如果你最多只允许完成一笔交易（即买入和卖出一支股票），设计一个算法来计算你所能获取的最大利润。注意你不能在买入股票前卖出股票。

**示例1：**
输入: `[7,1,5,3,6,4]`
输出: `7`

解释: 在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。

​ 随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6-3 = 3 。

**示例2：**
输入: `[1,2,3,4,5]`
输出: `4`

解释:在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。

**示例2：**
输入: `[7,6,4,3,1]`
输出: `0`

解释: 在这种情况下, 没有交易完成, 所以最大利润为 0。

不能同时参与多笔交易，在买入前要保证之前的股票被卖掉，一天内可以卖出和买入，尽可能多的交易
```js
// 可以买卖多次，但是一天只能先卖再买
function maxProfit(ary){
  if(ary.length < 2) return 0
  let i = 0, max = 0
  while(++i < ary.length){
    max += Math.max(0, ary[i] - ary[i-1])
  }
  return max
}

// 一共只能买卖一次
function maxProfit(ary){
  if(ary.length < 2) return 0
  let minPrice = ary[0], max = 0, i = 0;
  while (++i < ary.length) {
    minPrice = Math.min(minPrice, ary[i])
    max = Math.max(max, ary[i] - minPrice)
  }
  return max
}
```
:::

## 旋转数组
::: tip 
给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数。
**示例1：**
输入: `[1,2,3,4,5,6,7]` 和 `k = 3`
输出: `[5,6,7,1,2,3,4]`

**示例2：**
输入: `[-1,-100,3,99]` 和 `k = 2`
输出: `[3,99,-1,-100]`

**说明：**
要求使用空间复杂度为 O(1) 的 原地 算法。

思路：
采用将删除后的值添加到数组的头部来解决相关问题。
```js
function rotate(nums, k) {
  let start = nums.length - k
  start > 0 ? null : start = start %  nums.length
  nums.unshift(...nums.splice(start, k))
};
```
:::