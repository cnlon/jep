const gep = require('./dev.js')

const scope = {
  radius: 3,
  unit: 'm²',
}
const global = {
  square: function (n) {
    return n * n
  },
  fixed: function (numObj, num) {
    return numObj.toFixed(num)
  },
}

const expr = '_.fixed(Math.PI + _.square(radius), 2) + unit'
const func = gep(expr)
console.log(func.toString())
const res = func(scope, global)
console.log(res)
