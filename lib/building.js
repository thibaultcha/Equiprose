var fs   = require('fs')
var fse  = require('fs-extra')
var path = require('path')

var helpers = require('./helpers.js')
var parse   = require('./parsing.js')
var compile = require('./compile.js')

exports.buildSite = function (sitePath, callback) {
	// TODO: 
	// - make all calls asynchronous ?
	// - use walk()...
	var siteConfig = parse.parseConfig(sitePath)

	var pages = []
	helpers.getFiles(siteConfig.paths.pages.input, new RegExp(/\.md$/), function (err, items) {
		if (err) return callback(err)
		pages = items
	})
	var posts = fetchBlogPosts(siteConfig)

	prepareOutputDir(siteConfig.paths.buildDir, siteConfig.paths.assets.input, siteConfig.paths.assets.output, function (err) {
		if (err) return callback(err)

		// Stylesheets
		compileStylesheets(siteConfig.paths.templateDir, siteConfig.paths.assets.output, function (err) {
			if (err) return callback(err)

			// Pages
			pages.forEach(function (item, idx, pages) {
				compile.compileMarkdownToFile(item, path.join(siteConfig.paths.templateDir, 'layouts'), siteConfig.paths.buildDir, siteConfig.toJade, posts, function (err, pageFilePath) {
					if (err) return callback(err)
					
					if (idx == pages.length - 1) {
						// Posts
						posts.forEach(function (post, index, posts) {
							compile.compileMarkdownToFile(path.join(siteConfig.paths.posts.input, post.filename), path.join(siteConfig.paths.templateDir, 'layouts'), siteConfig.paths.posts.output, siteConfig.toJade, posts, post, function (err, postFilePath) {
								if (err) return callback(err)
								
								if (index == posts.length - 1) {
									return callback()
								}
							})
						})
					}
				})
			})
		})
	})
}

var prepareOutputDir = function (outputDir, assetsDir, assetsOutput, callback) {
	if (!callback || typeof(callback) !== 'function') {
		callback = function () {}
	}
	
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
		}
		else {
			fse.mkdir(outputDir, function (err) {
				if (err) return callback(err)
				copyDirs()
			})
		}
	})
}
exports.prepareOutputDir = prepareOutputDir

var compileStylesheets = function (stylPath, outputCss, callback) {
	if (!callback || typeof(callback) !== 'function') callback = function () {}

	fse.mkdirs(outputCss, function (err) {
		if (err) return callback(err)
		helpers.getFiles(stylPath, new RegExp(/\.styl$/), function (err, results) {
			if (err) return callback(err)
			results.forEach(function (item, idx) {
				compile.compileStylusFile(item, outputCss, function (err) {
					if (err) return callback(err)
					if (idx == results.length - 1) {
						return callback()
					}
				})
			})
		})
	})
}
exports.compileStylesheets = compileStylesheets

var fetchBlogPosts = function (config) {
    var dirContent = fs.readdirSync(config.paths.posts.input)
    .reverse()
    .filter(function (item){return /\.md$/.test(item)})
    
    var defaultName = helpers.pathToProperty(config, 'config.toJade.owner.name') || ' '

    var posts = []
    dirContent.forEach(function (item) {
        posts.push(parse.parsePostMetadatas(path.join(config.paths.posts.input, item), defaultName, config.dateFormat))
    })
    return posts
}
exports.fetchBlogPosts = fetchBlogPosts