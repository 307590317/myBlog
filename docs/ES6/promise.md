---
title: Promise源码
sidebarDepth: 0
---
[[toc]]
# Promise源码
```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
class Primose {
  constructor(exector) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined
    this.onResolvedCbs = []
    this.onRejectedCbs = []
    const resolve = data => {
      if (data instanceof Promise) {
        return data.then(resolve, reject)
      }
      if (this.state === PENDING) {
        this.state = FULFILLED
        this.value = data
        this.onResolvedCbs.forEach(fn => fn())
      }
    }
    const reject = err => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = err
        this.onRejectedCbs.forEach(fn => fn())
      }
    }
    try {
      exector(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfiled, onRejected) {
    onFulfiled = typeof onFulfiled === 'function' ? onFulfiled : data => data
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
    const p2 = new Promise((resolve, reject) => {
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfiled(this.value)
            resolvePromise(p2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(p2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === PENDING) {
        this.onResolvedCbs.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfiled(this.value)
              resolvePromise(p2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCbs.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(p2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return p2
  }

  catch(err){
    return this.then(null, err)
  }

  finally(fn){
    return this.then(data=>{
      // 如果fn返回的是promise需要等promise resolve的结果后再then
      return Promise.resolve(fn()).then(()=>data)
    },err=>{
      // 使用 Promise.resolve 就是为了防止fn是promise，后面的then必须用成功的回调去抛错
      // return Promise.resolve(fn()).then(null,()=>{throw err}) // then 这样不行是因为 fn的返回结果会直接进到下一个then的成功回调里而不是失败回调
      return Promise.resolve(fn()).then(()=>{throw err})
    })
  }

  static resolve(data) {
    if(data instanceof Promise){
      return data
    }
    return new Promise((resolve, reject) => {
      resolve(data)
    })
  }

  static reject(err){
    return new Promise((resolve, reject) => {
      reject(err)
    });
  }

  static all(ary){
    ary = ary || []
    const res = []
    return new Promise((resolve, reject) => {
      if(!ary.length) {
        resolve(res)
        return 
      };
      let time = 0
      for (let i = 0; i < ary.length; i++) {
        const p = ary[i];
        // p是promise
        processData(i,p)
      }
      function processData(i,p) {
        if(p && (typeof p.then === 'function')){
          p.then(data=>{
            processData(i,data)
          },reject)
        }else{
          res[i] = p
          if(++time === ary.length) resolve(res)
        }
      }
    });
  }

  static race(ary){
    ary = ary || []
    return new Promise((resolve,reject)=>{
      for(let i = 0;i<ary.length;i++){
        processData(ary[i])
      }
      function processData(val){
        if(val && typeof val.then === 'function'){
          val.then(data=>{
            processData(data)
          }).catch(err=>{
            reject(err)
          })
        }else{
          resolve(val)
        }
      }
    })
  }
}

function resolvePromise(p2, x, resolve, reject) {
  if (p2 === x) {
    return reject(new TypeError('循环引用'))
  }
  if (x && (typeof x === 'object' || typeof x === 'function')) {
    let called
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(p2, y, resolve, reject)
        }, r => {
          if (called) return
          called = true
          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}
```