/**
 * Come from Vue.js v1.0.24
 *
 *   https://github.com/vuejs/vue
 *
 */

import Cache from './cache.js'

const defaultAllowedKeywords =
        'Math,Date,this,true,false,null,undefined,Infinity,NaN,'
      + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,'
      + 'encodeURIComponent,parseInt,parseFloat'

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
  let i = saved.length
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
 * Check if an expression is a simple path.
 *
 * @param {String} expr
 * @return {Boolean}
 */

function parseKeywordsToRE (keywords) {
  return new RegExp(
        '^(?:'
      + keywords
        .replace(wsRE, '')
        .replace(/\$/g, '\\$')
        .replace(/,/g, '\\b|')
      + '\\b)'
    )
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
    scope = '$',
    scopes,
    params = scopes
           ? Object.keys(scopes).unshift(scope)
           : [scope],
  } = {}) {
    this._cache = new Cache(cache)

    this._funcParams = params.join(',').replace(wsRE, '')
    this._funcBefore = 'function(' + this._funcParams + '){return '

    this.scope = scope

    if (scopes) {
      let keywords
      Object.keys(scopes).forEach(key => {
        keywords = scopes[key]
        if (Array.isArray(keywords)) {
          keywords = keywords.join(',')
        }
        scopes[key] = parseKeywordsToRE(keywords)
      })
      this._scopeREs = scopes
    }

    let paramsPrefix
    if (params.length > 1) {
      params = params.slice(1)
      paramsPrefix = params.join(',')
      this._paramsPrefixRE = parseKeywordsToRE(paramsPrefix)
    }

    let allowedKeywords = paramsPrefix
                        ? paramsPrefix
                          + ','
                          + defaultAllowedKeywords
                        : defaultAllowedKeywords
    this._allowedKeywordsRE = parseKeywordsToRE(allowedKeywords)
  }

  _addScope (expr) {
    if (this._paramsPrefixRE && this._paramsPrefixRE.test(expr)) {
      return expr
    }
    if (this._scopeREs) {
      let keys = Object.keys(this._scopeREs)
      let re
      for (let i = 0, l = keys.length; i < l; i++) {
        re = this._scopeREs[keys[i]]
        if (re.test(expr)) {
          return keys[i] + '.' + expr
        }
      }
    }
    return this.scope + '.' + expr
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
    let body = expr.replace(saveRE, save)
    // rewrite all paths
    // pad 1 space here becaue the regex matches 1 extra char
    body = (' ' + body)
      .replace(identRE, (raw) => {
        let c = raw.charAt(0)
        let path = raw.slice(1)
        if (this._allowedKeywordsRE.test(path)) {
          return raw
        } else {
          path = path.indexOf('"') > -1
            ? path.replace(restoreRE, restore)
            : path
          return c + this._addScope(path)
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
      return this._funcBefore + body + '}'
    }
    try {
      /* eslint-disable no-new-func */
      return new Function(this._funcParams, 'return ' + body)
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
   * @return {Function}
   */

  parse (expr) {
    if (!(expr && (expr = expr.replace(wsRE, '')))) {
      return ''
    }
    // try cache
    let hit = this._cache.get(expr)
    if (hit) {
      return hit
    }
    let res = isSimplePath(expr) && expr.indexOf('[') < 0
      ? this._addScope(expr)
      // dynamic getter
      : this.compile(expr)
    this._cache.put(expr, res)
    return res
  }
}
