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
输入：`head = [1,2,3,4,5]`, `n = 2`
输出：`[1,2,3,5]`

**示例2：**
输入：`head = [1]`, `n = 1`
输出：`[]`

**说明：**
给定的 n 保证是有效的。

思路：
采用双指针的方式，快指针从头开始，慢指针从哨兵节点开始(为了保证当快指针处于null时慢指针指向要删除的前一个元素)，当快指针与慢指针相差n个节点时，慢指针开始移动，这样当快指针移动到null时，慢指针指向的就是我们要删除的元素的前一个元素。
```js
function removeNthFromEnd(head, n){
  let newHead = new ListNode(null, head), slow = newHead, fast = head
  while(n--){
    fast = fast.next
  }
  while(fast){
    fast = fast.next
    slow = slow.next
  }
  slow.next = slow.next.next
  return newHead.next
}
```
:::

## 合并两个有序链表
::: tip 
将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 

**示例1：**
输入：`l1 = [1,2,4]`, `l2 = [1,3,4]`
输出：`[1,1,2,3,4,4]`

**示例2：**
输入：`l1 = []`, `l2 = []`
输出：`[]`

**示例2：**
输入：`l1 = []`, l2 = `[0]`
输出：`[0]`

思路：
声明一个新的头，还有cur，并将cur指向新的头，然后开始循环，当l1,l2都存在时，判断l1,l2值的大小，将小的赋给cur.next,然后小的那个链表换到下一个节点。之后cur = cur.next。循环完成后，要么l1还有节点，要么l2还有节点，直接将cur.next = l1 || l2
```js
function mergeTwoLists(l1, l2){
  if(!l1 || !l2) return l1 || l2
  let newHead = new ListNode(null),cur = newHead
  while (l1 && l2) {
    if(l1.val <= l2.val){
      cur.next = l1
      l1 = l1.next
    }else{
      cur.next = l2
      l2 = l2.next
    }
    cur = cur.next
  }
  cur.next = l1 || l2
  return newHead.next
}
```
:::

## 链表是否有环
::: tip 
给定一个链表，判断链表中是否有环。
如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，我们使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。 如果 pos 是 -1，则在该链表中没有环。注意：pos 不作为参数进行传递，仅仅是为了标识链表的实际情况。

如果链表中存在环，则返回 `true` 。 否则，返回 `false` 。

**示例1：**
输入：head = `[3,2,0,-4]`, `pos = 1`
输出：`true`
解释：链表中有一个环，其尾部连接到第二个节点。

**示例2：**
输入：head = `[1,2]`, `pos = 0`
输出：`true`
解释：链表中有一个环，其尾部连接到第一个节点。

**示例3：**
输入：head = `[1]`, `pos = -1`
输出：`false`
解释：链表中没有环。

思路：
- 1、循环链表，给遍历过的节点加一个标识，当再次遇到标识时，说明有环。
- 2、采用双指针的方式，快慢指针，快的比慢的快1个节点，如果有环，循环时快的总会遇到慢的，如果没遇上说明没有
```js
// 标识法
function hasCycle(head){
  if(!head || !head.next) return false
  let temp = head
  while(temp){
    if(temp.flag) return true
    temp.flag = true
    temp = temp.next
  }
  return false
}

// 快慢指针法
function hasCycle(head){
  if(!head || !head.next) return false
  let slow = fast = head
  while(fast && fast.next){
    slow = slow.next
    fast = fast.next.next
    if(slow === fast) return true
  }
  return false
}
```
:::

## 反转链表
::: tip 
定义一个函数，输入一个链表的头节点，反转该链表并输出反转后链表的头节点。

**示例1：**
输入: `1->2->3->4->5->NULL`
输出: `5->4->3->2->1->NULL`

思路：
  要那当前节点来判断是否继续循环，而不是用`head.next`
```js
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    let cur = head ,temp, newHead = null
    while(cur){
        temp = cur.next
        cur.next = newHead
        newHead = cur
        cur = temp
    }
    return newHead
};
```
:::