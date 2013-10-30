var assert = require('assert')
, fs       = require('fs')
, fse      = require('fs-extra')
, path     = require('path')

var compile = require('../lib/compile.js')
, parse     = require('../lib/parsing.js')

describe('compile.js', function () {
	var testFiles = 'test/test-files/compile'
	, outputDir   = path.join(testFiles, 'rendering')

	beforeEach(function (done) {
		fse.mkdirs(outputDir, function (err) {
			assert.ifError(err)
			done()
		})
	})

	describe.skip('#compileStylus()', function () {

	})

	describe('#compileStylusFile()', function () {
		var stylusfile = path.join(testFiles, 'test.styl')

		it('should render a file to path <outputDir>/<filename>.css', function (done) {
			this.slow(200);
			compile.compileStylusFile(stylusfile, outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(path.join(outputDir, 'test.css')), 'No CSS file at path: ' + path.join(outputDir, 'test.css'))
				done()
			})
		})
	})

	describe('#compileMarkdown()', function () {
		it('should pass variables to Jade so they are included in the HTML output file', function (done) {
			var mdFile = path.join(testFiles, 'valid.md')
			compile.compileMarkdown(mdFile, testFiles, function (err, html) {
				assert.ifError(err)
				done()
			})
		})
		it('should throw an error if not layout file found', function (done) {
			var mdFile = path.join('test/test-files/errors', 'page-no-layout.md')
			var fn = function () {
				compile.compileMarkdown(mdFile, testFiles, function (err, outputFile) {
					done()
					assert.ifError(err)
				})
			}
			assert.throws(function(){ fn() }, /No jade file/)
		})
	})

	describe('#compileMarkdownToFile()', function () {
		it('should render a file to path <outputDir/<filename>.html', function (done) {
			var mdFile = path.join(testFiles, 'valid.md')
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, function (err, outputFile) {
				assert.ifError(err)
				assert(fs.existsSync(outputFile), 'No HTML file at path: ' + outputFile + 'for file: ' + mdFile)
				done()
			})
		})
	})

	afterEach(function (done) {
		fse.remove(outputDir, function (err) {
			assert.ifError(err)
			done()
		})
	})
})