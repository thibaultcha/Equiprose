var assert = require('assert')
, path     = require('path')
, fs       = require('fs')
, fse      = require('fs-extra')
, build    = require('../lib/building.js')

describe('building.js', function () {
	var config  = build.parseConfig('test/test-sites/valid-site')
    , assetsDir = path.join(config.sitePath, '_assets')
	, outputDir = path.join(config.sitePath, config.buildDir)

	describe('#parseConfig()', function () {
        it('should return an object', function () {
            assert(config instanceof Object)
        })
        it('should add a `sitePath` property', function () {
            assert(config.sitePath)
        })
        it('should throw an error when no config.yml file is found', function () {
            assert.throws(function () { build.parseConfig('test/test-sites/errors/no-config') }, /No config.yml file/)
        })
    })

	describe('#prepareOutputDir()', function () {
        it('should remove the buildDir if already present', function (done) {
            before(function (done) {
                if (fs.existsSync(outputDir)) {
                    fse.remove(outputDir, function (err) {
                        assert.ifError(err)
                        done()
                    })
                }
            })

            build.prepareOutputDir(outputDir, assetsDir, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(outputDir))
                done()
            })
        })
		it('should initialize a buildDir directory containing the required folders', function (done) {
			build.prepareOutputDir(outputDir, assetsDir, function (err) {
				assert.ifError(err)
                assert(fs.existsSync(path.join(outputDir, 'assets/js')), 'No assets/js folder')
                assert(fs.existsSync(path.join(outputDir, 'assets/img')), 'No assets/img folder')
                assert(fs.existsSync(path.join(outputDir, 'assets/files')), 'No assets/files folder')
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

	describe('#fetchBlogPosts()', function () {
        var posts

        beforeEach(function () {
        	posts = build.fetchBlogPosts(config.sitePath)
        })

        it('should return an Array', function () {
            assert(posts instanceof Array)
        })
        it('should return an Array with blog posts containing all required properties', function () {
            for (var i = posts.length - 1; i >= 0; i--) {
                assert(posts[i].toJade.date)
                assert(posts[i].toJade.title)
                assert(posts[i].toJade.content)
                assert(posts[i].toJade.author)
                assert(posts[i].toJade.link)
            }  
        })
    })

    describe.skip('#compileStylesheets()', function () {
        

        before(function (done) {
            fse.remove(outputDir, function (err) {
                assert.ifError(err)
                done()
            })
        })

        it('using fse#mkdirs() should create the buildDir if not existing', function (done) {
            
        })
        it('should compile all Stylus files from templates/styl to buildDir/css', function (done) {
            lib.walk(path.join(sitePath, stylDir), new RegExp(/\.styl$/), function (err, results) {
                assert.ifError(err)
                console.log(results)
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