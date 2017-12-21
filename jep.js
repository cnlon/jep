/**
 * Javascript Expression Parser (JEP)
 * https://github.com/cnlon/jep
 *
 * Come from Vue.js v1.0.24
 * https://github.com/vuejs/vue
 */

var Cache = require('zen-lru')

var defaultAllowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,parseInt,parseFloat'
// keywords that don't make sense inside expressions
var improperKeywordsRE =
  new RegExp(
    '^('
    + ('break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,let,return,super,switch,throw,try,var,while,with,yield,enum,await,implements,package,protected,static,interface,private,public').replace(/,/g, '\\b|')
    + '\\b)'
  )

var wsRE = /\s/g
var newlineRE = /\n/g
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g
var restoreRE = /"(\d+)"/g
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g
var booleanLiteralRE = /^(?:true|false)$/

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = []

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
 * @param {String} expression
 * @return {Boolean}
 */

function isSimplePath (expression) {
  return pathTestRE.test(expression)
    // don't treat true/false as paths
    && !booleanLiteralRE.test(expression)
}

/**
 * @param {String} keywords
 * @return {RegExp}
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
 * @param {Object} options
 *   - {Number} cache, default 1000
 *              limited for Cache
 *   - {Array} params, default ['$']
 *              first one is for scope and you can add more params
 * @constructor
 */

function JEP (options) {
  options = options || {}
  var cache = options.cache || 1000
  var scope = options.scope || '$'
  var scopes = options.scopes
  var params = options.params
  if (!params) {
    if (scopes) {
      params = Object.keys(scopes)
      params.unshift(scope)
    } else {
      params = [scope]
    }
  }
  this._cache = new Cache(cache)

  this._funcParams = params.join(',').replace(wsRE, '')
  this._funcBefore = 'function(' + this._funcParams + '){return '
  this._funcAfter = '}'

  this.scope = scope

  if (scopes) {
    var keys = Object.keys(scopes)
    for (var i = 0, l = keys.length, key, keywords; i < l; i++) {
      key = keys[i]
      keywords = scopes[key]
      scopes[key] = parseKeywordsToRE(
        Object.prototype.toString.call(keywords) === '[object Array]'
        ? keywords.join(',')
        : keywords
      )
    }
    this._scopeREs = scopes
  }

  var paramsPrefix
  if (params.length > 1) {
    params = params.slice(1)
    paramsPrefix = params.join(',')
    this._paramsPrefixRE = parseKeywordsToRE(paramsPrefix)
  }

  var allowedKeywords = paramsPrefix
                      ? (paramsPrefix + ',' + defaultAllowedKeywords)
                      : defaultAllowedKeywords
  this._allowedKeywordsRE = parseKeywordsToRE(allowedKeywords)
}

JEP.prototype._addScope = function (expression) {
  if (this._paramsPrefixRE && this._paramsPrefixRE.test(expression)) {
    return expression
  }
  if (this._scopeREs) {
    var keys = Object.keys(this._scopeREs)
    for (var i = 0, l = keys.length, re; i < l; i++) {
      re = this._scopeREs[keys[i]]
      if (re.test(expression)) {
        return keys[i] + '.' + expression
      }
    }
  }
  return this.scope + '.' + expression
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and return the new expression.
 *
 * @param {String} expression
 * @return {String}
 */

JEP.prototype.compile = function (expression) {
  if (process.env.NODE_ENV === 'development') {
    if (improperKeywordsRE.test(expression)) {
      console.warn('Avoid using reserved keywords in expression: ' + expression)
    }
  }
  // reset state
  saved.length = 0
  // save strings and object literal keys
  var body = expression
    .replace(saveRE, save)
    .replace(wsRE, '')
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  var self = this
  var c, path
  return (' ' + body)
    .replace(identRE, function (raw) {
      c = raw.charAt(0)
      path = raw.slice(1)
      if (self._allowedKeywordsRE.test(path)) {
        return raw
      } else {
        path = path.indexOf('"') > -1
          ? path.replace(restoreRE, restore)
          : path
        return c + self._addScope(path)
      }
    })
    .replace(restoreRE, restore)
    .slice(1)
}

/**
 * Parse source to expression.
 *
 * @param {String} source
 * @return {String}
 */

JEP.prototype.parse = function (source) {
  if (!(source && (source = source.trim()))) {
    return ''
  }
  // try cache
  var hit = this._cache.get(source)
  if (hit) {
    return hit
  }
  var result = isSimplePath(source) && source.indexOf('[') < 0
    ? this._addScope(source)
    : this.compile(source)
  this._cache.set(source, result)
  return result
}

/**
 * Build expression to function. Requires eval.
 *
 * @param {String} expression
 * @return {Function|undefined}
 */

JEP.prototype.build = function (expression) {
  try {
    /* eslint-disable no-new-func */
    return new Function(this._funcParams, 'return ' + expression)
    /* eslint-enable no-new-func */
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Invalid expression. Generated function body: ' + expression)
    }
  }
}

/**
 * Build expression to function string.
 *
 * @param {String} expression
 * @return {String}
 */

JEP.prototype.buildToString = function (expression) {
  return this._funcBefore + expression + this._funcAfter
}

/**
 * Parse source to expression and build it to function.
 *
 * @param {String} source
 * @return {Function|undefined}
 */

JEP.prototype.make = function (source) {
  var expression = this.parse(source)
  return this.build(expression)
}

/**
 * Parse source to expression and build it to function string.
 *
 * @param {String} source
 * @return {String}
 */

JEP.prototype.makeToString = function (source) {
  var expression = this.parse(source)
  return this.buildToString(expression)
}


module.exports = JEP
