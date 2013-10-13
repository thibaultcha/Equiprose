var assert = require('assert')
, fs       = require('fs')
, path     = require('path')
, parse    = require('../bin/lib/parsing.js')
, lib      = require('../bin/lib/lib.js')
, compile  = require('../bin/lib/compile.js')

describe('Compile', function () {
	var config, outputDir

	before(function () {
		config    = lib.parseConfig('test/test_site')
		outputDir = path.join(config.sitePath, config.buildDir)
	})

	describe('#prepareOutputDir()', function () {
		it('should initialize an empty buildDir directory', function (done) {
			compile.prepareOutputDir(outputDir, function (err) {
				if (err) throw err
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

	describe('#compileStylusFile()', function () {
		before(function (done) {
			compile.prepareOutputDir(outputDir, function (err) {
				if (err) throw err
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

			var stylusfile = path.join(config.sitePath, 'template/styl/page.styl')
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert(fs.existsSync(path.join(outputDir, 'assets/css')))
				done()
			})
		})

		it('should compile a valid .styl file to buildDir/assets/css/', function (done) {
			var stylusfile = path.join(config.sitePath, 'template/styl/page.styl')
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
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

	})

})