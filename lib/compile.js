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
	var cssFilePath = path.join(buildDir, path.basename(stylusfile).replace(/\.styl$/, '.css'))
	if (!callback || typeof(callback) !== 'function') callback = function () {}
 
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

var compileMarkdown = function (mdfile, layoutsDir, callback) {
    if (!callback || typeof(callback) !== 'function') callback = function () {}

    var filemetas = parse.parseMetadatas(mdfile)
    , layoutPath  = path.join(layoutsDir, filemetas.layout + '.jade')

    if (!fs.existsSync(layoutPath)) {
        return callback(new Error('No jade file for layout: \'' + layoutPath + '\' for file: ' + filemetas.filename))
    }

    jade.renderFile(layoutPath, filemetas.toJade, function (err, html) {
        if (err) return callback(err)
        return callback(null, html, filemetas)
    })
}
exports.compileMarkdown = compileMarkdown

exports.compileMarkdownToFile = function (mdfile, layoutsDir, buildDir, callback) {
    if (!callback || typeof(callback) !== 'function') callback = function () {}

    compileMarkdown(mdfile, layoutsDir, function (err, html, filemetas) {
        if (err) return callback(err)
        fs.exists(buildDir, function (exists) {
            if (!exists) {
                fse.mkdirsSync(buildDir)
            }

            var htmlFilePath = path.join(buildDir, filemetas.slug + '.html')
            
            fs.writeFile(htmlFilePath, html, { encoding: 'utf-8' }, function (err) {
                if (err) return callback(err)
                return callback(null, htmlFilePath)
            })
        })
    })
}