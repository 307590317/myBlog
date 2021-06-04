---
title: Vue 模板编译源码解析
sidebarDepth: 0
---

[[toc]]

# Vue 模板编译源码解析
::: tip
此篇主要讲了根据传入的元素或者模板(`template:'<div id="a">{{name}}</div>'`)，拿到`html`字符串，再根据正则将`html`字符串编译成`ast`对象，再由`ast`对象转化为`code`，最后采用`new Function + with`的方式根据`code`生成`render`函数的过程

根据`el`或`template`拿到 `HTML`字符串 -> 将`HTML`字符串转化为`ast对象` -> 根据`ast对象`生成`code` -> 用`code`生成`render`函数
:::

```html
<div id="app">
  hello {{ name }} world
</div>

<script>
  const vm = new Vue({
    el: "#app",
    data: {
      name: 'mrzhao',
    },
    // render(h) {
    //   return h('div',{id:'a'},'mrzhao')
    // },
    // template:`<div id="a">{{name}}</div>`
  });
</script>
```

::: tip
对于传入的`el`或者`template`属性，最后都会被解析成`render`函数，以便后面更新视图。
:::

## 处理 render 方法

```js
// src/init.js

import { initState } from "./state";

import { compileToFunction } from "./compiler/index";

export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    // el,data
    const vm = this;
    vm.$options = options; // 后面会对options进行扩展操作

    // 对数据进行初始化 watch computed props data ...
    initState(vm); // vm.$options.data  数据劫持

    // 如果有el元素，将数据渲染到模板上
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function(el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    vm.$el = el;
    // 把模板转化成 对应的渲染函数(render) =》 虚拟dom概念 vnode =》 diff算法 更新虚拟dom =》 产生真实节点，更新
    // 如果有render 就用render
    // 没有render 看有没有template  有就用
    // 没有template 就找el
    if (!options.render) {
      // 没有render用template，目前没render
      let template = options.template;
      if (!template && el) {
        // 用户也没有传递template 就取el的内容作为模板
        template = el.outerHTML;
      }
      // 最后需要把template转换成render函数
      let render = compileToFunction(template);
      // 生成render函数后挂载到vm的options属性上
      options.render = render;
    }
    // options.render 就是渲染函数
    // 调用render方法 渲染成真实dom 替换掉页面的内容
  };
}
```

::: tip render
`initMixin`中会集中对`el`属性和`template`属性做处理，统一处理成`render`函数，方便后续更新视图时直接调用生成真实 DOM，替换页面的内容
:::

## 核心方法 compileToFunction

::: tip compileToFunction
`compileToFunction`方法是将模板转化成`render`函数的核心方法
:::

```js
// src/compiler/index.js

import { generate } from "./generate";
import { parserHTML } from "./parser";

export function compileToFunction(template) {

  // 1.把html代码转成ast语法树  ast用来描述代码本身形成树结构 语法不存在的属性无法描述
  let ast = parserHTML(template);

  // 拿到ast对象生成code
  let code = generate(ast);

  let render = new Function(`with(this){return ${code}}`); // code 中会用到数据 数据在vm上

  return render;

  // html=> ast（只能描述语法 语法不存在的属性无法描述） => render函数 + (with + new Function) => 虚拟dom （增加额外的属性） => 生成真实dom
}
```

::: tip compileToFunction
`compileToFunction`是编译的核心方法，会先将`html`字符串转化为`ast`语法树，然后根据`ast`生成`render`函数
:::

## parserHTML(将 HTML 转换成 ast 语法树)

```js
// src/compiler/parser.js

//  匹配HTML中内容的正则
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取的标签名的 match后的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签的开始
const startTagClose = /^\s*(\/?)>/; //  匹配标签的结束   />   <div/>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
//       匹配属性  a=b  a="b"  a='b'
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

// 将我们的html =》 词法解析  （开始标签 ， 结束标签，属性，文本）

// 将解析后的结果 组装成一个树结构  栈
function createAstElement(tagName, attrs) {
  return {
    tag: tagName,
    type: 1, // 1表示元素，3表示文本
    children: [],
    parent: null,
    attrs,
  };
}
let root = null;
// 采用栈结构存放遇到的标签，1、为了拿到父标签。2、验证标签是否匹配
let stack = [];

// 开始标签
function start(tagName, attributes) {
  // 在遇到新的开始标签时，栈中的最后一个标签就是当前开始标签的父元素
  let parent = stack[stack.length - 1];
  let element = createAstElement(tagName, attributes);
  if (!root) {
    root = element;
  }
  if (parent) {
    element.parent = parent; // 当放入栈中时 继续父亲是谁
    parent.children.push(element);
  }
  stack.push(element);
}

// 闭合标签
function end(tagName) {
  // 遇到闭合标签就把与之对应的开始标签从栈中弹出
  let last = stack.pop();

  // 如果弹出的标签名与当前匹配的闭合标签不匹配，表示标签出错了
  if (last.tag !== tagName) {
    throw new Error("标签有误");
  }
}

// 处理文本
function chars(text) {
  // 去掉空格
  text = text.replace(/\s/g, "");
  let parent = stack[stack.length - 1];
  if (text) {
    parent.children.push({
      type: 3, // 文本类型为3
      text,
    });
  }
}

export function parserHTML(html) {
  function advance(len) {
    html = html.substring(len);
  }

  // 匹配开始标签并解析属性
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      // 删掉解析完的字符
      advance(start[0].length);
      let end;
      // 如果没有遇到标签结尾就不停的解析
      let attr;
      // 如果没有匹配到标签结尾（>） 并且 匹配到了属性
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
        advance(attr[0].length);
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false; // 不是开始标签
  }

  while (html) { // 解析到没有内容为止
    let textEnd = html.indexOf("<"); 
    // 如果<在第一个 那么证明接下来可能是标签（开始或结束标签），也可能是文本符号
    if (textEnd == 0) {
      // 解析开始标签
      const startTagMatch = parseStartTag(html);

      // 是开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      // 解析结束标签
      const endTagMatch = html.match(endTag);

      // 是结束标签
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }
   
    let text; // {{name}} world</div>
    // <大于0代表有文本 解析文本
    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      // 处理文本
      chars(text);
      advance(text.length);
    }
  }

  return root;
}

```

