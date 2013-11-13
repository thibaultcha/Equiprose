var fs   = require('fs')
var fse  = require('fs-extra')
var path = require('path')

var jade   = require('jade') 
var stylus = require('stylus')
var marked = require('marked')

var parse = require('./parsing.js')

/*exports.compileStylus = function (str, callback) {
    
}*/

exports.compileStylusFile = function (stylusfile, buildDir, callback) {
	if (!callback || typeof(callback) !== 'function') {
        callback = function () {}
    }

    var cssFilePath = path.join(buildDir, path.basename(stylusfile).replace(/\.styl$/, '.css'))

    fs.readFile(stylusfile, { encoding: 'utf-8' }, function (err, data) {
        if (err) return callback(err)
        stylus(data)
        .set('compress', true)
        .set('paths', [path.dirname(stylusfile)])
        .render(function (err, css) {
            if (err) return callback(err)
            fs.exists(buildDir, function (exists) {
                if (!exists) {
                    fse.mkdirsSync(buildDir)
                }
                fs.writeFile(cssFilePath, css, function (err) {
                    if (err) return callback(err)
                    return callback()
                })
            })
        })
    });
}

/**
* Compile a given markdown file into an HTML file, assuming the `layout`
* property from its metadatas leads to an existing Jade file
* 
* @param {String} mdFile The path to the markdown file
* @param {String} layoutsDir The path to the directory containing the Jade files
* @param {Object} toJadeConfig The `toJade` object from the website config, to include in the Jade template
* @param {Array} posts The blog posts array to include in the Jade template
* @param {Function} callback The function callback
* @return {Function} callback(err, html, options)
*/
var renderJade = function (layoutsDir, options, callback) {
    if (!callback || typeof(callback) !== 'function') {
        callback = function () {}
    }

    var layoutPath = path.join(layoutsDir, options.layout + '.jade')

    if (!fs.existsSync(layoutPath)) {
        return callback(new Error('No jade file for layout: \'' + layoutPath + '\''))
    }

    jade.renderFile(layoutPath, options, function (err, html) {
        if (err) return callback(err)
        return callback(null, html, options)
    })
}
exports.renderJade = renderJade

/**
* Write an HTML file from a markdown file with metadatas in the given buildDir
* This function uses renderJade() to fetch the jade templating file from 
* the layoutsDir joined with the layout property in the markdown metadatas.
*
* ## Example ##
* A markdown file _pages/index.md with those metadatas: 
* =
* layout: page
* title: Home
* slug: index
* =
* Will be rendered in buildDir/index.html using the jade template layoutsDir/page.jade
*
* @param {String} mdfile The path to the markdown file to render
* @param {String} layoutsDir The path to the directory containing the jade templates
* @param {String} buildDir The root path where the site will be built
* @param {Object} toJadeConfig The `toJade` object from the website config file to be passed as a variable to Jade
* @param {Array} posts An array containing the blog blog post to be passed as a variable to Jade
* @param {Function} callback The callback function
*
* ## Optional ##
* @param {Object} postMetas Metadatas from a postfile. If set, the method will know it is called to compile a post file
*
* @return {Function} callback(err, htmlFilePath, html, options)
*/
exports.compileMarkdownToFile = function (mdfile, layoutsDir, buildDir, toJadeConfig, posts, postMetas, callback) {
    if (arguments.length === 6) {
        callback = postMetas
    }
    if (!callback || typeof(callback) !== 'function') {
        callback = function () {}
    }

    var filemetas = arguments.length === 7 ? postMetas : parse.parseMetadatas(mdfile)
    var options = {
        layout  : filemetas.layout,
        content : filemetas.toJade.content,
        config  : toJadeConfig,
        metas   : filemetas.toJade,
        posts   : posts
    }

    renderJade(layoutsDir, options, function (err, html) {
        if (err) return callback(err)
            
        var regex = new RegExp("^([\\s\\S]*)\/" + "_pages" + "\/([\\s\\S]*)")
        var pathFromPagesInput = mdfile.match(regex)
        var htmlFilePath = path.join(buildDir, path.dirname(pathFromPagesInput ? pathFromPagesInput[2] : ''), filemetas.slug + '.html')
        
        fse.mkdirp(path.dirname(htmlFilePath), function (err) {
            if (err) return callback(err)
            fs.writeFile(htmlFilePath, html, { encoding: 'utf-8' }, function (err) {
                if (err) return callback(err)
                return callback(null, htmlFilePath, html, options)
            })
        })
    })
}