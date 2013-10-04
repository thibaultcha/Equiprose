var fs    = require('fs')

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

var parsePostFilename = function (filename) {
    var matches = filename.match(/^([0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1]))_([\s\S]*)/)
    if (matches) {
        matches[1] = new Date(matches[1])
        matches.shift()
    }
    return matches
}

var parseFile = function (file) {
    var metaStr      = fs.readFileSync(file, { encoding: 'utf-8' }).match(/^```meta([\s\S]+?)```([\s\S]*)/)
    , metadata       = JSON.parse(metaStr[1])
    metadata.content = metaStr[2]

    return metadata
}

var parseMetadatas = function (metadatas) {

}

module.exports.walk              = walk
module.exports.capitalize        = capitalize
module.exports.parsePostFilename = parsePostFilename
module.exports.parseFile         = parseFile
module.exports.parseMetadatas    = parseMetadatas