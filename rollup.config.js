import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const name = 'gep'
const needMin = !!process.env.MIN

var dest = 'dist/' + name + '.js'
var plugins = [
  babel({
    presets: [ 'es2015-rollup' ],
  }),
]
if (needMin) {
  dest = 'dist/' + name + '.min.js'
  plugins.push(uglify({
    output: {
      comments: function (node, comment) {
        var text = comment.value
        var type = comment.type
        if (type === 'comment2') { // multiline comment
          return /MIT Licensed/.test(text)
        }
      },
    },
  }))
}

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleId: name,
  moduleName: name,
  dest,
  plugins,
  banner:
`/**
 * ${name} --- By lon
 * Github: https://github.com/cnlon/${name}
 * MIT Licensed.
 */`,
}
