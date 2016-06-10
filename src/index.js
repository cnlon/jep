/**
 * Come from Vue.js v1.0.24
 *
 *   https://github.com/vuejs/vue
 *
 */

import Cache from './cache.js'

let $cache, funcParams, funcBefore

let paramsPrefixRE, allowedKeywordsRE

// keywords that don't make sense inside expressions
const improperKeywordsRE =
  new RegExp(
    '^('
    + ('break,case,class,catch,const,continue,debugger,default,'
      + 'delete,do,else,export,extends,finally,for,function,if,'
      + 'import,in,instanceof,let,return,super,switch,throw,try,'
      + 'var,while,with,yield,enum,await,implements,package,'
      + 'protected,static,interface,private,public'
    ).replace(/,/g, '\\b|')
    + '\\b)'
  )

const wsRE = /\s/g
const newlineRE = /\n/g
const saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g
const restoreRE = /"(\d+)"/g
const pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
const identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g
const booleanLiteralRE = /^(?:true|false)$/

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

let saved = []

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save (str, isString) {
  var i = saved.length
  saved[i] = isString
    ? str.replace(newlineRE, '\\n')
    : str
  return '"' + i + '"'
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore (str, i) {
  return saved[i]
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} expr
 * @return {Boolean}
 */

function isSimplePath (expr) {
  return pathTestRE.test(expr)
    // don't treat true/false as paths
    && !booleanLiteralRE.test(expr)// &&
    // Math constants e.g. Math.PI, Math.E etc.
    // && expr.slice(0, 5) !== 'Math.'
}

/**
 * @param {Object} config
 *   - {Number} cache, default 1000
 *              limited for Cache
 *   - {Array} params, default ['$']
 *              first one is for scope and you can add more params
 * @constructor
 */

export default class Gep {
  constructor ({
    cache = 1000,
    params = ['$'],
  } = {}) {
    funcParams = params.join(',')
    funcBefore = 'function(' + funcParams + '){return '

    $cache = new Cache(cache)

    this.scope = params[0]

    let paramsPrefix
    if (params.length > 1) {
      this.params = params.slice(1)
      paramsPrefix = this.params.join(',')
      paramsPrefixRE =
        new RegExp(
            '^(?:'
          + paramsPrefix.replace(/\$/g, '\\$').replace(/,/g, '|')
          + ')'
        )
    } else {
      this.params = null
    }

    let allowedKeywords =
        'Math,Date,this,true,false,null,undefined,Infinity,NaN,'
      + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,'
      + 'encodeURIComponent,parseInt,parseFloat'
    if (paramsPrefix) {
      allowedKeywords = paramsPrefix.replace(/\$/g, '\\$') + ',' + allowedKeywords
    }
    allowedKeywordsRE =
      new RegExp(
          '^('
        + (allowedKeywords).replace(/,/g, '\\b|')
        + '\\b)'
      )
  }

  /**
   * Rewrite an expression, prefixing all path accessors with
   * `scope.` and return the new expression.
   *
   * @param {String} expr
   * @return {String}
   */

  compile (expr) {
    if (improperKeywordsRE.test(expr)) {
      if (process.env.NODE_ENV !== 'production'
        && console && console.warn
      ) {
        console.warn('Avoid using reserved keywords in expression: ' + expr)
      }
    }
    // reset state
    saved.length = 0
    // save strings and object literal keys
    let body = expr
      .replace(saveRE, save)
      .replace(wsRE, '')
    // rewrite all paths
    // pad 1 space here becaue the regex matches 1 extra char
    body = (' ' + body)
      .replace(identRE, (raw) => {
        let c = raw.charAt(0)
        let path = raw.slice(1)
        if (allowedKeywordsRE.test(path)) {
          return raw
        } else {
          path = path.indexOf('"') > -1
            ? path.replace(restoreRE, restore)
            : path
          return c + this.scope + '.' + path
        }
      })
      .replace(restoreRE, restore)
    return body.slice(1)
  }

  /**
   * Build a getter function. Requires eval.
   *
   * We isolate the try/catch so it doesn't affect the
   * optimization of the parse function when it is not called.
   *
   * @param {String} body
   * @param {String} toStr
   * @return {Function|String|undefined}
   */

  make (body, toStr) {
    if (toStr) {
      return funcBefore + body + '}'
    }
    try {
      /* eslint-disable no-new-func */
      return new Function(funcParams, 'return ' + body)
      /* eslint-enable no-new-func */
    } catch (e) {
      if (process.env.NODE_ENV !== 'production'
        && console && console.warn
      ) {
        console.warn(
          'Invalid expression. Generated function body: '
          + body
        )
      }
    }
  }

  /**
   * Parse an expression.
   *
   * @param {String} expr
   * @param {Boolean} toFunc
   *                  make the parsed expression if true
   * @return {Function}
   */

  parse (expr, toFunc) {
    if (!(expr && (expr = expr.trim()))) {
      return ''
    }
    // try cache
    var hit = $cache.get(expr)
    if (hit) {
      return hit
    }
    var res = isSimplePath(expr) && expr.indexOf('[') < 0
      // optimized super simple getter
      ? paramsPrefixRE && paramsPrefixRE.test(expr)
        ? expr
        : this.scope + '.' + expr
      // dynamic getter
      : this.compile(expr)
    $cache.put(expr, res)
    if (toFunc) {
      res = this.make(res)
    }
    return res
  }
}
