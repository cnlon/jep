var assert = require('chai').assert
var gep = require('../dist/gep.js')

var equal = assert.equal

/* global describe, it */
describe('gep', function () {
  var scope = {
    a: 1,
    square: function (n) {
      return n * n
    },
  }
  var global = {
    a: 1,
  }
  it('"a + _.a" should equal 2', function () {
    var expr = 'a + _.a'
    var res = gep(expr)(scope, global)
    equal(res, 2)
  })
  it('"Math.PI * square(a)" should equal Math.PI', function () {
    var expr = 'Math.PI * square(a)'
    var res = gep(expr)(scope)
    equal(res, Math.PI)
  })
  it('"(a - _.a) === 0 ? true : false" should equal true', function () {
    var expr = '(a - _.a) === 0 ? true : false'
    var res = gep(expr)(scope, global)
    equal(res, true)
  })
  it('"a - global.a + Math.PI" should equal 2', function () {
    gep.setGlobal('global')
    var expr = 'a - global.a + Math.PI'
    var res = gep(expr)(scope, global)
    equal(res, Math.PI)
  })
  it('"++global.a" should equal 2', function () {
    var expr = '++global.a'
    var res = gep(expr)(scope, global)
    equal(res, 2)
  })
  it('now global.a should equal 2', function () {
    equal(global.a, 2)
  })
})
