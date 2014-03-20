var fs   = require('fs')
var fse  = require('fs-extra')
var path = require('path')
var glob = require('glob')

var helpers = require('./helpers')
var parse   = require('./parsing')
var compile = require('./compile')

module.exports = {
  newWebsite: function (sitePath, callback) {
    var globalConfig = parse.parseGlobalConfig()
    sitePath = path.resolve(sitePath)

    fse.mkdirp(sitePath, function (err) {
      if (err) return callback(err)
      if (fs.readdirSync(sitePath).length > 0) {
        return callback(new Error('Directory at path ' + sitePath + ' is not empty'))
      }

      fse.copy(__dirname + '/skeleton/', sitePath, function (err) {
        if (err) return callback(err)
        return callback(null, sitePath)
      })
    })
  },

  buildSite: function (siteConfig, callback) {
    var self  = this
    var posts = self.fetchBlogPosts(siteConfig)

    self.prepareOutputDir(siteConfig.paths.buildDir, siteConfig.paths.assets.input, siteConfig.paths.assets.output, function (err) {
      if (err) return callback(err)
      // Stylesheets
      self.compileStylesheets(siteConfig.paths.templateDir, siteConfig.paths.assets.output, siteConfig.compress, function (err) {
        if (err) return callback(err)
        // TODO handle posts.Length = 0 in build posts
        if (posts.length > 0) {
          buildPosts(function () {
            buildPages()
          })
        }
        else {
          buildPages()
        }
      })
    })

    /**
    * Compile pages and calls buildSite's callback.
    * To invoke at last
    */
    function buildPages() {
      glob(siteConfig.paths.pages.input + '/**/*.md', { sync: true, nosort: true }, function (err, pages) {
        if (err) return callback(err)
        pages.forEach(function (page, idx) {
          compile.compileMarkdownToFile(page, siteConfig, posts, function (err) {
            if (err) return callback(err)
            if (idx === pages.length - 1) {
              callback(null, siteConfig.paths.buildDir)
            }
          })
        })
      })
    }

    function buildPosts(next) {
      posts.forEach(function (post, idx) {
        compile.compileMarkdownToFile(path.join(siteConfig.paths.posts.input, post.filename), siteConfig, posts, post, function (err) {
          if (err) return callback(err)
          if (idx === posts.length - 1) {
           next()
          }
        })
      })
    }
  },

  prepareOutputDir: function (outputDir, assetsDir, assetsOutput, callback) {
    function copyDirs () {
      fse.copy(assetsDir, assetsOutput, function (err) {
        if (err) return callback(err)
        callback()
      })
    }

    fs.exists(outputDir, function (exists) {
      if (exists) {
        fs.readdir(outputDir, function (err, files) {
          if (err) return callback(err)
          files.forEach(function (file) {
            var filepath = path.join(outputDir, file)
            if (file.charAt(0) !== '.') {
              if (fs.statSync(filepath).isDirectory()) {
                fse.removeSync(filepath)
              }
              else {
                fs.unlinkSync(filepath)
              }
            }
          })
          copyDirs()
        })
      }
      else {
        fse.mkdir(outputDir, function (err) {
          if (err) return callback(err)
          copyDirs()
        })
      }
    })
  },

  compileStylesheets: function (stylPath, outputCss, compress, callback) {
    if (arguments.length === 3) {
      callback = compress
      compress = true
    }
    fse.mkdirs(outputCss, function (err) {
      if (err) return callback(err)
      glob(stylPath + '/**/*.styl', { sync: true, nosort: true }, function (err, files) {
        if (err) return callback(err)
        if (files.length < 1) {
          callback()
        }
        files.forEach(function (file, idx) {
          compile.compileStylusFile(file, outputCss, compress, function (err) {
            if (err) return callback(err)
            if (idx === files.length - 1) {
              callback()
            }
          })
        })
      })
    })
  },

  fetchBlogPosts: function (config) {
    var postsMetas = []
    glob(config.paths.posts.input + '/!(_)*.md', { sync: true, nosort: true }, function (err, posts) {
      posts.reverse().forEach(function (post) {
        postsMetas.push(parse.parsePostMetadatas(post, config))
      })
    })

    return postsMetas
  }
}
