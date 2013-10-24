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

	describe('#compileMarkdownFile()', function () {
		var mdfile   = path.join(testFiles, 'valid.md')
		, filemetas  = parse.parseMetadatas(mdfile)

		it('should render a file to path <outputDir/<filename>.html', function (done) {
			compile.compileMarkdownFile(mdfile, testFiles, outputDir, function (err, outputFile) {
				assert.ifError(err)
				assert(fs.existsSync(outputFile), 'No HTML file at path: ' + outputFile)
				done()
			})
		})
		it.skip('should pass variables to Jade so they are included in the HTML output file', function (done) {
			done()
		})
		it.skip('should throw an error if not layout file', function (done) {
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