var fs = require('fs')
, fse  = require('fs-extra')
, path = require('path')

var jade = require('jade') 
, stylus = require('stylus')
, marked = require('marked')

var parse = require('./parsing.js')

/*exports.compileStylus = function (str, callback) {
    
}*/

exports.compileStylusFile = function (stylusfile, buildDir, callback) {
	if (!callback || typeof(callback) !== 'function') callback = function () {}
 
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

exports.compileMarkdownToFile = function (mdfile, layoutsDir, buildDir, toJadeConfig, posts, postMetas, callback) {
    if (arguments.length === 6) {
        callback = postMetas
    }
    else {
        //console.log(postMetas)
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
        fs.exists(buildDir, function (exists) {
            if (!exists) {
                fse.mkdirsSync(buildDir)
            }

            var htmlFilePath = path.join(buildDir, filemetas.slug + '.html')
            
            fs.writeFile(htmlFilePath, html, { encoding: 'utf-8' }, function (err) {
                if (err) return callback(err)
                return callback(null, htmlFilePath, html, options)
            })
        })
    })
}