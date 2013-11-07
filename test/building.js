var assert = require('assert')
, path     = require('path')
, fs       = require('fs')
, fse      = require('fs-extra')

var parse = require('../lib/parsing.js')
, build   = require('../lib/building.js')
, helpers = require('../lib/helpers.js')

describe('building.js', function () {
    var config = parse.parseConfig('test/test-sites/build-dir')

	describe('#prepareOutputDir()', function () {
        var outputDir  = config.buildDir
        , assetsDir    = path.join(config.sitePath, config.assets.input)
        , assetsOutput = path.join(outputDir, config.assets.output)

        it('should recreate the buildDir if already present', function (done) {
            before(function (done) {
                if (fs.existsSync(outputDir)) {
                    fse.remove(outputDir, function (err) {
                        assert.ifError(err)
                        done()
                    })
                }
            })

            build.prepareOutputDir(outputDir, assetsDir, assetsOutput, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(outputDir), 'buildDir has not been created')
                done()
            })
        })
		it('should initialize a buildDir directory containing the required folders', function (done) {
			build.prepareOutputDir(outputDir, assetsDir, assetsOutput, function (err) {
				assert.ifError(err)
                assert(fs.existsSync(path.join(assetsOutput, 'js')), 'No assets/js folder')
                assert(fs.existsSync(path.join(assetsOutput, 'img')), 'No assets/img folder')
                assert(fs.existsSync(path.join(assetsOutput, 'files')), 'No assets/files folder')
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

        before(function () {
        	posts = build.fetchBlogPosts(path.join(config.sitePath, config.posts.input), config)
        })

        it('should return an Array', function () {
            assert(posts instanceof Array)
        })
        it('should return an Array with blog posts containing all required properties', function () {
            for (var i = posts.length - 1; i >= 0; i--) {
                assert(posts[i].toJade.date, 'No date property')
                assert(posts[i].toJade.title, 'No title property')
                assert(posts[i].toJade.content, 'No content property')
                assert(posts[i].toJade.author, 'No author property')
                assert(posts[i].toJade.link, 'No link property')
            }  
        })
        it('should return as much blogs posts than there are files', function (done) {
            helpers.getFiles(path.join(config.sitePath, config.posts.input), new RegExp(/\.md$/), function (err, items) {
                assert.ifError(err)
                assert.equal(posts.length, items.length)
                done()
            })
        })
    })

    describe('#compileStylesheets()', function () {
        this.slow(500)
        var stylPath = path.join(config.sitePath, config.templateDir)
        , outputCss  = path.join(config.sitePath, 'rendering-css')

        beforeEach(function (done) {
            fse.remove(outputCss, function (err) {
                assert.ifError(err)
                done()
            })
        })

        it('should create outputCss folder if not existing', function (done) {
            build.compileStylesheets(stylPath, outputCss, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(outputCss), 'outputCss directory was not created')
                done()
            })
        })
        it('should compile all Stylus files from template to outputCss', function (done) {
            build.compileStylesheets(stylPath, outputCss, function (err) {
                assert.ifError(err)
                helpers.getFiles(stylPath, new RegExp(/\.styl$/), function (err, items) {
                    assert.ifError(err)
                    items.forEach(function (item, idx) {
                        var cssFile = path.join(outputCss, path.basename(item).replace(/\.styl$/, '.css'))
                        assert(fs.existsSync(cssFile), 'Inexistant css file: ' + cssFile + ' for file: ' + item)
                        if (idx == items.length - 1) done()
                    })
                })
            })
        })

        afterEach(function (done) {
            fse.remove(outputCss, function (err) {
                assert.ifError(err)
                done()
            })
        })
    })

    describe('#buildSite()', function () {
        var siteNoBuildDir = 'test/test-sites/no-build-dir'
        , siteNoBuildDirConfig
        
        var siteBuildDir = 'test/test-sites/build-dir'
        , siteBuildDirConfig

        before(function () {
            siteNoBuildDirConfig = parse.parseConfig(siteNoBuildDir)
            siteBuildDirConfig   = parse.parseConfig(siteBuildDir)
        })

        it('should compile a website to the default build directory if no buildDir is provided in config.yml', function (done) {
            var globalConfig = parse.parseGlobalConfig()
            build.buildSite(siteNoBuildDir, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(path.join(siteNoBuildDirConfig.sitePath, globalConfig.buildDir)),'Website not compiled when no buildDir property in config.yml')
                done()
            })

            after(function (done) {
                fse.remove(siteNoBuildDirConfig.buildDir, function (err) {
                    assert.ifError(err)
                    done()
                })
            })
        })
        it('should compile a website when a buildDir property is provided in config.yml', function (done) {
            build.buildSite(siteBuildDir, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(siteBuildDirConfig.buildDir), 'Website not compiled when providing a buildDir in config.yml')
                done()
            })

            after(function (done) {
                fse.remove(siteBuildDirConfig.buildDir, function (err) {
                    assert.ifError(err)
                    done()
                })
            })
        })
        it('should properly compile a valid website', function (done) {          
            build.buildSite(siteBuildDir, function (err) {
                assert.ifError(err)

                assert(fs.existsSync(path.join(siteBuildDirConfig.buildDir, siteBuildDirConfig.assets.output)), 'No ' + siteBuildDirConfig.assets.output + ' directory in compiled valid website: ' + siteBuildDir)

                var stylesheets = fs.readdirSync(path.join(siteBuildDirConfig.buildDir, siteBuildDirConfig.assets.output)).filter(function (item) {return item.match(/\.css$/)})
                assert.equal(stylesheets.length, 3, 'Missing stylesheets in compiled valid website: ' + siteBuildDir)
                
                assert(fs.existsSync(path.join(siteBuildDirConfig.buildDir, siteBuildDirConfig.posts.output)), 'No ' + siteBuildDirConfig.posts.output + ' directory in compiled valid website: ' + siteBuildDir)
                
                assert(fs.existsSync(path.join(siteBuildDirConfig.buildDir, siteBuildDirConfig.posts.output, 'hello-world.html')), 'Missing blog post in compiled valid website: ' + siteBuildDir)
                
                // check pages

                done()
            })

            after(function (done) {
                fse.remove(siteBuildDirConfig.buildDir, function (err) {
                    assert.ifError(err)
                    done()
                })
            })
        })
    })
})