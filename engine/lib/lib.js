var walk = function (dir, fileExt, done) {
    var fs    = require('fs')
    , results = []
    fs.readdir(dir, function (err, list) {
        if (err) return done(err)
        var i = 0
        ;(function next () {
            var file = list[i++]
            if (!file) return done(null, results)
            file = dir + '/' + file
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, fileExt, function (err, res) {
                        results = results.concat(res)
                        next()
                    })
                } else { 
                    if (fileExt.test(file)) results.push(file)
                    next()
                }
            })
        })()
    })
} 

var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports.walk       = walk
module.exports.capitalize = capitalize