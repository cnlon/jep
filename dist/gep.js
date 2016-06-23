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
   * A doubly linked list-based Least Recently Used (LRU)
   * cache. Will keep most recently used items while
   * discarding least recently used items when its limit is
   * reached. This is a bare-bone version of
   * Rasmus Andersson's js-lru:
   *
   *   https://github.com/rsms/js-lru
   *
   * @param {Number} limit
   * @constructor
   */

  function Cache(limit) {
    this.size = 0;
    this.limit = limit;
    this.head = this.tail = undefined;
    this._keymap = Object.create(null);
  }

  var p = Cache.prototype;

  /**
   * Put <value> into the cache associated with <key>.
   * Returns the entry which was removed to make room for
   * the new entry. Otherwise undefined is returned.
   * (i.e. if there was enough room already).
   *
   * @param {String} key
   * @param {*} value
   * @return {Entry|undefined}
   */

  p.put = function (key, value) {
    var removed;
    if (this.size === this.limit) {
      removed = this.shift();
    }

    var entry = this.get(key, true);
    if (!entry) {
      entry = {
        key: key
      };
      this._keymap[key] = entry;
      if (this.tail) {
        this.tail.newer = entry;
        entry.older = this.tail;
      } else {
        this.head = entry;
      }
      this.tail = entry;
      this.size++;
    }
    entry.value = value;

    return removed;
  };

  /**
   * Purge the least recently used (oldest) entry from the
   * cache. Returns the removed entry or undefined if the
   * cache was empty.
   */

  p.shift = function () {
    var entry = this.head;
    if (entry) {
      this.head = this.head.newer;
      this.head.older = undefined;
      entry.newer = entry.older = undefined;
      this._keymap[entry.key] = undefined;
      this.size--;
    }
    return entry;
  };

  /**
   * Get and register recent use of <key>. Returns the value
   * associated with <key> or undefined if not in cache.
   *
   * @param {String} key
   * @param {Boolean} returnEntry
   * @return {Entry|*}
   */

  p.get = function (key, returnEntry) {
    var entry = this._keymap[key];
    if (entry === undefined) return;
    if (entry === this.tail) {
      return returnEntry ? entry : entry.value;
    }
    // HEAD--------------TAIL
    //   <.older   .newer>
    //  <--- add direction --
    //   A  B  C  <D>  E
    if (entry.newer) {
      if (entry === this.head) {
        this.head = entry.newer;
      }
      entry.newer.older = entry.older; // C <-- E.
    }
    if (entry.older) {
      entry.older.newer = entry.newer; // C. --> E
    }
    entry.newer = undefined; // D --x
    entry.older = this.tail; // D. --> E
    if (this.tail) {
      this.tail.newer = entry; // E. <-- D
    }
    this.tail = entry;
    return returnEntry ? entry : entry.value;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defaultAllowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';

  // keywords that don't make sense inside expressions
  var improperKeywordsRE = new RegExp('^(' + ('break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'protected,static,interface,private,public').replace(/,/g, '\\b|') + '\\b)');

  var wsRE = /\s/g;
  var newlineRE = /\n/g;
  var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
  var restoreRE = /"(\d+)"/g;
  var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
  var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
  var booleanLiteralRE = /^(?:true|false)$/;

  /**
   * Save / Rewrite / Restore
   *
   * When rewriting paths found in an expression, it is
   * possible for the same letter sequences to be found in
   * strings and Object literal property keys. Therefore we
   * remove and store these parts in a temporary array, and
   * restore them after the path rewrite.
   */

  var saved = [];

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

  function save(str, isString) {
    var i = saved.length;
    saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
    return '"' + i + '"';
  }

  /**
   * Restore replacer
   *
   * @param {String} str
   * @param {String} i - matched save index
   * @return {String}
   */

  function restore(str, i) {
    return saved[i];
  }

  /**
   * Check if an expression is a simple path.
   *
   * @param {String} expr
   * @return {Boolean}
   */

  function isSimplePath(expr) {
    return pathTestRE.test(expr)
    // don't treat true/false as paths
     && !booleanLiteralRE.test(expr); // &&
    // Math constants e.g. Math.PI, Math.E etc.
    // && expr.slice(0, 5) !== 'Math.'
  }

  /**
   * Check if an expression is a simple path.
   *
   * @param {String} expr
   * @return {Boolean}
   */

  function parseKeywordsToRE(keywords) {
    return new RegExp('^(?:' + keywords.replace(wsRE, '').replace(/\$/g, '\\$').replace(/,/g, '\\b|') + '\\b)');
  }

  /**
   * @param {Object} config
   *   - {Number} cache, default 1000
   *              limited for Cache
   *   - {Array} params, default ['$']
   *              first one is for scope and you can add more params
   * @constructor
   */

  var Gep = function () {
    function Gep() {
      var _this = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$cache = _ref.cache;
      var cache = _ref$cache === undefined ? 1000 : _ref$cache;
      var _ref$scope = _ref.scope;
      var scope = _ref$scope === undefined ? '$' : _ref$scope;
      var scopes = _ref.scopes;
      var params = _ref.params;
      classCallCheck(this, Gep);

      if (!params) {
        if (scopes) {
          params = Object.keys(scopes);
          params.unshift(scope);
        } else {
          params = [scope];
        }
      }
      this._cache = new Cache(cache);

      this._funcParams = params.join(',').replace(wsRE, '');
      this._funcBefore = 'function(' + this._funcParams + '){return ';

      this.scope = scope;

      if (scopes) {
        (function () {
          var keywords = void 0;
          Object.keys(scopes).forEach(function (key) {
            keywords = scopes[key];
            if (Array.isArray(keywords)) {
              keywords = keywords.join(',');
            }
            scopes[key] = parseKeywordsToRE(keywords);
          });
          _this._scopeREs = scopes;
        })();
      }

      var paramsPrefix = void 0;
      if (params.length > 1) {
        params = params.slice(1);
        paramsPrefix = params.join(',');
        this._paramsPrefixRE = parseKeywordsToRE(paramsPrefix);
      }

      var allowedKeywords = paramsPrefix ? paramsPrefix + ',' + defaultAllowedKeywords : defaultAllowedKeywords;
      this._allowedKeywordsRE = parseKeywordsToRE(allowedKeywords);
    }

    createClass(Gep, [{
      key: '_addScope',
      value: function _addScope(expr) {
        if (this._paramsPrefixRE && this._paramsPrefixRE.test(expr)) {
          return expr;
        }
        if (this._scopeREs) {
          var keys = Object.keys(this._scopeREs);
          var re = void 0;
          for (var i = 0, l = keys.length; i < l; i++) {
            re = this._scopeREs[keys[i]];
            if (re.test(expr)) {
              return keys[i] + '.' + expr;
            }
          }
        }
        return this.scope + '.' + expr;
      }

      /**
       * Rewrite an expression, prefixing all path accessors with
       * `scope.` and return the new expression.
       *
       * @param {String} expr
       * @return {String}
       */

    }, {
      key: 'compile',
      value: function compile(expr) {
        var _this2 = this;

        if (improperKeywordsRE.test(expr)) {
          if (process.env.NODE_ENV !== 'production' && console && console.warn) {
            console.warn('Avoid using reserved keywords in expression: ' + expr);
          }
        }
        // reset state
        saved.length = 0;
        // save strings and object literal keys
        var body = expr.replace(saveRE, save).replace(wsRE, '');
        // rewrite all paths
        // pad 1 space here becaue the regex matches 1 extra char
        body = (' ' + body).replace(identRE, function (raw) {
          var c = raw.charAt(0);
          var path = raw.slice(1);
          if (_this2._allowedKeywordsRE.test(path)) {
            return raw;
          } else {
            path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
            return c + _this2._addScope(path);
          }
        }).replace(restoreRE, restore);
        return body.slice(1);
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

    }, {
      key: 'make',
      value: function make(body, toStr) {
        if (toStr) {
          return this._funcBefore + body + '}';
        }
        try {
          /* eslint-disable no-new-func */
          return new Function(this._funcParams, 'return ' + body);
          /* eslint-enable no-new-func */
        } catch (e) {
          if (process.env.NODE_ENV !== 'production' && console && console.warn) {
            console.warn('Invalid expression. Generated function body: ' + body);
          }
        }
      }

      /**
       * Parse an expression.
       *
       * @param {String} expr
       * @return {Function}
       */

    }, {
      key: 'parse',
      value: function parse(expr) {
        if (!(expr && (expr = expr.trim()))) {
          return '';
        }
        // try cache
        var hit = this._cache.get(expr);
        if (hit) {
          return hit;
        }
        var res = isSimplePath(expr) && expr.indexOf('[') < 0 ? this._addScope(expr)
        // dynamic getter
        : this.compile(expr);
        this._cache.put(expr, res);
        return res;
      }
    }]);
    return Gep;
  }();

  return Gep;

}));
//# sourceMappingURL=gep.js.map