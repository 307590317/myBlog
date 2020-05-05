---
title: 6、Date日期基础及常用方法
sidebarDepth: 0
---
[[toc]]
# Date日期基础及常用方法（12个）
>Date是日期类，通过它可以对时间进行处理
```javascript
Date上的静态方法：now()
now() //方法返回自1970年1月1日 00:00:00 UTC到当前时间的毫秒数，类型为Number。
// 因为 now() 是Date的一个静态函数，所以必须以 Date.now() 的形式来使用。

var time = new Date() //获取当前客户端本机时间
// 获取的结果是一个日期格式的对象：Sun Oct 22 2017 15:58:40 GMT+0800 (中国标准时间)
time.getFullYear() // 获取四位整数年
time.getMonth() // 获取月（0-11代表1-12月）
time.getDate() // 获取日
time.getDay() // 获取星期（0-6代表周日-周六）
time.getHours() // 获取小时
time.getMinutes() // 获取分钟
time.getSecond() // 获取秒
time.getMilliseconds`['mɪlisekənd]`() // 获取毫秒
time.getTime() // 获取当前日期距离'1970-01-01 00:00:00'的毫秒差
time.toLocaleString('zh-Hans-CN', {hour12: false}) // 根据本地时间规则把time转化为字符串并返回结果；
var time = new Date('2017-10-22') //当new Date中传递一个时间格式的字符串，相当于把这个字符串转换为标准格式的时间对象
'2017-10-22' // (IE下识别不了)
// 将time='2017-10-24';转化为'2017/10/24'的方法：
// 1.用replace+正则处理
// 2.用字符串拆分+join转换为数组
// 3.用time=new Date(time)；然后用Date对象的方法获取到年月日之后用'/'拼接；
```