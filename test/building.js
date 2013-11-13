var assert  = require('assert')
var path    = require('path')
var fs      = require('fs')
var fse     = require('fs-extra')

var parse   = require('../lib/parsing.js')
var build   = require('../lib/building.js')
var helpers = require('../lib/helpers.js')

describe('building.js', function () {
    var config = parse.parseConfig('test/test-sites/build-dir')

	describe('#prepareOutputDir()', function () {
        it('should recreate the buildDir if already present', function (done) {
            before(function (done) {
                if (fs.existsSync(config.paths.buildDir)) {
                    fse.remove(config.paths.buildDir, function (err) {
                        assert.ifError(err)
                        done()
                    })
                }
            })

            build.prepareOutputDir(config.paths.buildDir, config.paths.assets.input, config.paths.assets.output, function (err) {
                assert.ifError(err)
                assert(fs.existsSync(config.paths.buildDir), 'buildDir has not been created')
                done()
            })
        })
		it('should initialize a buildDir directory containing the required folders', function (done) {
			build.prepareOutputDir(config.paths.buildDir, config.paths.assets.input, config.paths.assets.output, function (err) {
				assert.ifError(err)
                assert(fs.existsSync(path.join(config.paths.assets.output, 'js')), 'No assets/js folder')
                assert(fs.existsSync(path.join(config.paths.assets.output, 'img')), 'No assets/img folder')
                assert(fs.existsSync(path.join(config.paths.assets.output, 'files')), 'No assets/files folder')
				done()
			})
		})
        it('should override the existing files before preparing the directory', function (done) {
            before(function (done) {
                var dir = path.join(config.paths.assets.output, 'js')
                fse.mkdirp(dir, function (err) {
                    assert.ifError(err)
                    fs.writeFileSync(path.join(dir, 'to-remove.js'), 'test')
                    done()
                })
            })

            build.prepareOutputDir(config.paths.buildDir, config.paths.assets.input, config.paths.assets.output, function (err) {
                assert.ifError(err)
                var jsFiles = fs.readdirSync(path.join(config.paths.assets.output, 'js'))
                jsFiles.forEach(function (item) {
                    assert(item !== 'to-remove.js', 'Failed to remove assets/js dir before copying new assets')
                })
                done()
            })
        })

		after(function (done) {
			fse.remove(config.paths.buildDir, function (err) {
                assert.ifError(err)
				done()
			})
		})
	})

	describe('#fetchBlogPosts()', function () {
        var posts

        before(function () {
        	posts = build.fetchBlogPosts(config)
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
            helpers.getFiles(config.paths.posts.input, new RegExp(/\.md$/), function (err, items) {
                assert.ifError(err)
                assert.equal(posts.length, items.length)
                done()
            })
        })
    })

    describe('#compileStylesheets()', function () {
        this.slow(300)
        var stylPath = config.paths.templateDir
        var outputCss  = path.join(config.sitePath, 'rendering-css')

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
        this.slow(500)
        var siteNoBuildDir = 'test/test-sites/no-build-dir'
        , siteNoBuildDirConfig
        
        var siteBuildDir = 'test/test-sites/build-dir'
        , siteBuildDirConfig

        before(function (done) {
            siteNoBuildDirConfig = parse.parseConfig(siteNoBuildDir)
            siteBuildDirConfig   = parse.parseConfig(siteBuildDir)

            build.buildSite(siteNoBuildDir, function (err) {
                assert.ifError(err)
                build.buildSite(siteBuildDir, function (err) {
                    assert.ifError(err)
                    done()
                })
            })
        })

        it('should compile a website to the default build directory if no buildDir is provided in config.yml', function () {
        
            var globalConfig = parse.parseGlobalConfig()
            assert(fs.existsSync(path.join(siteNoBuildDirConfig.sitePath, globalConfig.paths.buildDir)),'Website not compiled when no buildDir property in config.yml')
        
        })
        it('should compile a website when a buildDir property is provided in config.yml', function () {
        
            assert(fs.existsSync(siteBuildDirConfig.paths.buildDir), 'Website not compiled when providing a buildDir in config.yml')
        
        })
        it('should compile a valid website with the required folders and same number of files', function () { 
            
            assert(fs.existsSync(siteBuildDirConfig.paths.assets.output), 'No ' + siteBuildDirConfig.paths.assets.output + ' directory in compiled valid website: ' + siteBuildDir)

            var stylesheets = fs.readdirSync(siteBuildDirConfig.paths.assets.output).filter(function (item) {return item.match(/\.css$/)})
            assert.equal(stylesheets.length, 3, 'Missing stylesheets in compiled valid website: ' + siteBuildDir)
                
            assert(fs.existsSync(siteBuildDirConfig.paths.posts.output), 'No ' + siteBuildDirConfig.paths.posts.output + ' directory in compiled valid website: ' + siteBuildDir)
                
            assert(fs.existsSync(path.join(siteBuildDirConfig.paths.posts.output, 'hello-world.html')), 'Missing blog post in compiled valid website: ' + siteBuildDir)
                
            // TO TEST
            // check pages
            // correct slug
            // correct filename?
        })
        it('should include variables from a page file metadatas', function () {
            var contentPage = fs.readFileSync(path.join(siteBuildDirConfig.paths.buildDir, 'index.html'), { encoding: 'utf-8' })
            assert(contentPage.match(/<title>Home<\/title>/), 'Missing variable title for compiled page')
            assert(contentPage.match(/<div id="content">Hello, I am Miranda.<\/div>/), 'Missing variable content for compiled page')
            assert(contentPage.match(/<div id="custom">Joe<\/div>/), 'Missing custom variable for compiled page')
        })
        it('should include variables from a post file metadatas (retrieved from fetchBlogPosts())', function () {
            var postFiles = fs.readdirSync(siteBuildDirConfig.paths.posts.output)

            // test on hello world
            var contentPost0 = fs.readFileSync(path.join(siteBuildDirConfig.paths.posts.output, postFiles[0]), { encoding: 'utf-8' })
            assert(contentPost0.match(/<h1 id="post-title">Hello World<\/h1>/), 'Missing variable title for compiled blog post')
            assert(contentPost0.match(/<div id="post-content">My first blog post<\/div>/), 'Missing variable content for compiled blog post')

            // TO TEST
            // date
            // author
            // title
            // link
            // content
        })

        after(function (done) {
            /*fse.remove(siteBuildDirConfig.paths.buildDir, function (err) {
                assert.ifError(err)
                fse.remove(siteNoBuildDirConfig.paths.buildDir, function (err) {
                    assert.ifError(err)
                    done()
                })
            })*/
            done()
        })
    })
})