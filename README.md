# General Expression Parser

[![Build Status](https://travis-ci.org/cnlon/gep.svg?branch=master)](https://travis-ci.org/cnlon/gep)
[![npm version](https://badge.fury.io/js/gep.svg)](https://badge.fury.io/js/gep)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## Installation

``` bash
npm install --save gep
```

or

``` bash
bower install --save gep
```

## Usage

#### Simple usage

try: [CodePen](http://codepen.io/lon/pen/xROVjv?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/6uz0nd8h/)

``` javascript
import Gep from 'gep'

const gep = new Gep()

const scope = {
  a: 1,
}

const expr = 'a===1 ? true : false'
const parsed = gep.parse(expr) // String, original expression
console.log(parsed)
// $.a===1?true:false
const func = gep.make(parsed) // 1. String, parsed expression
                              // 2. Boolean, default false, make expression to function
                              //             if true, and then make function to string
const res = func(scope)
console.log(res)
// true
```

#### With config

try: [CodePen](http://codepen.io/lon/pen/mOEEXx?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/ko37n7Lc/)

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
const scope = {
  radius: 3,
}

const expr = '(2 * Math.PI * radius).toFixed(2) + meter'
const parsed = gep.parse(expr)
console.log(parsed)
// (2*Math.PI*$.radius).toFixed(2)+units.meter
const func = gep.make(parsed)
const res = func(scope, units)
console.log(res)
// 18.85m
```

#### With function and constant

try: [CodePen](http://codepen.io/lon/pen/rWLLKx?editors=0010#0) [JSFiddle](https://jsfiddle.net/lon/zLso6co4/)

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
const scope = {
  radius: 3,
}

const expr = gep.parse('methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter')
const res = gep.make(expr)(scope, units, methods)
console.log(res)
// 12.14m²
```

## License

[MIT](http://opensource.org/licenses/MIT)
