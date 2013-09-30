var jade = require('jade') 
, stylus = require('stylus')
, nib    = require('nib')
, fs     = require('fs')
, path   = require('path')
, uslug  = require('uslug')
, marked = require('marked')
, moment = require('moment')
, emoji  = require('emoji-images')
, exec   = require('child_process').exec
, config = require('../config.json')
, log    = require('custom-logger').config({ level: config.log_level })
, utf8   = { encoding:'utf-8' }

log.new({
    info     : { color: 'blue', level: 0, event: 'info' },
    notice   : { color: 'yellow', level: 0, event: 'notice' },
    progress : { color: 'green', level: 1, event: 'build' }
})

marked.setOptions({
    gfm: true,
    highlight: function (code, lang, callback) {
    
    },
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
})

var walk = function (dir, fileExt, done) {
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
                walk(file, fileExt, function (err, res) {
                    results = results.concat(res)
                    next()
                })
            } else { 
                if (fileExt.test(file)) results.push(file)
                next()
            }
            })
        })()
    })
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function parsePostFile (postFile) {
    return postFile.match(/^([0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))_([\s\S]*)/)
}

function parseMeta (contentStr) {
    var metaStr = contentStr.match(/^```json([\s\S]+?)```([\s\S]*)/)
    if (!metaStr || !metaStr[1] || !metaStr[2]) throw new Error('No metadata or content for file ' + mdFile)

    return [JSON.parse(metaStr[1]), metaStr[2]] 
}

function parseMetadata (mdFile) {
    var contentStr    = fs.readFileSync(mdFile, utf8)
    , contentFileName = path.basename(mdFile, '.md')
    , assetsPath, pageTitle, pageSlug
    , parsedContent = parseMeta(contentStr)
    , parsedMeta    = parsedContent[0]
    parsedContent   = parsedContent[1]

    // get jade layout
    if (!parsedMeta.hasOwnProperty('layout') || parsedMeta.layout == '') throw new Error('No layout specified for ' + mdFile)
    var layoutPath = path.join(config.template, 'layouts', parsedMeta.layout) + '.jade'
    if (!fs.existsSync(layoutPath)) throw new Error('No layout at path ' + layoutPath)

    // get assets path
    var buildDir = path.dirname(mdFile.replace(config.content_dir, config.build_dir))
    assetsPath = path.relative(buildDir, 'assets/')

    // get layout css file
    var layoutStylusFile = path.join(config.template, 'styl', parsedMeta.layout + '.styl')
    if (!fs.existsSync(layoutStylusFile)) throw new Error('No stylus layout file for layout ' + parsedMeta.layout)

    // get custom css file
    if (parsedMeta.hasOwnProperty('customCss')) {
        var customStylusFile = path.join(config.template, 'styl/custom', parsedMeta.customCss + '.styl')
        if (!fs.existsSync(customStylusFile)) throw new Error('No stylus custom file at path ' + customStylusFile + ' for ' + mdFile)
        var customCssFile = path.join(assetsPath, 'css', 'custom', parsedMeta.customCss + '.css')
    }

    pageTitle = parsedMeta.title || contentFileName.capitalize()
    pageSlug  = uslug(contentFileName, { lower: true })

    if (parsedMeta.layout == 'post') {
        var parsedPostMeta = parsePostFile(contentFileName)
        pageSlug  = uslug(parsedPostMeta[4], { lower: true })
        pageTitle = parsedMeta.title || contentFileName.capitalize()
        
        var postMetadata = {
            date   : moment(parsedPostMeta[1], "YYYY-MM-DD").format(config.date_format),
            author : parsedMeta.author || config.owner.name 
        }
    }
    else if (parsedMeta.layout == 'blog') {
        var blogMetadata = { posts: [] }
        fs.readdirSync(path.dirname(mdFile)).reverse().filter(function (item) {
            var match = parsePostFile(item)
            if (match) {
                // the ugly thing to get the post title
                var postContentStr = fs.readFileSync(path.join(path.dirname(mdFile), item), utf8)
                var postParsedContent = parseMeta(postContentStr)
                // the end of the ugly thing
                blogMetadata.posts.push({
                    link  : match[4].replace('.md', '.html'),
                    title : postParsedContent[0].title || match[4].replace('.md', ''),
                    date  : moment(match[1], "YYYY-MM-DD").format(config.date_format)
                })
            }
        })
    }

    return {
        layout : parsedMeta.layout,
        slug   : pageSlug + '.html',
        toJade : {
            assetsPath : assetsPath,
            layoutCss  : path.join(assetsPath, 'css', parsedMeta.layout + '.css'),
            customCss  : customCssFile || null,
            title      : pageTitle,
            owner      : config.owner,
            content    : emoji(marked(parsedContent), path.join(assetsPath, 'img/emojis'), 20),
            post       : postMetadata || null,
            blog       : blogMetadata || null
        }
    }
}

;(function () {
    exec('rm -rf ' + path.join(config.build_dir, '*'))
    exec('rm -rf ' + path.join('css', '*'))

    walk(path.join(config.template, 'styl'), new RegExp(/\.styl$/), function (err, stylusFiles) {
        if (err) throw err
        stylusFiles.forEach(function (stylFile) {
            stylus(fs.readFileSync(stylFile, utf8))
            .use(nib())
            .set('compress', true)
            .render(function (err, css) {
                if (err) throw err
                // Write CSS
                var buildFilePath = stylFile.replace(config.template, 'assets').replace(/styl/, 'css').replace(/\.styl/, '.css')
                if (!fs.existsSync(path.dirname(buildFilePath))) fs.mkdirSync(path.dirname(buildFilePath)) 
                fs.writeFileSync(buildFilePath, css)
            })
        })
    })

    walk(config.content_dir, new RegExp(/\.md$/), function (err, results) {
        if (err) throw err
        results.forEach(function (mdFile) {
            var metadata = parseMetadata(mdFile)
            , layout     = path.join(config.template, 'layouts', metadata.layout)
            , fn         = jade.compile(fs.readFileSync(layout + '.jade'), { filename: layout })
            , html       = fn(metadata.toJade)
            // Write HTML
            var buildFilePath = mdFile.replace(config.content_dir, config.build_dir).replace(path.basename(mdFile), metadata.slug)
            if (!fs.existsSync(path.dirname(buildFilePath))) fs.mkdirSync(path.dirname(buildFilePath))
            fs.writeFile(buildFilePath, html)
        })
    })
})()