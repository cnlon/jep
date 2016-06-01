// var assert = require('chai').assert
var gep = require('../dist/gep.js')

// var equal = assert.equal

// /* global describe, it */
// describe('gep', function () {
//   it('should pass', function () {
    var scope = {
      a: 1,
      b: 2,
    }
    var global = {
      a: 3,
      b: 4,
    }
    var expr = 'scope.a+scope.b+global.a+global.b'
    var func = gep(expr)
    var res = func(scope, global)
    // equal(res, 10)
//   })
// })
