# gep

General Expression Parser

[![Build Status](https://travis-ci.org/lon3/gep.svg?branch=master)](https://travis-ci.org/lon3/gep)
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
let parsed = gep.parse(expr) // String, original expression
console.log(parsed)
// $.a===1?true:false
let func = gep.make(parsed) // 1. String, parsed expression
                            // 2. Boolean, default false, make expression to function
                            //             if true, and then make function to string
let res = func(scope)
console.log(res)
// true
```

with config

``` javascript
import Gep from 'gep'

const gep = new Gep({
  cache: 500, // Number, default 1000, the maximum number for caching expression
  scope: '$', // String, default '$'
  scopes: {   // Object, it's sub scopes
    units: ['meter', 'squareMeter'], // key is sub scope name
                                     // value is an array of keywords
  },
  params: ['$', 'units'], // Array, default contains '$' and scopes's keys
                          //        it's the order of params for calling the
                          //        function made by method make
})

const units = {
  meter: 'm',
}
let scope = {
  radius: 3,
}

let expr = '(2 * Math.PI * radius).toFixed(2) + meter'
let parsed = gep.parse(expr)
console.log(parsed)
// (2*Math.PI*$.radius).toFixed(2)+units.meter
let func = gep.make(parsed)
let res = func(scope, units)
console.log(res)
// 18.85m
```

with function and constant

``` javascript
import Gep from 'gep'

const gep = new Gep({
  scopes: {
    units: ['meter', 'squareMeter'],
  },
  params: ['$', 'units', 'methods'], // if param is not in scopes, it will not be prefixed
})

const units = {
  meter: 'm',
  squareMeter: 'm²',
}
const methods = {
  square (n) {
    return n * n
  },
  fixed (numObj, num) {
    return numObj.toFixed(num)
  },
}
let scope = {
  radius: 3,
}

let expr = gep.parse('methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter')
let res = gep.make(expr)(scope, units, methods)
console.log(res)
// 12.14m²
```

## Contributing

Thanks so much for wanting to help! I really appreciate it.

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
