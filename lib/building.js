var fs  = require('fs')
, fse   = require('fs-extra')
, path  = require('path')
, parse = require('./parsing.js')

exports.parseConfig = function (sitePath) {
    if (!fs.existsSync(path.join(sitePath, '/config.yml'))) throw new Error('No config.yml file at path: ' + sitePath)
    
    var configStr = fs.readFileSync(sitePath + '/config.yml', { encoding: 'utf-8' })
    , config      = require('yamljs').parse(configStr)
    
    config.sitePath = sitePath
    
    return config
}

exports.prepareOutputDir = function (outputDir, assetsDir, callback) {
	if (!callback || typeof(callback) !== 'function') callback = function () {}
	
	function copyDirs () {
		fse.copy(assetsDir, path.join(outputDir, 'assets'), function (err) {
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
			copyDirs()
		}
	})
}

exports.fetchBlogPosts = function (sitePath) {
	var postsPath  = path.join(sitePath, '_posts')
    var dirContent = fs.readdirSync(postsPath)
    .reverse()
    .filter(function (item){return /\.md$/.test(item)})
    
    var posts = []
    dirContent.forEach(function (item) {
        posts.push(parse.parsePostMetadatas(path.join(postsPath, item), sitePath))
    })
    return posts
}