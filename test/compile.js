var assert = require('assert')
, fs       = require('fs')
, fse      = require('fs-extra')
, path     = require('path')
, parse    = require('../lib/parsing.js')
, compile  = require('../lib/compile.js')

describe('compile.js', function () {
	var config  = parse.parseConfig('test/test_site')
	, outputDir = path.join(config.sitePath, config.buildDir)
	, stylDir   = '_template/styl'

	describe.skip('#prepareOutputDir()', function () {
		it('should initialize an empty buildDir directory', function (done) {
			compile.prepareOutputDir(outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(outputDir))
				done()
			})
		})

		after(function (done) {
			lib.rmdir(outputDir, function () {
				done()
			})
		})
	})

	describe.skip('#compileStylusFile()', function () {
		var stylusfile = path.join(config.sitePath, stylDir, 'page.styl')

		before(function (done) { 
			compile.prepareOutputDir(outputDir, function (err) {
				assert.ifError(err)
				done()
			})
		})

		it('using lib#mkdirp() should create buildDir/assets/css/ if not existing', function (done) {
			before(function (done) {
				if (fs.existsSync(path.join(outputDir, 'assets/css'))) {
					lib.rmdir(path.join(outputDir, 'assets/css'), function () {
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
			lib.rmdir(outputDir, function () {
				done()
			})
		})
	})

	describe.skip('#compileStylesheets()', function () {
		it('should compile all Stylus files from templates/styl to buildDir/assets/css', function (done) {
			console.log(path.join(config.sitePath, stylDir))
			lib.walk(path.join(config.sitePath, stylDir), new RegExp(/\.styl$/), function (err, results) {
				assert.ifError(err)
				console.log(results)
				done()
			})
		})
	})

})