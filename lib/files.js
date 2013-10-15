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

fs.rmrf = function (dir, callback) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(function (file) {
            var curPath = dir + '/' + file
            if (fs.statSync(curPath).isDirectory())
                fs.rmrf(curPath)
            else
                fs.unlinkSync(curPath)
        })
        fs.rmdirSync(dir)
    }
    if (callback && typeof(callback) === 'function')
        callback()
}

fs.mkdirp = function(path, mode, callback, position) {
    var parts = require('path').normalize(path).split('/')
    mode      = mode || process.umask()
    position  = position || 0
 
    if (position >= parts.length) {
        if (callback) return callback()
        else return true
    }
 
    var directory = parts.slice(0, position + 1).join('/')
    fs.stat(directory, function (err) {
        if (err === null)
            fs.mkdirp(path, mode, callback, position + 1)
        else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) return callback(err)
                    else throw err
                } 
                else
                    fs.mkdirp(path, mode, callback, position + 1)
            })
        }
    })
}

module.exports = fs

/*module.exports.walk     = walk
module.exports.getFiles = getFiles
module.exports.rmdir    = rmdir
module.exports.mkdirp   = mkdirp*/