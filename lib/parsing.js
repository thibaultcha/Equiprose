var fs    = require('fs')
, path    = require('path')
, helpers = require('./helpers.js')
, colors  = require('colors')

exports.parseGlobalConfig = function () {
    var data = fs.readFileSync(path.join(__dirname, 'global_config.yml'), { encoding: 'utf-8'})
    , globalConfig = require('yamljs').parse(data)

    return globalConfig
}

var getMetadatas = function (file) {
    var data  = fs.readFileSync(file, { encoding: 'utf-8' })
    , metaStr = data.match(/^=([\s\S]+?)=([\s\S]*)/)

    if (!metaStr) throw new Error('Could not find metadatas for file: '.white + file.red)
    else {
        var metadatas      = require('yamljs').parse(metaStr[1])
        metadatas.content  = metaStr[2]
        metadatas.filename = path.basename(file)
        metadatas.dirpath  = path.dirname(file)
    }
    return metadatas
}
exports.getMetadatas = getMetadatas

var parseMetadatas = function (file) {
    var metadatas = getMetadatas(file)
    , parsedMetas = {
        plainmetas : metadatas,
        filename   : metadatas.filename,
        slug       : metadatas.slug,
        layout     : metadatas.layout,
        toJade     : {
            title   : metadatas.title || helpers.normalizeFilenameAsTitle(metadatas.filename),
            content : helpers.trim(metadatas.content)
        }
    }

    if (!/^[a-z0-9-]+$/.test(parsedMetas.slug)) throw new Error('Provided slug is not valid in: \''.white + metadatas.filename.red + '\''.white)

    return parsedMetas
}
exports.parseMetadatas = parseMetadatas

exports.parsePostMetadatas = function (file, owner, dateFormat) {
    var moment    = require('moment')
    , parsedMetas = parseMetadatas(file)
    , plainMetas  = parsedMetas.plainmetas

    if (!helpers.isValidDate(new Date(plainMetas.date))) throw new Error('Invalid or no date provided in metadatas for post: '.white + plainMetas.filename.red)
    if (!plainMetas.title) throw new Error('No title provided in metadatas for post: '.white + plainMetas.filename.red)
    if (!parsedMetas.toJade.content) throw new Error('No content for post in file: '.white + plainMetas.filename.red)

    parsedMetas.toJade.author = parsedMetas.author || owner
    parsedMetas.toJade.date   = moment(parsedMetas.date).format(dateFormat)
    parsedMetas.toJade.link   = parsedMetas.slug + '.html'
    
    return parsedMetas
}