var gep = require('./dev.js')

var scope = {
  a: 1,
  b: 2,
}
var global = {
  c: 3,
}
function test (expr) {
  var func = gep(expr)
  console.log(func.toString())
  var res = func(scope, global)
  console.log(res)
}

var expr = 'b===2?true:false'
test(expr)

gep.setGlobal('global')

expr = 'Math.PI + global.c + a'
test(expr)
