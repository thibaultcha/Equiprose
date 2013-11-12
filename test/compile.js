var assert = require('assert')
, fs       = require('fs')
, fse      = require('fs-extra')
, path     = require('path')

var compile = require('../lib/compile.js')

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
		var mdFile = path.join(testFiles, 'valid.md')
		var toJadeConfig = {
			owner: {
				name: 'Joe'
			}
		}
		var posts = [
			{ title: 'Post 1' },
			{ title: 'Post 2' }
		]

		it('should import metadatas variables from markdown header to Jade', function (done) {
			compile.compileMarkdown(mdFile, testFiles, toJadeConfig, posts, function (err, html) {
				assert.ifError(err)
				assert(html.match(/<title>A title<\/title>/))
				done()
			})
		})
		it('should import website-specific config.yml variables from markdown to Jade', function (done) {
			compile.compileMarkdown(mdFile, testFiles, toJadeConfig, posts, function (err, html) {
				assert.ifError(err)
				assert(html.match(/<h1>Joe<\/h1>/))
				done()
			})
		})
		it('should send a `posts` property to each compiled page containing an array of blog posts', function (done) {
			compile.compileMarkdown(mdFile, testFiles, toJadeConfig, posts, function (err, html, filemetas, options) {
				assert.ifError(err)
				assert(options.posts === posts, 'No posts array sent to compiled page')
				done()
			})
		})
		it('should send the content of a markdown file to the jade template', function (done) {
			compile.compileMarkdown(mdFile, testFiles, toJadeConfig, posts, function (err, html) {
				assert.ifError(err)
				assert(html.match(/>Valid markdown compilation test.</), 'Markdown content has not been sent to the jade template')
				done()
			})
		})
		it('should throw an error if not layout file is found', function (done) {
			var mdFile = path.join('test/test-files/errors', 'page-no-layout.md')
			var fn = function () {
				compile.compileMarkdown(mdFile, testFiles, toJadeConfig, posts, function (err, outputFile) {
					done()
					assert.ifError(err)
				})
			}
			assert.throws(function(){ fn() }, /No jade file/)
		})
	})

	describe('#compileMarkdownToFile()', function () {
		var mdFile = path.join(testFiles, 'valid.md')
		var toJadeConfig = {
			owner: {
				name: 'Joe'
			}
		}

		it('should render a file to path <outputDir/<filename>.html', function (done) {
			var expectedOutputFile = path.join(outputDir, 'valid.html')
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, function (err, outputFile) {
				assert.ifError(err)
				assert(fs.existsSync(outputFile), 'No HTML file at path: ' + outputFile + 'for file: ' + mdFile)
				assert.equal(outputFile, expectedOutputFile, 'invalid outputFile path or naming')
				done()
			})
		})
		it('should create the outputDir if not existing', function (done) {
			var customOutput = path.join(outputDir, 'createdir')
			compile.compileMarkdownToFile(mdFile, testFiles, customOutput, toJadeConfig, null, function (err, outputFile) {
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