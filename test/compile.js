var assert = require('assert')
var fs     = require('fs')
var fse    = require('fs-extra')
var path   = require('path')

var compile = require('../lib/compile')

describe('compile.js', function () {
    var testFiles = 'test/test-files/compile'
    var outputDir = path.join(testFiles, 'rendering')

    beforeEach(function (done) {
        fse.mkdirs(outputDir, function (err) {
            assert.ifError(err)
            done()
        })
    })

    describe('#compileStylusFile()', function () {
        var stylusfile = path.join(testFiles, 'test.styl')

        it('should render a file to path <outputDir>/<filename>.css', function (done) {
            this.slow(200)
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
            layout  : 'layout'
        ,    content : {}
        ,    config  : {
                owner: {
                    name: 'Joe'
                }
            }
        ,    metas   : {}
        ,    posts   : []
        }

        it('should send the custom properties from config.toJade to the jadeRender options', function (done) {
            compile.renderJade(layoutsDir, options, function (err, html, jadeOptions) {
                assert.ifError(err)
                assert(jadeOptions.config === options.config)
                done()
            })
        })
        it.skip('should emojify the content', function (done) {

        })
        it('should compress if compress is set to true', function (done) {
            compile.renderJade(layoutsDir, options, true, function (err, html, jadeOptions) {
                assert.ifError(err)
                assert(jadeOptions.pretty === false)
                done()
            })
        })
        it('should render pretty if compress is set to false', function (done) {
            compile.renderJade(layoutsDir, options, false, function (err, html, jadeOptions) {
                assert.ifError(err)
                assert(jadeOptions.pretty === true)
                done()
            })
        })
        it('should throw an error if more than one layout file is found', function (done) {
            var fn = function () {
                compile.renderJade(layoutsDir, { layout: 'duplicate' }, function (err, html) {
                    done()
                    assert.ifError(err)
                })
            }
            assert.throws(function(){ fn() }, /Multiple jade files/)
        })
        it('should throw an error if no layout file is found', function (done) {
            var fn = function () {
                compile.renderJade(layoutsDir, { layout: 'inexistant' }, function (err, html) {
                    done()
                    assert.ifError(err)
                })
            }
            assert.throws(function(){ fn() }, /No jade file/)
        })
    })

    describe('#compileMarkdownToFile()', function () {
        var mdFile = path.join(testFiles, 'valid-page.md')
        var outputBlog = path.join(outputDir, 'blog')
        var config = {
            paths: {
                templateDir: testFiles
            ,   buildDir: outputDir
            ,   pages: {
                    input: "_pages"
                }
            ,   posts: {
                    output: outputBlog
                }
            ,   assets: {
                    output: "assets"
                }
            }
        ,   toJade: {
                owner: {
                    name: 'Joe'
                }
            }
        }
        var fakePosts = [
            { toJade: { title: 'Hello World' } },
            { toJade: { title: 'It\' snowing today' } }
        ]

        it('should create the outputDir if not existing', function (done) {
            before(function (next) {
                fs.exists(config.paths.buildDir, function (exists) {
                    if (exists) {
                        fse.remove(config.paths.buildDir, function (err) {
                            assert.ifError(err)
                            done()
                        })
                    }
                })
            })
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(config.paths.buildDir), 'The output directory was not created')
                done()
            })
        })
        it('should render a file to path <outputDir/<filename>.html', function (done) {
            var expectedOutputFile = path.join(outputDir, 'valid.html')
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err, outputFile) {
                assert.ifError(err)
                assert(fs.existsSync(outputFile), 'No HTML file at path: ' + outputFile + 'for file: ' + mdFile)
                assert.equal(outputFile, expectedOutputFile, 'invalid outputFile path or naming')
                done()
            })
        })
        it('should send a `posts` property containing an array of blog posts to each compiled page', function (done) {
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err, outputFile, data, options) {
                assert.ifError(err)
                assert.equal(options.posts[0], fakePosts[0].toJade)
                assert.equal(options.posts[1], fakePosts[1].toJade)
                done()
            })
        })
        it('should send the content of a markdown file to the jade template', function (done) {
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err, outputFile, data, options) {
                assert.ifError(err)
                assert(options.content.match(/Valid markdown compilation test./), 'Markdown content has not been sent to the jade template')
                done()
            })
        })
        it('should render markdown content as parsed HTML', function (done) {
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err, outputFile, data, options) {
                assert.ifError(err)
                done()
            })  
        })
        it('should import metadatas variables from markdown metadatas to Jade', function (done) {
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err, outputFile, data, options) {
                assert.ifError(err)
                assert(options.metas.title)
                assert(options.content)
                done()
            })
        })
        it('should import website-specific config.yml variables from markdown to Jade', function (done) {
            compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err, outputFile, data, options) {
                assert.ifError(err)
                assert.equal(options.config.owner.name, config.toJade.owner.name)
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
                        author: 'Joe',
                        date: 'Mon Oct 07 2013 18:26:47 GMT+0200 (CEST)',
                        link: 'its-snowing-today.html'
                    }
                }

            compile.compileMarkdownToFile(mdFile, config, fakePosts, postMetas, function (err, outputFile, data, options) {
                assert.ifError(err)
                assert(options.metas.date, 'No date property in metas for post file')
                assert.equal(options.metas.author, 'Joe', 'No author property in metas for post file')
                assert.equal(options.metas.title, 'It\'s snowing today', 'Missing or incorrect title property in metas for post file')
                done()
            })
        })
        it('should throw an error if no layout file is found', function (done) {
            var mdFile = path.join('test/test-files/errors', 'page-no-layout.md')
            var fn = function () {
                compile.compileMarkdownToFile(mdFile, config, fakePosts, function (err) {
                    done()
                    assert.ifError(err)
                })
            }
            assert.throws(function(){ fn() }, /No jade file/)
        })
    })

    afterEach(function (done) {
        fse.remove(outputDir, function (err) {
            done()
        })
    })
})