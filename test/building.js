var assert = require('assert')
, path     = require('path')
, build    = require('../lib/building.js')

describe('building.js', function () {
	var config  = build.parseConfig('test/test-sites/valid-site')
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

	describe.skip('#prepareOutputDir()', function () {
		it('should initialize an empty buildDir directory', function (done) {
			build.prepareOutputDir(outputDir, function (err) {
				assert.ifError(err)
				assert(fs.existsSync(outputDir))
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
        it('should compile all Stylus files from templates/styl to buildDir/assets/css', function (done) {
            console.log(path.join(sitePath, stylDir))
            lib.walk(path.join(sitePath, stylDir), new RegExp(/\.styl$/), function (err, results) {
                assert.ifError(err)
                console.log(results)
                done()
            })
        })
    })
})