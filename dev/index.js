const Gep = require('./dev.js')
const gep = new Gep({
  params: ['$', '$global'],
})

const scope = {
  radius: 3,
  unit: 'm²',
}
const global = {
  square (n) {
    return n * n
  },
  fixed (numObj, num) {
    return numObj.toFixed(num)
  },
}

const expr = '$global.fixed(Math.PI + $global.square(radius), 2) + unit'
const parsed = gep.parse(expr)
console.log(parsed)
const funcStr = gep.make(parsed, true)
console.log(funcStr)
const func = gep.make(parsed)
const res = func(scope, global)
console.log(res)





// const gep = new Gep()

// let scope = {
//   a: 1,
// }

// let expr = 'a===1 ? true : false'
// let parsed = gep.parse(expr)
// console.log(parsed)
// // $.a===1?true:false
// let func = gep.make(parsed)
// let res = func(scope)
// console.log(res)
// // true





// const gep = new Gep({
//   cache: 100, // Number, default 1000
//   params: ['$', '$global'], // Array, default ['$']
// })

// let scope = {
//   radius: 3,
// }
// let global = {
//   constant: 2,
// }

// let expr = '$global.constant * Math.PI * radius'
// let parsed = gep.parse(expr)
// console.log(parsed)
// // $global.constant*Math.PI*$.radius
// let func = gep.make(parsed)
// let res = func(scope, global)
// console.log(res)
// // 18.84955592153876





// const gep = new Gep({
//   params: ['$', '_'],
// })

// let scope = {
//   radius: 3,
//   unit: 'm²',
// }
// let global = {
//   square (n) {
//     return n * n
//   },
//   fixed (numObj, num) {
//     return numObj.toFixed(num)
//   },
// }

// let expr = gep.parse('_.fixed(Math.PI + _.square(radius), 2) + unit')
// let res = gep.make(expr)(scope, global)
// console.log(res)
// // 12.14m²
