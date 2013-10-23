var jade = require('jade') 
, stylus = require('stylus')
, fs     = require('fs')
, fse    = require('fs-extra')
, path   = require('path')

exports.compileStylus = function (str, callback) {
    
}

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