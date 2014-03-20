var assert = require('assert')
var path   = require('path')
var fs     = require('fs')
var fse    = require('fs-extra')
var glob   = require('glob')

var parse   = require('../lib/parsing')
var build   = require('../lib/building')
var helpers = require('../lib/helpers')

describe('building.js', function () {
  var config = parse.parseConfig('test/test-sites/build-dir')

  describe('#newWebsite()', function () {
    var globalConf  = parse.parseGlobalConfig()
    var newWebsite  = 'test/new-website/'
    var notEmpty    = 'test/not-empty/'
    var websitepath = ''

    before(function (done) {
      fse.mkdirp(notEmpty, function (err) {
        assert.ifError(err)
        fs.writeFile(notEmpty + '/file.txt', 'Lorem Ipsum', { encoding: 'utf-8' }, function (err) {
          assert.ifError(err)
          build.newWebsite(newWebsite, function (err, sitePath) {
            assert.ifError(err)
            websitepath = sitePath
            done()
          })
        })
      })
    })
    it('should create the directory if not existing', function () {
      assert(fs.existsSync(newWebsite), 'Did not create the website directory')
    })
    it('should copy the skeleton to the given path', function () {
      assert(fs.existsSync(path.join(newWebsite, globalConf.paths.pages.input)), 'Missing pages input directory')
      assert(fs.existsSync(path.join(newWebsite, globalConf.paths.posts.input)), 'Missing posts input directory')
      assert(fs.existsSync(path.join(newWebsite, globalConf.paths.assets.input)), 'Missing assets input directory')
      assert(fs.existsSync(path.join(newWebsite, globalConf.paths.templateDir)), 'Missing template directory')
    })
    it('should return the absolute path of the new website in callback', function () {
      assert.equal(websitepath.charAt(0), '/')
    })
    it('should return an error if the target directory is not empty', function (done) {
      build.newWebsite(notEmpty, function (err) {
        assert(err !== null)
        done()
      })
    })
    after(function (done) {
      fse.remove(newWebsite, function (err) {
        assert.ifError(err)
        fse.remove(notEmpty, function (err) {
          assert.ifError(err)
          done()
        })
      })
    })
  })

describe('#prepareOutputDir()', function () {
  before(function (done) {
    if (fs.existsSync(config.paths.buildDir)) {
      fse.remove(config.paths.buildDir, function (err) {
        assert.ifError(err)
        done()
      })
    } else {
      done()
    }
  })
  it('should create the buildDir if it doesn\'t already exist', function (done) {
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
  it('should erase the existing non-hidden files if the buildDir already exists', function (done) {
    fse.mkdirp(config.paths.assets.output, function (err) {
      assert.ifError(err)
      fs.writeFileSync(path.join(config.paths.assets.output, 'to-remove.js'), 'test')
      fs.writeFileSync(path.join(config.paths.buildDir, 'to-remove.html'), 'test')
      fs.writeFileSync(path.join(config.paths.buildDir, '.not-to-remove'), 'test')

      build.prepareOutputDir(config.paths.buildDir, config.paths.assets.input, config.paths.assets.output, function (err) {
        assert.ifError(err)
        assert(fs.existsSync(path.join(config.paths.buildDir, '.not-to-remove')), 'Removed hidden file in existing buildDir/ though it should not')
        assert(!fs.existsSync(path.join(config.paths.buildDir, 'to-remove.html')), 'Failed to clean builDir/ before copying new assets: existing to-remove.html')
        assert(!fs.existsSync(path.join(config.paths.assets.output, 'to-remove.js')), 'Failed to clean builDir/assets/ before copying new assets: existing: to-remove.js')
        done()
      })
    })
  })

afterEach(function (done) {
 fse.remove(config.paths.buildDir, function (err) {
  assert.ifError(err)
  done()
})
})
})

describe('#fetchBlogPosts()', function () {
  var posts = []

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
    glob(config.paths.posts.input + '/*.md', { sync: true, nosort: true }, function (err, foundPosts) {
      assert.ifError(err)
      assert.equal(posts.length, foundPosts.length)
      done()
    })
  })
})

describe('#compileStylesheets()', function () {
  this.slow(300)
  var stylPath  = config.paths.templateDir
  var outputCss = path.join(config.sitePath, 'rendering-css')

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
      glob(stylPath + '/**/*.styl', { sync: true, nosort: true }, function (err, items) {
        assert.ifError(err)
        items.forEach(function (item, idx) {
          var cssFile = path.join(outputCss, path.basename(item).replace(/\.styl$/, '.css'))
          assert(fs.existsSync(cssFile), 'Missing css file: ' + cssFile + ' for file: ' + item)
        })
        done()
      })
    })
  })
  it('should callback if 0 stylsheets are found', function (done) {
    build.compileStylesheets('test/test-sites/no-styl', outputCss, function (err) {
      assert.ifError(err)
      done()
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
  var siteNoBuildDirConfig = {}

  var siteBuildDir = 'test/test-sites/build-dir'
  var siteBuildDirConfig = {}

  var siteNoPosts = 'test/test-sites/no-posts'
  var siteNoPostsConfig = {}

  var siteNoStyl = 'test/test-sites/no-styl'
  var siteNoStylConfig = {}

  var websitepath = ''

  before(function (done) {
    siteNoBuildDirConfig = parse.parseConfig(siteNoBuildDir)
    siteBuildDirConfig   = parse.parseConfig(siteBuildDir)

    build.buildSite(siteNoBuildDirConfig, function (err) {
      assert.ifError(err)
      build.buildSite(siteBuildDirConfig, function (err, sitePath) {
        assert.ifError(err)
        websitepath = sitePath
        done()
      })
    })
  })

  it('should return the absolute path to the compiled website in the callback', function () {
    assert.equal(websitepath.charAt(0), '/')
  })
  it('should compile a website to the default build directory if no buildDir is provided in config.yml', function () {

    var globalConfig = parse.parseGlobalConfig()
    assert(fs.existsSync(path.join(siteNoBuildDirConfig.sitePath, globalConfig.paths.buildDir)),
      'Website not compiled when no buildDir property in config.yml')

  })
  it('should compile a website when a buildDir property is provided in config.yml', function () {

    assert(fs.existsSync(siteBuildDirConfig.paths.buildDir),
      'Website not compiled when providing a buildDir in config.yml')

  })
  it('should compile a valid website with the required folders and same number of files', function () {

    assert(fs.existsSync(siteBuildDirConfig.paths.assets.output),
      'No ' + siteBuildDirConfig.paths.assets.output + ' directory in compiled valid website: ' + siteBuildDir)

    var stylesheets = fs.readdirSync(siteBuildDirConfig.paths.assets.output).filter(function (item) {return item.match(/\.css$/)})
    assert.equal(stylesheets.length, 3, 'Missing stylesheets in compiled valid website: ' + siteBuildDir)

    assert(fs.existsSync(siteBuildDirConfig.paths.posts.output),
      'No ' + siteBuildDirConfig.paths.posts.output + ' directory in compiled valid website: ' + siteBuildDir)

    assert(fs.existsSync(path.join(siteBuildDirConfig.paths.posts.output, 'hello-world.html')),
      'Missing blog post in compiled valid website: ' + siteBuildDir)

    assert(fs.existsSync(path.join(siteBuildDirConfig.paths.buildDir, 'about.html')),
      'Missing page about.html in compiled valid website')

    assert(fs.existsSync(path.join(siteBuildDirConfig.paths.buildDir, 'project/index.html')),
      'Missing nested page project/index.html in compiled valid website')
  })
it('should include variables from a page file metadatas', function () {
  var contentPage = fs.readFileSync(path.join(siteBuildDirConfig.paths.buildDir, 'index.html'), { encoding: 'utf-8' })
  assert(/<title>Home<\/title>/.test(contentPage), 'Missing variable title for compiled page')
  assert(/<div id="content"><p>Hello, I am Miranda.<\/p><\/div>/.test(contentPage), 'Missing variable content for compiled page')
  assert(/<div id="custom">OwnerName<\/div>/.test(contentPage), 'Missing custom variable for compiled page')
})
it('should include variables from a post file metadatas (retrieved from fetchBlogPosts())', function () {
  var postFiles = fs.readdirSync(siteBuildDirConfig.paths.posts.output)
            // test on hello-world.html
            var contentPost0 = fs.readFileSync(path.join(siteBuildDirConfig.paths.posts.output, postFiles[0]), { encoding: 'utf-8' })
            assert(/<h1 id="post-title">Hello World<\/h1>/.test(contentPost0), 'Missing variable title for compiled blog post')
            assert(/<h2 id="post-author">AuthorName<\/h2>/.test(contentPost0), 'Missing variable author for compiled blog post')
            assert(/<h2 id="post-date">07 Oct 2013<\/h2>/.test(contentPost0), 'Missing variable date for compiled blog post')
            assert(/<div id="post-content"><p>My first blog post<\/p><\/div>/.test(contentPost0), 'Missing or invalid variable content for compiled blog post')
          })
it('should compile a website with 0 blog posts', function (done) {
  siteNoPostsConfig = parse.parseConfig(siteNoPosts)
  build.buildSite(siteNoPostsConfig, function (err, sitePath) {
    assert.ifError(err)
    done()
  })
})
it('should compile a website with 0 stylesheets', function (done) {
  siteNoStylConfig = parse.parseConfig(siteNoStyl)
  build.buildSite(siteNoStylConfig, function (err, sitePath) {
    assert.ifError(err)
    done()
  })
})
it.skip('should compile a website with 0 pages', function (done) {

})

after(function (done) {
  fse.remove(siteBuildDirConfig.paths.buildDir, function (err) {
    assert.ifError(err)
    fse.remove(siteNoBuildDirConfig.paths.buildDir, function (err) {
      assert.ifError(err)
      done()
    })
  })
})
})
})
