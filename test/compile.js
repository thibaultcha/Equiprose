var assert = require('assert')
, fs       = require('fs')
, fse      = require('fs-extra')
, path     = require('path')
, parse    = require('../lib/parsing.js')
, compile  = require('../lib/compile.js')

describe('compile.js', function () {
	var sitePath = 'test/test-sites/valid-site'
	, outputDir  = path.join(sitePath, 'www')
	, stylDir    = '_template/styl'

	describe.skip('#compileStylusFile()', function () {
		var stylusfile = path.join(sitePath, stylDir, 'page.styl')

		before(function (done) { 
			compile.prepareOutputDir(outputDir, function (err) {
				assert.ifError(err)
				done()
			})
		})

		it('using fse#mkdirs() should create buildDir/assets/css/ if not existing', function (done) {
			before(function (done) {
				if (fs.existsSync(path.join(outputDir, 'assets/css'))) {
					fse.remove(path.join(outputDir, 'assets/css'), function (err) {
						assert.ifError(err)
						done()
					})
				}
			})
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert(fs.existsSync(path.join(outputDir, 'assets/css')))
				done()
			})
		})
		it('should compile a valid Stylus file to buildDir/assets/css/', function (done) {
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(path.join(outputDir, 'assets/css/page.css')))
				done()
			})
		})

		after(function (done) {
			fse.remove(outputDir, function () {
				done()
			})
		})
	})

	describe.skip('#compileStylesheets()', function () {
		it('should compile all Stylus files from templates/styl to buildDir/assets/css', function (done) {
			console.log(path.join(sitePath, stylDir))
			lib.walk(path.join(sitePath, stylDir), new RegExp(/\.styl$/), function (err, results) {
				assert.ifError(err)
				console.log(results)
				done()
			})
		})
	})
})