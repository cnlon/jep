const assert = require('chai').assert
const Gep = require(process.env.FILE || './gep.js')
console.warn(process.env.FILE)
const gep = new Gep({
  scopes: {
    'units': 'squareMeter',
  },
  params: ['$', 'units', 'methods'],
})

const equal = assert.equal

/* global describe, it */
describe('gep', function () {
  const scope = {
    radius: 3,
  }
  const units = {
    squareMeter: 'm²',
  }
  const methods = {
    square: function (n) {
      return n * n
    },
    fixed: function (numObj, num) {
      return numObj.toFixed(num)
    },
  }
  it('"(methods.square(radius) + squareMeter) === \'9m²\' ? true : false" should equal "12.14m²"', function () {
    const expr = '(methods.square(radius) + squareMeter) === \'9m²\' ? true : false'
    const parsed = gep.parse(expr)
    const func = gep.make(parsed)
    const res = func(scope, units, methods)
    equal(res, true)
  })
  it('"methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter" should equal "12.14m²"', function () {
    const expr = 'methods.fixed(Math.PI + methods.square(radius), 2) + squareMeter'
    const parsed = gep.parse(expr)
    const func = gep.make(parsed)
    const res = func(scope, units, methods)
    equal(res, '12.14m²')
  })
})
