var path = require('path')

var parser = require('./parsing')

module.exports = {

  pathFromArgument: function (arg) {
    return path.resolve(arg ? arg : '.')
  },

  configFromArgument: function (arg, callback) {
    var path   = this.pathFromArgument(arg)
    var config = parser.parseConfig(path)

    callback(config)
  }

}
