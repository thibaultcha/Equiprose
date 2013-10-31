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
		it('should create the outputDir if not existing', function (done) {
			this.slow(200)
			var customOutput = path.join(outputDir, 'createdir')
			compile.compileStylusFile(stylusfile, customOutput, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(customOutput), 'The output directory was not created')
				done()
			})
		})
	})

	describe('#compileMarkdown()', function () {
		it.skip('should pass variables to Jade so they are included in the HTML output file', function (done) {
			var mdFile = path.join(testFiles, 'valid.md')
			compile.compileMarkdown(mdFile, testFiles, function (err, html) {
				assert.ifError(err)
				done()
			})
		})
		it('should throw an error if not layout file is found', function (done) {
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
		var mdFile = path.join(testFiles, 'valid.md')

		it('should render a file to path <outputDir/<filename>.html', function (done) {
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, function (err, outputFile) {
				assert.ifError(err)
				assert(fs.existsSync(outputFile), 'No HTML file at path: ' + outputFile + 'for file: ' + mdFile)
				done()
			})
		})
		it('should create the outputDir if not existing', function (done) {
			var customOutput = path.join(outputDir, 'createdir')
			compile.compileMarkdownToFile(mdFile, testFiles, customOutput, function (err, outputFile) {
				assert.ifError(err)
				assert(fs.existsSync(customOutput), 'The output directory was not created')
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