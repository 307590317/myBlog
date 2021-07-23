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

## 原地删除
::: tip 
给定一个数组 nums 和一个值 val，你需要原地移除所有数值等于 val 的元素，返回移除后数组的新长度。

**示例1：**
给定 nums = `[3,2,2,3]`, val = `3`,
函数应该返回新的长度 `2`, 并且 nums 中的前两个元素均为 `2`。
你不需要考虑数组中超出新长度后面的元素。

**示例2：**
输入：nums = `[0,1,2,2,3,0,4,2]`, val = `2`
输出：`5`, nums = `[0,1,4,0,3]`
解释：函数应该返回新的长度 5, 并且 nums 中的前五个元素为 0, 1, 3, 0, 4。注意这五个元素可为任意顺序。你不需要考虑数组中超出新长度后面的元素。

**说明：**
不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。
元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。

思路：
采用将与目标值换到数组尾部的方式。
```js
function removeElement(nums, val) {
  let totalI = nums.length - 1;
  for (let i = 0; i <= totalI;) {
    if (nums[i] === val) {
      [nums[i], nums[totalI]] = [nums[totalI], nums[i]];
      totalI--;
    }else{
      i++
    }
  }
  return totalI + 1;
}
```
:::

## 加一
::: tip 
给定一个由 整数 组成的 非空 数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储单个数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。

**示例1：**
输入：`[1,2,3]`
输出：`[1,2,4]`
解释：输入数组表示数字 123。

**示例2：**
输入：digits = `[4,3,2,1]`
输出：`[4,3,2,2]`
解释：输入数组表示数字 4321。

**示例3：**
输入：digits = `[0]`
输出：`[1]`

思路：
采用满10进一的思路去从数组的最后一位开始计算
```js
function plusOne(digits) {
  let lenI = digits.length - 1
  while(digits[lenI] === 9){
    digits[lenI--] = 0
  }
  lenI === -1 ? digits.unshift(1) : digits[lenI]++
  return digits
};
```
:::

## 两数之和
::: tip 
给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。

**示例1：**
给定 nums = `[2, 7, 11, 15]`, target = 9
因为 `nums[0] + nums[1] = 2 + 7 = 9`
所以返回 `[0, 1]`

**说明：**
你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

思路：
利用map存储已有值和值所在的索引，循环时判断target-当前值在map中有没有，有则直接输出，没有就把当前值保存到map中，以便下次查找
```js
function twoSum(ary, target) {
  let i = -1;
  let map = {};
  while (++i < ary.length) {
    if (map[target - ary[i]] !== undefined) {
      return [i, map[target - ary[i]]]
    }
    map[nums[i]] = i
  }
  return [];
};
```
:::

## 三数之和
::: tip 
给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。

**示例1：**
给定数组 nums = `[-1, 0, 1, 2, -1, -4]`
满足要求的三元组集合为：
`[[-1, 0, 1], [-1, -1, 2]]`

**说明：**
注意：答案中不可以包含重复的三元组。

思路：
先将数组从小到大排序。然后优化条件当最左边大于0或者最右边小于0则直接返回空数组。
循环数组，每次固定一个值，再采用左右指针的方式，内层循环指针，拿到两个数，与固定值相加得到sum
（优化条件：外层循环数组时，如果固定节点都大于0，则直接返回res结果）
如果sum = 0, 则将三个值放入res结果数组中，并跳过重复的值
如果sum > 0, 则将右指针左移1位。
如果sum < 0, 则将左指针右移1位。
一直到左指针等于右指针时，内层循环结束
内层循环结束时，需要跳过重复的固定值（与当前固定值重复就跳过）

```js
function threeSum(ary) {
  ary.sort((a,b)=> a - b)
  let leftI, rightI, len = ary.length
  const res = []
  if(len < 3 || ary[0] > 0 || ary[len - 1] < 0) return []
  for (let i = 0; i < len - 2;) {
    if(ary[i] > 0) return res;
    leftI = i+1
    rightI = len - 1
    while (leftI < rightI) {
      let sum = ary[i] + ary[leftI] + ary[rightI]
      if(sum === 0){
        res.push([ary[i], ary[leftI], ary[rightI]])
        while(leftI < rightI && ary[leftI] === ary[++leftI]);
        while(leftI < rightI && ary[rightI] === ary[--rightI]);
      }else if(sum > 0){
        rightI--
      }else{
        leftI++
      }
    }
    while(ary[i]=== ary[++i]);
  }
  return res
};
```
:::

## Z字形变换
::: tip 
将一个给定字符串根据给定的行数，以从上往下、从左到右进行 Z 字形排列。比如输入字符串为 "LEETCODEISHIRING" 行数为 3 时，排列如下：
```
L   C   I   R
E T O E S I I G
E   D   H   N
```
之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："LCIRETOESIIGEDHN"。

**示例1：**
输入: `s = "LEETCODEISHIRING", numRows = 3`
输出: `"LCIRETOESIIGEDHN"`

**示例2：**
输入: `s = "LEETCODEISHIRING", numRows = 4`
输出: `"LDREOEIIECIHNTSG"`

**说明：**
注意：答案中不可以包含重复的三元组。

思路：
采用数组的方式，有几行数组里就有几项空字符串。然后循环字符串，通过切换行数挨个的放入数组对应的值中，最终按照空字符串`join`数组即可得到想要的结果

```js
function convert(s, numRows) {
  if(numRows === 1) return s
  const res = new Array(numRows).fill('')
  let line = 0, flag = -1
  for (let i = 0; i < s.length; i++) {
    res[line] += s[i]
    if(line === 0 || line === numRows -1) flag = - flag
    line += flag
  }
  return res.join('')
}
```
:::


