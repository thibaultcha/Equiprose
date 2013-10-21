var assert = require('assert')
, fs       = require('fs')
, fse      = require('fs-extra')
, path     = require('path')
, compile  = require('../lib/compile.js')

describe('compile.js', function () {
	var testFiles = 'test/test-files/compile'
	, outputDir   = path.join(testFiles, 'rendering')

	describe('#compileStylusFile()', function () {
		var stylusfile = path.join(testFiles, 'styl', 'test.styl')

		before(function (done) {
			fse.remove(outputDir, function (err) {
				assert.ifError(err)
				done()
			})
		})

		it('using fse#mkdirs() should create the buildDir if not existing', function (done) {
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(outputDir))
				done()
			})
		})
		it('should render a file to path outputDir/filename.css', function (done) {
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(path.join(outputDir, 'test.css')))
				done()
			})
		})

		afterEach(function (done) {
			fse.remove(outputDir, function (err) {
				assert.ifError(err)
				done()
			})
		})
	})
})