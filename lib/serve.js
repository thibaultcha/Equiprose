module.exports = {
    startServer: function (siteConfig, port, callback) {
        var http    = require('http')
        var express = require('express')
        var path    = require('path')
        var app     = express()
        var parser  = require('./parsing')

        app.configure(function () {
            app.use(express.compress())
            app.set('port', port)
            app.use(express.bodyParser())
            app.use(express.logger('dev'))
            app.use(express.static(siteConfig.paths.buildDir))
        })

        http.createServer(app).listen(app.get('port'), function () {
            callback('http://localhost:' + app.get('port'))
        })
    }
}