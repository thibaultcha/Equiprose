var fs   = require('fs')
, path   = require('path')
, lib    = require('./lib.js')
, colors = require('colors')

exports.parseConfig = function (sitePath) {
    if (!fs.existsSync(sitePath + '/config.yml')) throw new Error('No config.yml file at path: ' + sitePath)
    var configStr = fs.readFileSync(sitePath + '/config.yml', { encoding: 'utf-8' })
    , config      = require('yamljs').parse(configStr)
    config.sitePath = sitePath
    return config
}

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

exports.parseMetadatas = function (metadatas, config) {
    var parsedMetas        = {}
    parsedMetas.slug       = metadatas.slug
    parsedMetas.layoutPath = path.join(config.sitePath, '_template/layouts', metadatas.layout) + '.jade'
    parsedMetas.toJade     = {
        title   : metadatas.title || lib.normalizeFilenameAsTitle(metadatas.filename),
        content : lib.cutHeadTailLinebreaks(metadatas.content)
    }

    if (!fs.existsSync(parsedMetas.layoutPath)) throw new Error('No jade file for layout: \''.white + metadatas.layout.red + '\' for file: ' + metadatas.filename.red)
    if (!/^[a-z0-9-]+$/.test(parsedMetas.slug)) throw new Error('Provided slug is not valid in: \''.white + metadatas.filename.red + '\''.white)

    if (metadatas.isBlogPost) {
        var postmetas = parsePostMetadatas(metadatas, config)
        parsedMetas.toJade.author = postmetas.author
        parsedMetas.toJade.date   = postmetas.date
        parsedMetas.toJade.link   = postmetas.link
    }
    return parsedMetas
}

var parsePostMetadatas = function (metadatas, config) {
    var moment = require('moment')

    if (!lib.isValidDate(new Date(metadatas.date))) throw new Error('Invalid or no date provided in metadatas for post: '.white + metadatas.filename.red)
    if (!metadatas.title) throw new Error('No title provided in metadatas for post: '.white + metadatas.filename.red)
    if (!metadatas.content) throw new Error('No content for post in file: '.white + metadatas.filename.red)

    return {
        author : metadatas.author || config.owner.name,
        date   : moment(metadatas.date).format(config.date_format),
        link   : metadatas.slug + '.html'
    }
}
exports.parsePostMetadatas = parsePostMetadatas

exports.fetchBlogPosts = function (config) {
    var dirContent = fs.readdirSync(path.join(config.sitePath, '_posts'))
    .reverse()
    .filter(function (item){return /\.md$/.test(item)})
    
    var posts = []
    dirContent.forEach(function (item) {
        var metas = getMetadatas(path.join(config.sitePath, '_posts', item))
        metas.isBlogPost = true
        posts.push(parsePostMetadatas(metas, config))
    })
    return posts
}