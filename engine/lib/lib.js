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

var slugify = function (str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

var cutHeadTailLinebreaks = function (str) {
    return str.replace(/^[\n]+/, '').replace(/[\n]+$/, '')
}

var normalizeFilenameAsTitle = function (str) {
    var strArray = require('path').basename(str, '.md').replace(/[-_]/g, ' ').split(' ')
    , str = ''
    for (var i = 0; i < strArray.length; i++)
        str += capitalize(strArray[i]) + ' '
    return str.slice(0, -1)
}

var isValidDate = function (d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false
  return !isNaN(d.getTime())
}

module.exports.walk                     = walk
module.exports.capitalize               = capitalize
module.exports.slugify                  = slugify
module.exports.cutHeadTailLinebreaks    = cutHeadTailLinebreaks
module.exports.normalizeFilenameAsTitle = normalizeFilenameAsTitle
module.exports.isValidDate              = isValidDate