::: tip parserHTML
主要解析`HTML`的方法，采用解析完一部分就删除的规则，正则匹配的方式，解析`HTML`中的标签、标签属性、文本，并建立父子关系，最终生成`ast`元素对象 `{ tag:'div',type:1,children:[{ type:3,text:'hello {{name}} world'}], parent:undefined,attrs: [{name:'id',value:'app'}]}`
:::

## 将ast元素对象转化为代码

```js
// src/compiler/generate.js

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配带有大括号的内容 {{aaaaa}}

// { tag:'div',type:1,children:[{ type:3,text:'hello {{name}} world'}], parent:undefined,attrs: [{name:'id',value:'app'}]} =》 字符串  _c('div',{id:'app'},_v('hello' + _s(name) + 'world'))

// 循环属性生成 属性 code
function genProps(attrs) {
  // [{name:'xxx',value:'xxx'},{name:'xxx',value:'xxx'}]
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 样式需要单独处理
    if (attr.name === "style") {
      // color:red;background:blue
      let styleObj = {};
      attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
        styleObj[arguments[1]] = arguments[2];
      });
      attr.value = styleObj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

function gen(el) {
  // 判断节点类型  1：元素节点  3：文本节点
  if (el.type == 1) {
    // 递归生成元素code
    return generate(el);
  } else {
    let text = el.text;
    // 没有双括号直接当文本处理
    if (!defaultTagRE.test(text)) {
      return `_v('${text}')`;
    } else {
      // 存在双括号
      // 'hello' + name + 'world'    hello {{name}} world
      let tokens = [];
      let match;
      // exec匹配时对于带有全局修饰符g的，第一次匹配到时，下次再匹配时是从上次匹配到的值索引之后开始匹配
      // 由于我们每次匹配都是用的共用的正则 defaultTagRE，所以每次调用gen  需要处理{{}}时都需要重置 lastIndex
      let lastIndex = (defaultTagRE.lastIndex = 0); // CSS-LOADER 原理一样
      // 如果没有匹配到，那么match 为 null
      while ((match = defaultTagRE.exec(text))) {
        // 匹配到的值所在的索引
        let index = match.index;
        if (index > lastIndex) {
          // 将字符串开头到 {{}} 之前的字符 截取放入tokens
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`); // 拿到{{ }}中的内容 name
        // 更新索引
        lastIndex = index + match[0].length;
      }
      // 当匹配不到{{}}时，并且后面还有字符时，将剩余的字符直接
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}

// 循环子节点生成code
function genChildren(el) {
  let children = el.children; // 获取儿子
  if (children) {
    return children.map(c => gen(c)).join(",");
  }
  return false;
}

// 递归生成code: _c('div',{id:'app'},_v('hello' + _s(name) + 'world'))
export function generate(el) {
  // 遍历树 将树拼接成字符串
  let children = genChildren(el);
  let code = `_c('${el.tag}',${
    el.attrs.length ? genProps(el.attrs) : "undefined"
  }${children ? `,${children}` : ""})`;

  return code;
}

```

::: tip 生成code
拿到生成的`ast`对象，`ast`对象转化成类似`_c('div',{id:'app'},_v('hello' + _s(name) + 'world'))`这样的字符串
:::

## 拿到code生成render函数

```js
// src/compiler/index.js

import { generate } from "./generate";
import { parserHTML } from "./parser";

export function compileToFunction(template) {

  // 1.把html代码转成ast语法树  ast用来描述代码本身形成树结构 语法不存在的属性无法描述
  // let ast = parserHTML(template);

  // 拿到ast对象生成code
  let code = generate(ast);
  // 模板引擎基本用的都是 new Function + with的方式将字符串转换成函数
  // 使用with语法改变作用域中的默认对象为this，后续所有的引用都指向this对象，会去this上找对应的属性，不用添加命名空间，  之后调用render函数可以使用call改变this 方便code里面的变量取值 比如 name值就变成了this.name

  let render = new Function(`with(this){return ${code}}`); // code 中会用到数据 数据在vm上
  // render.call(vm)  相当于 vm.name 
  return render;
}

```
