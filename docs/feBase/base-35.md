---
title: 35、JS中的本地存储
sidebarDepth: 0
---
[[toc]]
# 35、JS中的本地存储
>把一些信息存储在当前浏览器指定域下的某一个地方（存储到物理硬盘中）
>- 1、不能跨浏览器传输：在谷歌浏览器中存储的信息，在IE浏览器中无法获取，因为本地存储是存在当前浏览器中的某个具体位置的
>- 2、不能跨域传输：在京东域下存储的信息，在淘宝域下不能获取到（也是为了保证安全）；
>- 3、本地存储并不安全：会导致客户端一些存储的信息泄露；
## 本地存储的方案
>*传统：`cookie、session`*
>- `cookie`：把信息存储到客户端的浏览器中(但是项目服务器端也是可以获取`COOKIE`的)
>- `session`：把信息存储到服务器上(服务器存储)
>
>*`HTML5`新增加的`API`：`webStorage`（不兼容低版本浏览器，常用于移动端的开发）*
>- `localStorage`：永久存储到客户端的本地
>- `sessionStorage`：信息的会话存储,会话窗口存在信息也存在,会话窗口关闭信息就消失了（刷新页面不会清除）

>*cookie*
>- `HttpOnly:`如果`cookie`中设置了`HttpOnly`属性，那么通过js脚本将无法读取到`cookie`信息，这样能有效的防止`XSS`攻击。（服务器设置响应头中添加`HTTPOnly`）
>- `secure:`如果`cookie`中设置了`secure`属性，那么`cookie`在`HTTP`请求中无法被发送，只能用`HTTPS`协议发送给服务器；（服务器设置响应头中添加`secure`）
> - `cookie隔离:`网站向服务器发送请求时会自动带上`cookie`信息，这样会使请求变慢。
> 如果静态资源都放在主域名下，请求静态文件的时候，所有的请求都会带上`cookie`提交给服务器，非常浪费流量，所以不如隔离开，静态资源放在CDN。由于`cookie`有域的限制，因此使用非主要域名的时候，请求头中就不会携带`cookie`信息，这样可以降低请求头的大小，降低请求时间。

### cookie、localStorage、sessionStorage的使用和区别
::: tip webStorage、localStorage、sessionStorage
以下方法 `localStorage、sessionStorage` 都可以用且用法相同

- 1、`localStorage.setItem([key],[value])`:
  - 向客户端的本地存储一条记录;存储的`[value]`需要是字符串格式的,如果编写的不是字符串,浏览器也会默认转化为字符串然后再进行存储;同源下存储的`[key]`是不会重复的,如果之前有的话,是把存储的信息值重新的进行修改;
- 2、`localStorage.getItem([key])`:获取之前存储的指定属性名所对应的属性值
- 3、`localStorage.removeItem([key])`:移除key对应的存储记录
- 4、`localStorage.clear()`:把当前源下所有的存储记录都移除掉
- 5、`localStorage.length`:获取存储的记录条数
- 6、`localStorage.key(index)`:按照存储的先后顺序获取索引为index这一项的属性名是什么

`cookie：document.cookie`可以设置、获取`cookie`的值；
使用`cookie`需要导入自己写的`cookie.js`方法如下
```js
cookieRender.set({
  name: 'age',
  value: 7
});
cookieRender.get('age')
cookieRender.remove('age')
```
:::
#### localStorage和sessionStorage的区别:
>1、`localStorage`属于永久存储到本地,不管是刷新页面还是关掉页面或者是关掉浏览器,存储的内容都不会消失,只有我们自己手动的去删除才会消失(不管是杀毒软件还是浏览器自带的清除历史记录功能都不能把`localStorage`存储的内容移除掉)
>
>2、`sessionStorage`属于临时的会话存储,只要当前的页面不关闭,信息就可以存储下来,但是页面一但关闭,存储的信息就会自动清除(F5刷新页面只是把当前的DOM结构等进行重新的渲染,会话并没有关闭)
#### cookie 和 localStorage的区别:
::: tip
- 1、*兼容问题*：`cookie`兼容所有的浏览器,但是`localStorage`不兼容IE6~8		
- 2、*大小限制*：
  - `cookie`存储内容的大小是有限制的,一般同源下只能存储4KB的内容;
  - `localStorage`存储的内容也有大小限制,一般同源下只能存储5MB;

