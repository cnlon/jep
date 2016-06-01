/**
 * @param {String} expression
 * @return {Function}
 * @public
 */

export default function gep (expression) {
  try {
    /* eslint-disable no-new-func, no-spaced-func */
    return Function ('scope', 'global', 'return ' + expression + ';')
    /* eslint-enable no-new-func, no-spaced-func */
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Invalid expression: ' + expression)
      }
    }
  }
}
