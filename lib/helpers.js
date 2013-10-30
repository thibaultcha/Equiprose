var fs = require('fs')

var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
exports.capitalize = capitalize

exports.slugify = function (str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

exports.trim = function (str) {
    return str.replace(/^[\n]+/, '').replace(/[\n]+$/, '')
}

exports.normalizeFilenameAsTitle = function (str) {
    var strArray = require('path').basename(str, '.md').replace(/[-_]/g, ' ').split(' ')
    , str = ''
    for (var i = 0; i < strArray.length; i++)
        str += capitalize(strArray[i]) + ' '
    return str.slice(0, -1)
}

exports.isValidDate = function (d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false
  return !isNaN(d.getTime())
}

var getFiles = function (dir, fileExt, done) {
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
exports.getFiles = getFiles

exports.walk = function (dir, fileExt, done) {
    var idx = -1
    ;(function fonc(dir) {
        fs.readdir(dir, function (err, list) {
            if (err) return done(err)
            var i = 0
            ;(function next () {
                var file = list[i++]
                if (!file) return;
                file = dir + '/' + file
                fs.stat(file, function (err, stat) {
                    if (err) return done(err)
                    if (stat && stat.isDirectory()) {
                        fonc(file)
                        next()
                    }
                    else {
                        if (fileExt.test(file)) {
                            idx++
                            done(null, file, idx)
                        }
                        next()
                    }
                })
            })()
        })
    })(dir)
}