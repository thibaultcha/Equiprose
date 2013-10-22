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
			fse.mkdirs(outputDir, function (err) {
				assert.ifError(err)
				done()
			})
		})

		it('should render a file to path <outputDir>/<filename>.css', function (done) {
			this.slow(500);
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(path.join(outputDir, 'test.css')))
				done()
			})
		})

		after(function (done) {
			fse.remove(outputDir, function (err) {
				assert.ifError(err)
				done()
			})
		})
	})
})