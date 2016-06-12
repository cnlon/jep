var assert = require('chai').assert
var Gep = require('../dist/gep.js')
const gep = new Gep({
  scopes: {
    'units': 'squareMeter',
  },
  params: ['$', 'units', 'methods'],
})

var equal = assert.equal

/* global describe, it */
describe('gep', function () {
  var scope = {
    radius: 3,
  }
  var units = {
    squareMeter: 'm²',
  }
  var methods = {
    square: function (n) {
      return n * n
    },
    fixed: function (numObj, num) {
      return numObj.toFixed(num)
    },
  }
  it('"(methods.square(radius) + squareMeter) === \'9m²\' ? true : false" should equal "12.14m²"', function () {
    var expr = '(methods.square(radius) + squareMeter) === \'9m²\' ? true : false'
    var parsed = gep.parse(expr)
    var func = gep.make(parsed)
    var res = func(scope, units, methods)
    equal(res, true)
  })
  it('"methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter" should equal "12.14m²"', function () {
    var expr = 'methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter'
    var parsed = gep.parse(expr)
    var func = gep.make(parsed)
    var res = func(scope, units, methods)
    equal(res, '12.14m²')
  })
})
