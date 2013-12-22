var fs = require('fs')

module.exports = {
    /**
    * Capitalize the first letter of a string
    * @param {String} str The string to capitalize
    * @return {String} The capitalized string
    */
    capitalize: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    },

    /**
    * Output a given string as a valid URL slug
    * 
    * Example:
    * '-Hello World-' -> 'hello-world'
    * @param {String} The string to slugify
    * @return {String} The slugified string
    */
    slugify: function (str) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    },

    /**
    * Remove line at the beginning and end of a given string
    * @param {String} str The string to trim
    * @return {String} The trimed string
    */
    trim: function (str) {
        return str.replace(/^[\n]+/, '').replace(/[\n]+$/, '')
    },

    /**
    * Output a given filename as a title for a web page.
    * Capitalize first letter and cut the extension name.
    * @param {String} str The filename to normalize
    * @return {String} The normalized filename
    */
    normalizeFilenameAsTitle: function (str) {
        var strArray = require('path').basename(str, '.md').replace(/[-_]/g, ' ').split(' ')
        var str = ''
        for (var i = 0; i < strArray.length; i++) {
            str += this.capitalize(strArray[i]) + ' '
        }
        return str.slice(0, -1)
    },

    /**
    * Check if a given object is a valid Date
    * @param {Object} d The object to test
    * @return {bool} true|false
    */
    isValidDate: function (d) {
        if (Object.prototype.toString.call(d) !== "[object Date]") {
          return false
        }
        return !isNaN(d.getTime())
    },
    
    /**
    * Enumerates over a JSON object and callaback
    * the dot notation of each property
    * @param {Object} object The object on which to enumerate
    * @param {Function} callback The callback function
    */
    enumerateProperties: function (object, callback) {
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
    },

    /**
     * Retrieve nested item from object/array
     * @param {Object|Array} obj
     * @param {String} path dot separated
     * @returns {*}
     */
    pathToProperty: function (obj, path) {
        for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
            if (!obj || typeof obj !== 'object') return
            obj = obj[path[i]]
        }

        if (obj === undefined) return
        return obj
    },

    /**
     * Set nested item from path
     * @param {Object|Array} obj
     * @param {String} path dot separated
     * @param {value} value to set
     * @returns {*}
     */
    setAtPath: function (obj, path, value) {
        var parts = path.split('.')
        var len   = parts.length - 1
        for (var i = 0; i < len; i++) {
            if (!obj[parts[i]])
                obj[parts[i]] = {}
            obj = obj[parts[i]]
        }
        obj[parts[len]] = value
    }
}
