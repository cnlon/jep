var gep = require('./dev.js')

var scope = {
  a: 1,
}
var global = {
  b: 3,
}

var expr = 'a + _.b + Math.PI'
var func = gep(expr)
console.log(func.toString())
var res = func(scope, global)
console.log(res)
