const assert = require('chai').assert
const Gep = require(process.env.FILE || './gep.js')
const gep = new Gep({params: ['$', 'SQUARE_METER']})

const equal = assert.equal

/* global describe, it */
describe('gep', function () {
  const scope = {
    radius: 3,
    square (n) {
      return n * n
    },
    fixed (numObj, num) {
      return numObj.toFixed(num)
    },
  }
  const SQUARE_METER = 'm²'

  it('"(square(radius) + SQUARE_METER) === \'9m²\' ? true : false" should equal true', function () {
    const source = '(square(radius) + SQUARE_METER) === \'9m²\' ? true : false'
    const fun = gep.make(source)
    const result = fun(scope, SQUARE_METER)
    equal(result, true)
  })
  it('"fixed(Math.PI + square(radius), 2) + SQUARE_METER" should equal "12.14m²"', function () {
    const source = 'fixed(Math.PI + square(radius), 2) + SQUARE_METER'
    const fun = gep.make(source)
    const result = fun(scope, SQUARE_METER)
    equal(result, '12.14m²')
  })
})
