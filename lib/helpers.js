var fs = require('fs')

module.exports = {
  /**
   * Capitalize the first letter of a string
   *
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
   *
   * @param {String} The string to slugify
   * @return {String} The slugified string
   */
  slugify: function (str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  },

  /**
   * Remove line at the beginning and end of a given string
   *
   * @param {String} str The string to trim
   * @return {String} The trimed string
   */
  trim: function (str) {
    return str.replace(/^[\n]+/, '').replace(/[\n]+$/, '')
  },

  /**
   * Output a given filename as a title for a web page.
   * Capitalize first letter and cut the extension name.
   *
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
   *
   * @param {Object} d The object to test
   * @return {bool} true|false
   */
  isValidDate: function (d) {
    if (Object.prototype.toString.call(d) !== "[object Date]") {
      return false
    }
    return !isNaN(d.getTime())
  }
}
