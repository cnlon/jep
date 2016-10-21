const Gep = require('./dev.js')


/* ---------- demo1 ---------- */

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



/* ---------- demo2 ---------- */

// const gep = new Gep({
//   cache: 500, // Number, default 1000, the maximum number for caching expression
//   scope: '$', // String, default '$'
//   scopes: {   // Object, it's sub scopes
//     units: ['meter', 'squareMeter'], // key is sub scope name
//                                      // value is an array of keywords
//   },
//   params: ['$', 'units'], // Array, default contains '$' and scopes's keys
//                           //        it's the order of params for calling the
//                           //        function made by method make
// })

// const units = {
//   meter: 'm',
// }
// let scope = {
//   radius: 3,
// }

// let expr = '(2 * Math.PI * radius).toFixed(2) + meter'
// let parsed = gep.parse(expr)
// console.log(parsed)
// // $global.constant*Math.PI*$.radius
// let func = gep.make(parsed)
// let res = func(scope, units)
// console.log(res)
// // 18.84955592153876



/* ---------- demo3 ---------- */

// const gep = new Gep({
//   scopes: {
//     units: ['meter', 'squareMeter'],
//   },
//   params: ['$', 'units', 'methods'], // if param is not in scopes, it will not be prefixed
// })

// const units = {
//   meter: 'm',
//   squareMeter: 'm²',
// }
// const methods = {
//   square (n) {
//     return n * n
//   },
//   fixed (numObj, num) {
//     return numObj.toFixed(num)
//   },
// }
// let scope = {
//   radius: 3,
// }

// let expr = gep.parse('methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter')
// let res = gep.make(expr)(scope, units, methods)
// console.log(res)
// // 12.14m²
