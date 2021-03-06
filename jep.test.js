const assert = require('assert')
const JEP = require('./jep.js')

const jep = new JEP({params: ['$', 'SQUARE_METER']})

describe('JEP', function () {
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
    const fun = jep.make(source)
    const result = fun(scope, SQUARE_METER)
    assert.equal(result, true)
  })
  it('"fixed(Math.PI + square(radius), 2) + SQUARE_METER" should equal "12.14m²"', function () {
    const source = 'fixed(Math.PI + square(radius), 2) + SQUARE_METER'
    const fun = jep.make(source)
    const result = fun(scope, SQUARE_METER)
    assert.equal(result, '12.14m²')
  })
})
