const Gep = require('./dev.js')
const gep = new Gep()

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

const expr = '_.fixed(Math.PI + _.square(radius), 2) + unit'
const parsed = gep.parse(expr)
console.log(parsed)
const func = gep.make(parsed)
console.log(func.toString())
const res = func(scope, global)
console.log(res)
