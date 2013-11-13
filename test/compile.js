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

	describe('#renderJade()', function () {
		var layoutsDir = 'test/test-files/compile'
		var options = {
			layout  : 'layout',
	        content : {},
	        config  : {
				owner: {
					name: 'Joe'
				}
			},
	        metas   : {},
	        posts   : []
    	}

    	it('should send the custom properties from config.toJade to the jadeRender options', function (done) {
    		compile.renderJade(layoutsDir, options, function (err, html, opts) {
    			assert.ifError(err)
    			assert(opts.config === options.config)
    			done()
    		})
    	})
		it('should throw an error if not layout file is found', function (done) {
			options.layout = 'inexistant'
			var fn = function () {
				compile.renderJade('test', options, function (err, html) {
					done()
					assert.ifError(err)
				})
			}
			assert.throws(function(){ fn() }, /No jade file/)
		})
	})

	describe('#compileMarkdownToFile()', function () {
		var mdFile = path.join(testFiles, 'valid-page.md')
		var toJadeConfig = {
			owner: {
				name: 'Joe'
			}
		}

		it('should create the outputDir if not existing', function (done) {
			var customOutput = path.join(outputDir, 'createdir')
			compile.compileMarkdownToFile(mdFile, testFiles, customOutput, toJadeConfig, null, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(customOutput), 'The output directory was not created')
				done()
			})
		})
		it('should render a file to path <outputDir/<filename>.html', function (done) {
			var expectedOutputFile = path.join(outputDir, 'valid.html')
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, function (err, outputFile) {
				assert.ifError(err)
				assert(fs.existsSync(outputFile), 'No HTML file at path: ' + outputFile + 'for file: ' + mdFile)
				assert.equal(outputFile, expectedOutputFile, 'invalid outputFile path or naming')
				done()
			})
		})
		it('should send a `posts` property containing an array of blog posts to each compiled page', function (done) {
			var posts = [
				{ title: 'Hello World' },
				{ title: 'It\'s snowing today' }
			]
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, posts, function (err, outputFile, data, options) {
				assert.ifError(err)
				assert(options.posts === posts, 'No posts array sent to compiled page')
				done()
			})
		})
		
		// Those implicitely mean that the variable is in options
		
		it('should send the content of a markdown file to the jade template', function (done) {
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, function (err, outputFile, data) {
				assert.ifError(err)
				assert(data.match(/>Valid markdown compilation test.</), 'Markdown content has not been sent to the jade template')
				done()
			})
		})
		it('should import metadatas variables from markdown metadatas to Jade', function (done) {
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, function (err, outputFile, data, options) {
				assert.ifError(err)
				assert(options.metas.title)
				assert(options.content)
				assert(options.metas.title)
				done()
			})
		})
		it('should import website-specific config.yml variables from markdown to Jade', function (done) {
			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, function (err, outputFile, data, options) {
				assert.ifError(err)
				assert.equal(options.config.owner.name, 'Joe')
				done()
			})
		})
		it('should compile as a blog post if 7 arguments are sent', function (done) {
			var mdFile = path.join(testFiles, 'valid-post.md')
			var postMetas = { 
				filename: '2013-12-01_its-snowing-today.md',
			    slug: 'its-snowing-today',
			  	layout: 'layout',
			  	toJade: {
			  			title: 'It\'s snowing today',
			     		content: 'It\'s snowing today',
			     		author: ' ',
			     		date: '13 Nov 2013',
			     		link: 'its-snowing-today.html'
			    	}
			    }

			compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, postMetas, function (err, outputFile, data, options) {
				assert.ifError(err)

				// TODO
				assert(options.metas.date)
				assert(options.metas.author)
				done()
			})
		})
		it('should throw an error if not layout file is found', function (done) {
			var mdFile = path.join('test/test-files/errors', 'page-no-layout.md')
			var fn = function () {
				compile.compileMarkdownToFile(mdFile, testFiles, outputDir, toJadeConfig, null, function (err) {
					done()
					assert.ifError(err)
				})
			}
			assert.throws(function(){ fn() }, /No jade file/)
		})
	})

	afterEach(function (done) {
		fse.remove(outputDir, function (err) {
			assert.ifError(err)
			done()
		})
	})
})