var fs   = require('fs')
, path   = require('path')
, lib    = require('./lib.js')
, colors = require('colors')

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

var parseMetadatas = function (metadatas, config) {
    var parsedMetas        = {}
    parsedMetas.slug       = metadatas.slug
    parsedMetas.layoutPath = path.join(config.sitePath, 'template/layouts', metadatas.layout) + '.jade'
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

var fetchBlogPosts = function (config) {
    var dirContent = fs.readdirSync(path.join(config.sitePath, 'posts'))
    .reverse()
    .filter(function (item){return /\.md$/.test(item)})
    
    var posts = []
    dirContent.forEach(function (item) {
        var metas = getMetadatas(path.join(config.sitePath, 'posts', item))
        metas.isBlogPost = true
        posts.push(parsePostMetadatas(metas, config))
    })
    return posts
}

module.exports.getMetadatas       = getMetadatas
module.exports.parseMetadatas     = parseMetadatas
module.exports.fetchBlogPosts     = fetchBlogPosts
module.exports.parsePostMetadatas = parsePostMetadatas