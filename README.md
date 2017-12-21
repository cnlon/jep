# Javascript Expression Parser

[![npm version](https://img.shields.io/npm/v/jep.svg)](https://www.npmjs.com/package/jep)
[![Build Status](https://travis-ci.org/cnlon/jep.svg?branch=master)](https://travis-ci.org/cnlon/jep)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## 简介

JEP (Javascript Expression Parser) 是一个十分小巧的库，用于将 JavaScript 表达式解析为 JavaScript 函数。

### 优势：

1. 底层转换使用 `Function`，比 `eval` 快。
2. 使用最近最少使用算法（LRU），缓存解析结果，减少解析次数。
3. 支持解析至函数字符串，方便预编译。

## 安装

```bash
npm install jep
```

## 使用

#### 快速上手

try: [CodePen](http://codepen.io/lon/pen/xROVjv?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/6uz0nd8h/)

```javascript
const jep = new JEP()

const fun = jep.make('a + 2 === 3')
const result = fun({a: 1})

console.log(result)
// true
```

#### 使用参数

try: [CodePen](http://codepen.io/lon/pen/rWLLKx?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/zLso6co4/)

```javascript
const jep = new JEP({params: ['$', 'SQUARE_METER']})

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
const result = jep.make(source)(scope, SQUARE_METER)

console.log(result)
// 12.14m²
```

## API

#### 参数

```javascript
const jep = new JEP({
  cache: 1000,
  scope: '$',
  params: ['$', 'other_param'],
})
```

**cache**: `Number` 类型，jep 内部使用 LRU 缓存解析过的表达式，`cache` 表示最大缓存数，默认 `1000`

**scope**: `String` 类型，在已解析的表达式或函数中，用于表示 `scope` 的变量名，默认 `'$'`

```javascript
const jep = new JEP()
const parsed = jep.parse('a + b')
console.log(parsed)
// $.a+$.b
```

**params**: `Array` 类型，该数组中每一项都为 `String` 类型，执行函数时需要依次传入对应的参数。
第一个必须为 `scope` 对应的变量名。其余变量名，在表达式中可以直接被访问。

```javascript
const jep = new JEP({
  params: ['$', 'other'],
})
const scope = {a: 1}
const other = {a: 2}
const result = jep.make('a + other.a')(scope, other)
console.log(result)
// 3
```

#### 方法

**parse**: 参数为 `String` 类型的待编译的表达式，返回编译好的 `String` 类型表达式

```javascript
const jep = new JEP()
const source = 'a + b'
const expression = jep.parse(source)
console.log(expression)
// $.a+$.b
```

**build**: 参数为 `String` 类型的已编译表达式，返回编译好的 `Function` （成功） 或 `undefined` (失败)

```javascript
const jep = new JEP()
const source = 'a + b'
const expression = jep.parse(source) // $.a+$.b
const fun = jep.build(expression) // 返回函数，类似 function($){return $.a+$.b}
const result = fun({a: 1, b: 2})
console.log(result)
// 3
```

**buildToString**: 和 build 类似，参数为 `String` 类型的已编译表达式，返回的是函数字符串

```javascript
const jep = new JEP()
const expression = jep.parse('a + b') // $.a+$.b
const funString = jep.buildToString(expression)
console.log(funString)
// function($){return $.a+$.b}
```

**make**: 和 build 类似，参数为 `String` 类型的待编译表达式，返回编译好的 `Function` （成功） 或 `undefined` (失败)

```javascript
const jep = new JEP()
const source = 'a + b'
const fun = jep.make(source) // 返回函数，类似 function($){return $.a+$.b}
const result = fun({a: 1, b: 2})
console.log(result)
// 3
```

**makeToString**: 和 make 类似，参数为 `String` 类型的待编译表达式，返回的是函数字符串

```javascript
const jep = new JEP()
const funString = jep.makeToString('a + b')
console.log(funString)
// function($){return $.a+$.b}
```

## License

[MIT](http://opensource.org/licenses/MIT)
