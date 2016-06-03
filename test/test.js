var assert = require('chai').assert
var Gep = require('../dist/gep.js')
var gep = new Gep()

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
    var res = gep.parse(expr, true)(scope, global)
    equal(res, true)
  })
  it('"_.fixed(Math.PI + _.square(radius), 2) + unit" should equal "12.14m²"', function () {
    var expr = '_.fixed(Math.PI + _.square(radius), 2) + unit'
    var res = gep.parse(expr, true)(scope, global)
    equal(res, '12.14m²')
  })
})
