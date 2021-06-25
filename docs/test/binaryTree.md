---
title: 二叉树
sidebarDepth: 0
---
[[toc]]
# 二叉树

## 前序遍历
```js
/* 
  前序遍历(先遍历父元素)
  以根节点为起始点
  先遍历根节点左边，左节点有子节点，则继续遍历子节点的左边
  左边左侧一直到底，然后再处理左边右侧，左边完了之后再处理右边
  先右边左侧，然后右边右侧。
*/
function preorderTraversal(root) {
  let res = [];
  // 遍历函数
  function traversal(root) {
    if (root == null) return
    // 访问根节点的值
    res.push(root.val);
    // 递归遍历左子树
    traversal(root.left);
    // 递归遍历右子树
    traversal(root.right);
  };
  traversal(root);
  return res;
};
```

## 中序遍历
```js
/* 
  中序遍历(先左边，然后遍历父元素，最后遍历右边)
  以左边左侧叶子节点为起始点
  先遍历根节点左边，左节点有子节点，则继续遍历子节点的左边
  左边左侧一直到底，然后再处理左边右侧，左边完了之后再处理右边
  先右边左侧，然后右边右侧。
*/
function inorderTraversal(root) {
  let res = [];
  // 遍历函数
  function traversal(root) {
    if (root == null) return 
    // 递归遍历左子树
    traversal(root.left);
    // 访问根节点的值
    res.push(root.val);
    // 递归遍历右子树
    traversal(root.right);
  };
  traversal(root);
  return res;
};
```

## 后序遍历
```js
/*  
  后序遍历(先左边，后右边，最后遍历中间)
  以左边左侧叶子节点为起始点
  先遍历根节点左边，左节点有子节点，则继续遍历子节点的左边
  左边左侧一直到底，然后再处理左边右侧，左边完了之后再处理右边
  先右边左侧，然后右边右侧。
*/
function postorderTraversal(root) {
  let res = [];
  // 遍历函数
  function traversal(root) {
    if (root == null) return
    // 递归遍历左子树
    traversal(root.left);
    // 递归遍历右子树
    traversal(root.right);
    // 访问根节点的值
    res.push(root.val);
  };
  traversal(root);
  return res;
};
```

## 层序遍历
```js
/*  
  层序遍历(一层一层的向下遍历)
*/
function levelorderTraversal(root) {
  let stack = [root]
  let index = 0
  let res = [];
  let curNode
  while(curNode = stack[index++]){
    res.push(curNode.val);
    curNode.left ? stack.push(curNode.left) : null
    curNode.right ? stack.push(curNode.right) : null
  }
  return res;
};
```

## 反转二叉树
```js
/*  
  反转二叉树(将左边节点换到右边，右边换到左边)
*/
function reverseTree(root) {
  let stack = [root];
  let index = 0;
  let curNode;
  while (curNode = stack[index++]) {
    const { left, right } = curNode
    curNode.right = left
    curNode.left = right
    if(left){ stack.push(left) }
    if(right){ stack.push(right) }
  }
  stack = null;
  return root;
}
```