- 3、*过期时间*：`cookie`存储的内容是有过期时间的（不设置过期时间就是浏览器关闭就过期）,而`localStorage`是永久存储到本地,使用杀毒软件或者浏览器自带的清除垃圾的功能都可能会把存储的`cookie`给删除掉，`localStorage`清除不掉
- 4、*是否支持手动禁用*：用户可能出于安全的角度禁用`cookie`(无痕浏览器)，但是不能禁止`localStorage`。
- 5、*处理机制：*
  - `cookie`不是完全的本地存储，在我们使用`cookie`的时候，需要客户端和服务器端进行相关的通信处理（`cookie`总会在客户端和服务器端来回进行传输）
  - `localStorage`完整的本地存储，和服务器没关系；

两种方式共同的 *弊端*：
- 1、安全性
不管是`cookie`还是`localStorage`都是本地明文存储；（可通过控制台->`Application` 看到存储的内容）
对于重要的信息我们一般不要存储到本地，如果非要存储的话我们需要把存储的信息进行加密
->可逆转加密:加密完成还可以解密回来
->不可逆转加密:MD
- 2、大小存在限制
- 3、不能跨域（跨浏览器：在谷歌下存储的信息，在IE中无法直接获取）;

*区别*：`cookie`数据始终在同源的`http`请求中携带（即使不需要），即`cookie`在浏览器和服务器间来回传递；`cookie`数据还有路径（`path`）的概念，可以限制`cookie`只属于某个路径下。存储大小限制也不同，`cookie`数据不能超过4k，同时因为每次`http`请求都会携带`cookie`，所以`cookie`只适合保存很小的数据，如会话标识。
而`sessionStorage`和`localStorage`不会自动把数据发给服务器，仅在本地保存。`sessionStorage`和`localStorage` 虽然也有存储大小的限制，但比`cookie`大得多，可以达到5M或更大。
数据有效期不同，`sessionStorage`：仅在当前浏览器窗口关闭前有效，自然也就不可能持久保持；`localStorage`：始终有效，窗口或浏览器关闭也一直保存，因此用作持久数据；`cookie`只在设置的`cookie`过期时间之前一直有效，即使窗口或浏览器关闭。
作用域不同，`sessionStorage`不在不同的浏览器窗口中共享，即使是同一个页面；`localStorage` 在所有同源窗口中都是共享的；`cookie`也是在所有同源窗口中都是共享的。`Web Storage` 支持事件通知机制，可以将数据更新的通知发送给监听者。`Web Storage` 的 api 接口使用更方便。
:::
## 服务器存储
>把信息存储在指定的服务器中：真实项目中大部分都是基于服务器存储的；
## 真实项目中的本地存储都使用哪些东西?
::: tip
`cookie:`
- 1、记住用户名密码或者是自动登录；
- 2、用户的部分信息,当用户登录成功后我们会把用户的一些信息记录到本地cookie中,这样在项目中的任何页面都可以知道当前登录的用户是哪一个了；
- 3、购物车...(存储少量信息或者是需要浏览器兼容的都需要使用`cookie`来进行存储)

`localStorage:`
1、在PC端我们可以用其存储 某一个JS或者CSS中的源代码(性能优化)；
2、还可以把一些不需要经常更新的数据存储到本地，存储的时候可以设置一个存储的时间，以后重新刷新页面，看一下时间有没有超过预定的时间，如果已经超过了，我们从新获取最新数据，没超过我们使用本地数据；
:::

