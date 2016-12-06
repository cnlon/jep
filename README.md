# General Expression Parser

[![Build Status](https://travis-ci.org/cnlon/gep.svg?branch=master)](https://travis-ci.org/cnlon/gep)
[![npm version](https://badge.fury.io/js/gep.svg)](https://badge.fury.io/js/gep)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## 安装

```bash
npm install --save gep
```

或

```bash
bower install --save gep
```

## 使用

#### 快速上手

try: [CodePen](http://codepen.io/lon/pen/xROVjv?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/6uz0nd8h/)

```javascript
const gep = new Gep()

const fun = gep.make('a + 2 === 3')
const result = fun({a: 1})

console.log(result)
// true
```

#### 使用参数

try: [CodePen](http://codepen.io/lon/pen/rWLLKx?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/zLso6co4/)

```javascript
const gep = new Gep({params: ['$', 'SQUARE_METER']})

const scope = {
  radius: 3,
  square (n) {
    return n * n
  },
  fixed (numObj, num) {
    return numObj.toFixed(num)
  },
}
const SQUARE_METER = 'm²'

const source = 'fixed((Math.PI + square(radius)), 2) + SQUARE_METER'
const result = gep.make(source)(scope, SQUARE_METER)

console.log(result)
// 12.14m²
```

## API

#### 参数

```javascript
const gep = new Gep({
  cache: 1000,
  scope: '$',
  params: ['$', 'other_param'],
})
```

**cache**: `Number` 类型，gep 内部使用 LRU 缓存解析过的表达式，`cache` 表示最大缓存数，默认 `1000`

**scope**: `String` 类型，已解析的表达式或函数中，用于表示 `scope` 的变量名，默认 `'$'`

```javascript
const gep = new Gep()
const parsed = gep.parse('a + b')
console.log(parsed)
// $.a+$.b
```

**params**: `Array` 类型，该数组中每一项都为 `String` 类型，执行函数时需要依次传入对应的参数。
第一个必须为 `scope` 对应的变量名。其余变量名，在表达式中可以直接被访问。

```javascript
const gep = new Gep({
  params: ['$', 'other'],
})
const scope = {a: 1}
const other = {a: 2}
const result = gep.make('a + other.a')(scope, other)
console.log(result)
// 3
```

#### 方法

**parse**: 参数为 `String` 类型的待编译的表达式，返回编译好的 `String` 类型表达式

```javascript
const gep = new Gep()
const source = 'a + b'
const expression = gep.parse(source)
console.log(expression)
// $.a+$.b
```

**build**: 参数为 `String` 类型的已编译表达式，返回编译好的 `Function` （成功） 或 `undefined` (失败)

```javascript
const gep = new Gep()
const source = 'a + b'
const expression = gep.parse(source) // $.a+$.b
const fun = gep.build(expression) // 返回函数，类似 function($){return $.a+$.b}
const result = fun({a: 1, b: 2})
console.log(result)
// 3
```

**buildToString**: 和 build 类似，参数为 `String` 类型的已编译表达式，返回的是函数字符串

```javascript
const gep = new Gep()
const expression = gep.parse('a + b') // $.a+$.b
const funString = gep.buildToString(expression)
console.log(funString)
// function($){return $.a+$.b}
```

**make**: 和 build 类似，参数为 `String` 类型的待编译表达式，返回编译好的 `Function` （成功） 或 `undefined` (失败)

```javascript
const gep = new Gep()
const source = 'a + b'
const fun = gep.make(source) // 返回函数，类似 function($){return $.a+$.b}
const result = fun({a: 1, b: 2})
console.log(result)
// 3
```

**makeToString**: 和 make 类似，参数为 `String` 类型的待编译表达式，返回的是函数字符串

```javascript
const gep = new Gep()
const funString = gep.makeToString('a + b')
console.log(funString)
// function($){return $.a+$.b}
```

## License

[MIT](http://opensource.org/licenses/MIT)
