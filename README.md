# gep

General Expression Parser

[![Build Status](https://travis-ci.org/longhaohe/gep.svg?branch=master)](https://travis-ci.org/longhaohe/gep)
[![npm version](https://badge.fury.io/js/gep.svg)](https://badge.fury.io/js/gep)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## Installation

``` bash
npm install --save gep
```
## Usage

``` javascript
import gep from 'gep'

let scope = {
  a: 1,
}

const expr = 'a===1 ? true : false'
const func = gep(expr)
console.log(func.toString())
// function anonymous($,_
// /**/) {
// return $.a===1?true:false;
// }
const res = func(scope)
console.log(res)
// true
```

with global

``` javascript
import gep from 'gep'

let scope = {
  radius: 3,
}
let global = {
  constant: 2,
}

const expr = '_.constant * Math.PI * radius'
const func = gep(expr)
console.log(func.toString())
// function anonymous($,_
// /**/) {
// return _.constant*Math.PI*$.radius;
// }
const res = func(scope, global)
console.log(res)
// 18.84955592153876
```

with function

``` javascript
import gep from 'gep'

let scope = {
  radius: 3,
  unit: 'm²',
}
let global = {
  square (n) {
    return n * n
  },
  fixed (numObj, num) {
    return numObj.toFixed(num)
  },
}

const expr = '_.fixed(Math.PI + _.square(radius), 2) + unit'
const func = gep(expr)
console.log(func.toString())
// function anonymous($,_
// /**/) {
// return _.fixed(Math.PI+_.square($.radius),2)+$.unit;
// }
const res = func(scope, global)
console.log(res)
// 12.14m²
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 longhao
