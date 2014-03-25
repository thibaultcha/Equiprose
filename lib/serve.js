/**
 * This basically start an express server and serve
 * static files to test the compiled website.
 *
 * @param {Object} siteConfig  The website's config
 * @param {Number} port        The port on which to run the server
 * @param {Function} callback  A callback function
 */
module.exports = function (siteConfig, port, callback) {
  var http    = require('http')
  var express = require('express')
  var path    = require('path')
  var app     = express()
  var parser  = require('./parsing')

  app.configure(function () {
    app.use(express.compress())
    app.set('port', port)
    //app.use(express.bodyParser())
    app.use(express.logger('dev'))
    app.use(express.static(siteConfig.paths.buildDir))
  })

  http.createServer(app).listen(app.get('port'), function () {
    typeof callback === 'function' && callback('http://localhost:' + app.get('port'))
  })
}
