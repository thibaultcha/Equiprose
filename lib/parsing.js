var fs    = require('fs')
, path    = require('path')
, helpers = require('./helpers.js')
, colors  = require('colors')

var getMetadatas = function (file) {
    var data  = fs.readFileSync(file, { encoding: 'utf-8' })
    , metaStr = data.match(/^=([\s\S]+?)=([\s\S]*)/)

    if (!metaStr) throw new Error('Could not find metadatas for file: '.white + file.red)
    else {
        var metadata      = require('yamljs').parse(metaStr[1])
        metadata.content  = metaStr[2]
        metadata.filename = path.basename(file)
        metadata.dirpath  = path.dirname(file)
    }
    return metadata
}
exports.getMetadatas = getMetadatas

var parseMetadatas = function (file) {
    var metadatas   = getMetadatas(file)
    var parsedMetas = {
        plainmetas : metadatas,
        slug       : metadatas.slug,
        layout     : metadatas.layout,
        toJade     : {
            title   : metadatas.title || helpers.normalizeFilenameAsTitle(metadatas.filename),
            content : helpers.cutHeadTailLinebreaks(metadatas.content)
        }
    }

    //if (!fs.existsSync(parsedMetas.layoutPath)) throw new Error('No jade file for layout: \''.white + metadatas.layout.red + '\' for file: ' + metadatas.filename.red)
    if (!/^[a-z0-9-]+$/.test(parsedMetas.slug)) throw new Error('Provided slug is not valid in: \''.white + metadatas.filename.red + '\''.white)

    return parsedMetas
}
exports.parseMetadatas = parseMetadatas

exports.parsePostMetadatas = function (file, owner, dateFormat) {
    var moment = require('moment')
    var parsedMetas = parseMetadatas(file)
    , plainMetas    = parsedMetas.plainmetas

    if (!helpers.isValidDate(new Date(plainMetas.date))) throw new Error('Invalid or no date provided in metadatas for post: '.white + plainMetas.filename.red)
    if (!plainMetas.title) throw new Error('No title provided in metadatas for post: '.white + plainMetas.filename.red)
    if (!parsedMetas.toJade.content) throw new Error('No content for post in file: '.white + plainMetas.filename.red)

    parsedMetas.toJade.author = parsedMetas.author || owner
    parsedMetas.toJade.date   = moment(parsedMetas.date).format(dateFormat)
    parsedMetas.toJade.link   = parsedMetas.slug + '.html'
    
    return parsedMetas
}