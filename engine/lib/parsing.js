var fs   = require('fs')
, path   = require('path')
, lib    = require('./lib.js')
, config = require('../../config.json')
, colors = require('colors')
, moment = require('moment')

var getMetadatas = function (file) {
    var data = fs.readFileSync(file, { encoding: 'utf-8' })
    var metaStr = data.match(/^```meta([\s\S]+?)```([\s\S]*)/)
    if (!metaStr) throw new Error('Could not find metadatas for file: '.white + file.red)
    else {
        var metadata      = JSON.parse(metaStr[1])
        metadata.content  = metaStr[2]
        metadata.filename = path.basename(file)
        metadata.dirpath  = path.dirname(file)
    }
    return metadata
}

var parseMetadatas = function (metadatas) {
    var parsedMetas        = {}
    parsedMetas.slug       = metadatas.slug
    parsedMetas.layoutPath = path.join(config.template, 'layouts', metadatas.layout) + '.jade'
    parsedMetas.toJade     = {
        title     : metadatas.title || lib.normalizeFilenameAsTitle(metadatas.filename),
        layoutCss : path.join('/assets/css', metadatas.layout + '.css'),
        content   : lib.cutHeadTailLinebreaks(metadatas.content)
    }

    if (!fs.existsSync(parsedMetas.layoutPath)) throw new Error('No jade file for layout: \''.white + metadatas.layout.red + '\' for file: ' + metadatas.filename.red)
    if (!fs.existsSync(path.join(config.template, 'styl', metadatas.layout) + '.styl')) throw new Error('No stylus file for layout: \''.white + metadatas.layout.red + '\' for file: ' + metadatas.filename.red)
    if (!/^[a-z0-9-]+$/.test(parsedMetas.slug)) throw new Error('Provided slug is not valid in: \''.white + metadatas.filename.red + '\''.white)

    if (metadatas.shouldFetchPosts) parsedMetas.toJade.posts = fetchBlogPosts(metadatas.dirpath)
    if (metadatas.isBlogPost) parsedMetas.toJade.post = parsePostMetadatas(metadatas)

    return parsedMetas
}

var fetchBlogPosts = function (filepath) {
    var dirContent = fs.readdirSync(filepath).reverse().filter(function (item){return /\.md$/.test(item)})
    , posts = []
    dirContent.forEach(function (item) {
        var metas = getMetadatas(path.join(filepath, item))
        if (metas.isBlogPost) posts.push(parsePostMetadatas(metas))
    })
    return posts
}

var parsePostMetadatas = function (metadatas) {
    if (metadatas.isBlogPost) {
        var postmetas = {}
        postmetas.isBlogPost = true
        postmetas.author     = metadatas.author || config.owner.name
        postmetas.date       = moment(metadatas.date).format(config.date_format)
        postmetas.title      = metadatas.title || lib.normalizeFilenameAsTitle(metadatas.filename)
        postmetas.content    = lib.cutHeadTailLinebreaks(metadatas.content)
        postmetas.link       = metadatas.slug + '.html'
    }
    return postmetas
}

module.exports.getMetadatas   = getMetadatas
module.exports.parseMetadatas = parseMetadatas
module.exports.fetchBlogPosts = fetchBlogPosts
module.exports.parsePostMetadatas = parsePostMetadatas