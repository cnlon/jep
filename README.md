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
import Gep from 'gep'

const gep = new Gep()

let scope = {
  a: 1,
}

let expr = 'a===1 ? true : false'
let parsed = gep.parse(expr)
console.log(parsed)
// $.a===1?true:false
let func = gep.make(parsed)
console.log(func.toString())
// function anonymous($,_
// /**/) {
// return $.a===1?true:false;
// }
let res = func(scope)
console.log(res)
// true
```

with config and global

``` javascript
import Gep from 'gep'

const gep = new Gep({
  cache: 100, // Number, default 1000
  global: 'g', // String, default '_'
})

let scope = {
  radius: 3,
}
let global = {
  constant: 2,
}

let expr = 'g.constant * Math.PI * radius'
let parsed = gep.parse(expr)
console.log(parsed)
// g.constant*Math.PI*$.radius
let func = gep.make(parsed)
console.log(func.toString())
// function anonymous($,g
// /**/) {
// return g.constant*Math.PI*$.radius;
// }
let res = func(scope, global)
console.log(res)
// 18.84955592153876
```

with function

``` javascript
import Gep from 'gep'

const gep = new Gep()

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

let expr = '_.fixed(Math.PI + _.square(radius), 2) + unit'
let func = gep.parse(expr, true) // and make to function if the second param is true
console.log(func.toString())
// function anonymous($,_
// /**/) {
// return _.fixed(Math.PI+_.square($.radius),2)+$.unit;
// }
let res = func(scope, global)
console.log(res)
// 12.14m²
```

## Contributing

Thanks so much for wanting to help! We really appreciate it.

- Have an idea for a new feature?
- Want to add a new built-in theme?

Excellent! You've come to the right place.

1. If you find a bug or wish to suggest a new feature, please create an issue first
2. Make sure your code conventions are in-line with the project's style
3. Make your commits and PRs as tiny as possible - one feature or bugfix at a time
4. Write detailed commit messages, in-line with the project's commit naming conventions

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 longhao
