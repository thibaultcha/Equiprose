var jade = require('jade') 
, stylus = require('stylus')
, nib    = require('nib')
, fs     = require('fs')
, path   = require('path')
, lib    = require('./lib.js')

exports.prepareOutputDir = function (outputDir, callback) {
	if (!callback || typeof(callback) !== 'function') callback = function () {}
	
	fs.exists(outputDir, function (exists) {
		if (exists) {
			lib.rmdir(outputDir, function () {
				lib.mkdirp(outputDir, 0777, function (err) {
					callback(err)
				})
			})
		}
		else {
			lib.mkdirp(outputDir, 0777, function (err) {
				callback(err)
			})
		}
	})
}

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
        		lib.mkdirp(buildDir, 0777, function (err) {
        			fs.writeFileSync(cssFilePath, css)
        			callback(err)
        		})
        	}
        	else {
        		fs.writeFileSync(cssFilePath, css)
        		callback()
        	}
        }) 
    })
}