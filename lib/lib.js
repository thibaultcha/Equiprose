var fs = require('fs')

var parseConfig = function (sitePath) {
    if (!fs.existsSync(sitePath + '/config.yml')) throw new Error('No config.yml file at path: ' + sitePath)
    var configStr = fs.readFileSync(sitePath + '/config.yml', { encoding: 'utf-8' })
    , config      = require('yamljs').parse(configStr)
    config.sitePath = sitePath
    return config
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

module.exports.parseConfig              = parseConfig
module.exports.capitalize               = capitalize
module.exports.slugify                  = slugify
module.exports.cutHeadTailLinebreaks    = cutHeadTailLinebreaks
module.exports.normalizeFilenameAsTitle = normalizeFilenameAsTitle
module.exports.isValidDate              = isValidDate