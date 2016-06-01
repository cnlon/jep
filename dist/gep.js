/**
 * gep --- By longhao <longhaohe@gmail.com> (http://longhaohe.com/)
 * Github: https://github.com/longhaohe/gep
 * MIT Licensed.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('gep', factory) :
  (global.gep = factory());
}(this, function () { 'use strict';

  /**
   * @param {String} expression
   * @return {Function}
   * @public
   */

  function gep(expression) {
    try {
      /* eslint-disable no-new-func, no-spaced-func */
      return Function('scope', 'global', 'return ' + expression + ';');
      /* eslint-enable no-new-func, no-spaced-func */
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('Invalid expression: ' + expression);
        }
      }
    }
  }

  return gep;

}));
//# sourceMappingURL=gep.js.map