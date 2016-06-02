# gep

General Expression Parser

[![Build Status](https://travis-ci.org/longhaohe/gep.svg?branch=master)](https://travis-ci.org/longhaohe/gep)
[![npm version](https://badge.fury.io/js/gep.svg)](https://badge.fury.io/js/gep)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## Usage

``` bash
npm install --save gep
```

``` javascript
import gep from 'gep'

let scope = {
  a: 1,
}
let global = {
  b: 3,
}

const expr = 'a + _.b + Math.PI'
const func = gep(expr)
console.log(func.toString())
// function anonymous($,_
// /**/) {
// return $.a+_.b+Math.PI;
// }
const res = func(scope, global)
console.log(res)
// 7.141592653589793
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 longhao
