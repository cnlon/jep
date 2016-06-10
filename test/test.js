var assert = require('chai').assert
var Gep = require('../dist/gep.js')
const gep = new Gep({
  params: ['$', '_'],
})

var equal = assert.equal

/* global describe, it */
describe('gep', function () {
  var scope = {
    radius: 3,
    unit: 'm²',
  }
  var global = {
    square: function (n) {
      return n * n
    },
    fixed: function (numObj, num) {
      return numObj.toFixed(num)
    },
  }
  it('"(_.square(radius) + unit) === \'9m²\' ? true : false" should equal "12.14m²"', function () {
    var expr = '(_.square(radius) + unit) === \'9m²\' ? true : false'
    var parsed = gep.parse(expr)
    var func = gep.make(parsed)
    var res = func(scope, global)
    equal(res, true)
  })
  it('"_.fixed(Math.PI + _.square(radius), 2) + unit" should equal "12.14m²"', function () {
    var expr = '_.fixed(Math.PI + _.square(radius), 2) + unit'
    var parsed = gep.parse(expr)
    var func = gep.make(parsed)
    var res = func(scope, global)
    equal(res, '12.14m²')
  })
})
