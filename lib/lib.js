var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
exports.capitalize = capitalize

exports.slugify = function (str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

exports.cutHeadTailLinebreaks = function (str) {
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