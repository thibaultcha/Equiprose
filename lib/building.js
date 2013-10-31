var fs    = require('fs')
, fse     = require('fs-extra')
, path    = require('path')

var helpers = require('./helpers.js')
, parse     = require('./parsing.js')
, compile   = require('./compile.js')

var globalConfig = parse.parseGlobalConfig()


exports.buildSite = function (sitePath, callback) {
	
	return callback()
}

var prepareOutputDir = function (outputDir, assetsDir, assetsOutput, callback) {
	if (!callback || typeof(callback) !== 'function') callback = function () {}
	
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
					if (idx == results.length - 1) return callback()
				})
			})
		})
	})
}
exports.compileStylesheets = compileStylesheets

var fetchBlogPosts = function (sitePath) {
	var postsPath  = path.join(sitePath, globalConfig.posts.input)
    var dirContent = fs.readdirSync(postsPath)
    .reverse()
    .filter(function (item){return /\.md$/.test(item)})
    
    var posts = []
    dirContent.forEach(function (item) {
        posts.push(parse.parsePostMetadatas(path.join(postsPath, item), sitePath))
    })
    return posts
}
exports.fetchBlogPosts = fetchBlogPosts