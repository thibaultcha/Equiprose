var path = require('path')
var colors = require('colors')

var parser = require('./parsing')
var builder = require('../lib/building')

module.exports = {

 logger: {
    log: function log (msg) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(msg)
      }
      else {
        return msg
      }
    },

    success: function log_success (msg) {
      this.log('✔ '.green + msg)
    },

    error: function log_error (msg) {
      this.log('✘ '.red + msg)
    }
  },

  pathFromArgument: function path_from_arg (arg) {
    return path.resolve(arg ? arg : '.')
  },

  configFromArgument: function config_from_arg (arg) {
    var path = this.pathFromArgument(arg)
    return parser.parseConfig(path)
  },

  buildFromArgument: function build_from_arg (arg, callback) {
    if (typeof callback !== 'function') callback = function(){}
    var siteConfig = this.configFromArgument(arg)
    var self = this;

    self.logger.log('Compiling website using config: ' + siteConfig.sitePath +'/config.yml')
    self.logger.log('    pages: ' + siteConfig.paths.pages.input)
    self.logger.log('    posts: ' + siteConfig.paths.posts.input)
    self.logger.log('   assets: ' + siteConfig.paths.assets.input)
    self.logger.log(' template: ' + siteConfig.paths.templateDir)

    builder.buildSite(siteConfig, function (err, websitePath) {
      if (err) return callback(err)
      self.logger.success('Compiled website at path: ' + websitePath.underline)
      callback(null, siteConfig)
    })
  }

}
