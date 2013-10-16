var fs = require('fs')

fs.getFiles = function (dir, fileExt, done) {
    var results = []
    fs.readdir(dir, function (err, list) {
        if (err) return done(err)
        var i = 0
        ;(function next () {
            var file = list[i++]
            if (!file) return done(null, results)
            file = dir + '/' + file
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    getFiles(file, fileExt, function (err, res) {
                        results = results.concat(res)
                        next()
                    })
                }
                else {
                    if (fileExt.test(file)) results.push(file)
                    next()
                }
            })
        })()
    })
}

fs.walk = function (dir, fileExt, callback, idx) {
    idx = idx || -1
    fs.readdir(dir, function (err, list) {
        if (err) throw err 
        var i = 0
        ;(function next () {
            var file = list[i++]
            file = dir + '/' + file
            fs.stat(file, function (err, stat) {
                if (err) throw err
                if (stat && stat.isDirectory()) {
                    walk(file, fileExt, function (err, res) {
                        next()
                    }, idx)
                }
                else {
                    if (fileExt.test(file)) {
                        idx++
                        callback(file, idx)
                    }
                    next()
                }
            })
        })()
    })
}

module.exports = fs