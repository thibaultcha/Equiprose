var jade = require('jade') 
, stylus = require('stylus')
, nib    = require('nib')
, fs     = require('fs')
, fse    = require('fs-extra')
, path   = require('path')

exports.compileStylusFile = function (stylusfile, buildDir, callback) {
	buildDir    = path.join(buildDir, 'assets/css')
	cssFilePath = path.join(buildDir, path.basename(stylusfile).replace(/\.styl$/, '.css'))
	if (!callback || typeof(callback) !== 'function') callback = function () {}
	
	stylus(fs.readFileSync(stylusfile, { encoding: 'utf-8' }))
    .use(nib())
    .set('compress', true)
    .render(function (err, css) {
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