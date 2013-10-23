var jade = require('jade') 
, stylus = require('stylus')
, fs     = require('fs')
, fse    = require('fs-extra')
, path   = require('path')

exports.compileStylus = function (str, callback) {
    
}

exports.compileStylusFile = function (stylusfile, buildDir, callback) {
	cssFilePath = path.join(buildDir, path.basename(stylusfile).replace(/\.styl$/, '.css'))
	if (!callback || typeof(callback) !== 'function') callback = function () {}
	
	stylus(fs.readFileSync(stylusfile, { encoding: 'utf-8' }))
    .set('compress', true)
    .set('paths', [path.dirname(stylusfile)])
    .render(function (err, css) {
        if (err) return callback(err)
        fs.exists(buildDir, function (exists) {
        	if (!exists) {
        		fse.mkdirs(buildDir, function (err) {
        			if (err) return callback(err)
        			fs.writeFileSync(cssFilePath, css)
        			return callback()
        		})
        	}
        	else {
        		fs.writeFileSync(cssFilePath, css)
        		return callback()
        	}
        }) 
    })
}