var fs   = require('fs')
var fse  = require('fs-extra')
var path = require('path')

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
        var pages = []
        helpers.getFiles(siteConfig.paths.pages.input, new RegExp(/\.md$/), function (err, items) {
            if (err) return callback(err)
            pages = items
        })
        var posts = this.fetchBlogPosts(siteConfig)
        var self = this

        this.prepareOutputDir(siteConfig.paths.buildDir, siteConfig.paths.assets.input, siteConfig.paths.assets.output, function (err) {
            if (err) return callback(err)

            // Stylesheets
            self.compileStylesheets(siteConfig.paths.templateDir, siteConfig.paths.assets.output, siteConfig.compress, function (err) {
                if (err) return callback(err)

                // Pages
                pages.forEach(function (item, idx) {
                    compile.compileMarkdownToFile(item, siteConfig, posts, function (err) {
                        if (err) return callback(err)

                        if (idx == pages.length - 1) {
                            // Posts
                            if (posts.length > 0) {
                                posts.forEach(function (post, index, posts) {
                                    compile.compileMarkdownToFile(path.join(siteConfig.paths.posts.input, post.filename), siteConfig, posts, post, function (err) {
                                        if (err) return callback(err)

                                        if (index == posts.length - 1) {
                                            return callback(null, siteConfig.paths.buildDir)
                                        }
                                    })
                                })
                            } else {
                                callback(null, siteConfig.paths.buildDir)
                            }
                        }
                    })
                })
            })
        })
    },

    prepareOutputDir: function (outputDir, assetsDir, assetsOutput, callback) {    
        function copyDirs () {
            fse.copy(assetsDir, assetsOutput, function (err) {
                if (err) return callback(err)
                return callback()
            })
        }

        fs.exists(outputDir, function (exists) {
            if (exists) {
                fse.remove(outputDir, function (err) {
                    if (err) return callback(err)
                    fse.mkdir(outputDir, function (err) {
                        if (err) return callback(err)
                        copyDirs()
                    })
                })
            } else {
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
            helpers.getFiles(stylPath, new RegExp(/\.styl$/), function (err, results) {
                if (err) return callback(err)
                results.forEach(function (item, idx) {
                    compile.compileStylusFile(item, outputCss, compress, function (err) {
                        if (err) return callback(err)
                        if (idx == results.length - 1) {
                            return callback()
                        }
                    })
                })
            })
        })
    },

    fetchBlogPosts: function (config) {
        var dirContent = fs.readdirSync(config.paths.posts.input)
        .reverse()
        .filter(function (item){return /\.md$/.test(item)})

        var posts = []
        dirContent.forEach(function (item) {
            posts.push(parse.parsePostMetadatas(path.join(config.paths.posts.input, item), config))
        })
        return posts
    }
}