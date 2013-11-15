var fs = require('fs')

/**
* Capitalize the first letter of a string
* @param {String} str The string to capitalize
* @return {String} The capitalized string
*/
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
exports.capitalize = capitalize

/**
* Output a given string as a valid URL slug
* 
* Example:
* '-Hello World-' -> 'hello-world'
* @param {String} The string to slugify
* @return {String} The slugified string
*/
exports.slugify = function (str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
* Remove line at the beginning and end of a given string
* @param {String} str The string to trim
* @return {String} The trimed string
*/
exports.trim = function (str) {
    return str.replace(/^[\n]+/, '').replace(/[\n]+$/, '')
}

/**
* Output a given filename as a title for a web page.
* Capitalize first letter and cut the extension name.
* @param {String} str The filename to normalize
* @return {String} The normalized filename
*/
exports.normalizeFilenameAsTitle = function (str) {
    var strArray = require('path').basename(str, '.md').replace(/[-_]/g, ' ').split(' ')
    , str = ''
    for (var i = 0; i < strArray.length; i++)
        str += capitalize(strArray[i]) + ' '
    return str.slice(0, -1)
}

/**
* Check if a given object is a valid Date
* @param {Object} d The object to test
* @return {bool} true|false
*/
exports.isValidDate = function (d) {
    if (Object.prototype.toString.call(d) !== "[object Date]")
      return false
    return !isNaN(d.getTime())
}

/**
* Recursively enumerates a directory and callback 
* an array containing all files
* @param {String} dir The path to the root directory to traverse
* @param {Regex} regex A regex to test on each file.
* @param {Function} done The callback function
*/
var getFiles = function (dir, regex, done) {
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
                    getFiles(file, regex, function (err, res) {
                        results = results.concat(res)
                        next()
                    })
                }
                else {
                    if (regex.test(file)) results.push(file)
                    next()
                }
            })
        })()
    })
}
exports.getFiles = getFiles

/**
* Recursively enumerates a directory and callback 
* one by one each file
* @param {String} dir The path to the root directory to traverse
* @param {Regex} regex A regex to test on each file.
* @param {Function} done The callback function
*/
exports.walk = function (dir, regex, done) {
    var idx = -1
    ;(function fonc (dir) {
        fs.readdir(dir, function (err, list) {
            if (err) return done(err)
            var i = 0
            ;(function next () {
                var file = list[i++]
                if (!file) return
                file = dir + '/' + file
                fs.stat(file, function (err, stat) {
                    if (err) return done(err)
                    if (stat && stat.isDirectory()) {
                        fonc(file)
                        next()
                    }
                    else {
                        if (regex.test(file)) {
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

exports.recursiveExists = function (filename, dir, callback) {
    var path = require('path')
    var matches = []

    ;(function fonc (dir) {
        var list = fs.readdirSync(dir)
        var i = 0
        ;(function next () {
            var file = list[i++]
            if (!file) return
            file = path.join(dir, file)
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) {
                fonc(file)
                next()
            }
            else {
                if (path.basename(file) == filename) {
                    matches.push(file)
                }
                next()
            }
        })()
    })(dir)

    callback(null, matches)
}

/**
* Enumerates over a JSON object and callaback
* the dot notation of each property
* @param {Object} object The object on which to enumerate
* @param {Function} callback The callback function
*/
exports.enumerateProperties = function (object, callback) {
    ;(function walk (obj, stack) {
        stack = stack || ''
        if (typeof(obj) !== 'object')
            return true
        for (var prop in obj) {
            // if not object, do callback
            if (walk(obj[prop], stack + '.' + prop)) {
                var str = ''
                if (stack)
                    str = stack.substring(1) + '.'
                str += prop 
                callback(str)
            }
        }
        return false
    })(object)
}

/**
 * Retrieve nested item from object/array
 * @param {Object|Array} obj
 * @param {String} path dot separated
 * @returns {*}
 */
exports.pathToProperty = function (obj, path) {
    for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
        if (!obj || typeof obj !== 'object') return
        obj = obj[path[i]]
    }

    if (obj === undefined) return
    return obj
}

/**
 * Set nested item from path
 * @param {Object|Array} obj
 * @param {String} path dot separated
 * @param {value} value to set
 * @returns {*}
 */
exports.setAtPath = function (obj, path, value) {
    var parts = path.split('.')
    var len   = parts.length - 1
    for (var i = 0; i < len; i++) {
        if (!obj[parts[i]])
            obj[parts[i]] = {}
        obj = obj[parts[i]]
    }
    obj[parts[len]] = value
}