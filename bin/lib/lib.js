var fs = require('fs')

var parseConfig = function (sitePath) {
    var configStr = fs.readFileSync(sitePath + '/config.yml', { encoding: 'utf-8' })
    , config      = require('yamljs').parse(configStr)
    config.sitePath = sitePath
    return config
}

var walk = function (dir, fileExt, done) {
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

var rmdir = function (dir, callback) {
    var files = []
    if (fs.existsSync(dir)) {
        files = fs.readdirSync(dir)
        
        files.forEach(function (file) {
            var curPath = dir + '/' + file
            if (fs.statSync(curPath).isDirectory())
                rmdir(curPath)
            else
                fs.unlinkSync(curPath)
        })
        
        fs.rmdirSync(dir)
    }

    if (callback && typeof(callback) === 'function')
        callback()
}

var mkdirp = function(path, mode, callback, position) {
    var parts = require('path').normalize(path).split('/')
    mode      = mode || 0777
    position  = position || 0
 
    if (position >= parts.length) {
        if (callback) return callback()
        else return true
    }
 
    var directory = parts.slice(0, position + 1).join('/')
    fs.stat(directory, function (err) {
        if (err === null)
            mkdirp(path, mode, callback, position + 1)
        else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) return callback(err)
                    else throw err
                } 
                else
                    mkdirp(path, mode, callback, position + 1)
            })
        }
    })
}

module.exports.parseConfig              = parseConfig
module.exports.walk                     = walk
module.exports.capitalize               = capitalize
module.exports.slugify                  = slugify
module.exports.cutHeadTailLinebreaks    = cutHeadTailLinebreaks
module.exports.normalizeFilenameAsTitle = normalizeFilenameAsTitle
module.exports.isValidDate              = isValidDate
module.exports.rmdir                    = rmdir
module.exports.mkdirp                   = mkdirp