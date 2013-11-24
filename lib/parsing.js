var fs      = require('fs')
var path    = require('path')
var helpers = require('./helpers')

module.exports = {
    /**
    * Parse the Miranda global config (global_config.yml) 
    * and return it as an object
    * 
    * @return {Object} The global config object
    */
    parseGlobalConfig: function () {
        var data = fs.readFileSync(path.join(__dirname, 'global_config.yml'), { encoding: 'utf-8'})
        var globalConfig = require('yamljs').parse(data)

        return globalConfig
    },

    /**
    * Parse a website config and return it as an object
    * The global config object will be merged in the local config, except
    * for variables overriden by the local config.
    *
    * 

    ## Example using dot notation

    globalConfig = {
        paths.assets.input: '_assets',
        buildDir: www/
    }

    localConfig = {
        buildDir: ./dist
    }

    # Will become:

    localConfig = {
        paths.assets.input: '_assets',
        buildDir: ./dist
    }

    *
    * @param {String} sitePath The path to the root directory of the website
    * @return {Object} The config object
    */
    parseConfig: function (sitePath) {
        var globalConfig = this.parseGlobalConfig()
        sitePath = path.resolve(sitePath)

        if (!fs.existsSync(path.join(sitePath, globalConfig.configFile))) {
            throw new Error('No ' + globalConfig.configFile + ' file at path: ' + sitePath)
        }

        var configStr   = fs.readFileSync(path.join(sitePath, globalConfig.configFile), { encoding: 'utf-8' })
        var config      = require('yamljs').parse(configStr)
        config.sitePath = sitePath

        // merge the global into the local config
        // if a global prop is overriden in local, don't merge the prop
        helpers.enumerateProperties(globalConfig, function (path) {
            var localProperty  = helpers.pathToProperty(config, path)
            var globalProperty = helpers.pathToProperty(globalConfig, path)
            if (localProperty === undefined) {
                helpers.setAtPath(config, path, globalProperty)
            }
        })

        // if buildDir is not absolute, get the relative path from sitePath
        var firstChar = config.paths.buildDir.charAt(0)
        if (firstChar !== path.sep && firstChar !== 'C:\\') {
            config.paths.buildDir = path.resolve(path.join(sitePath, config.paths.buildDir))
        }

        // finally, make all non-absolute paths relative to sitePath
        helpers.enumerateProperties(config.paths, function (prop) {
            var firstChar = helpers.pathToProperty(config.paths, prop).charAt(0);
            if (firstChar !== path.sep && firstChar !== 'C:\\') {
                if (prop.match(/\.output$/)) {
                    helpers.setAtPath(config.paths, prop, path.join(config.paths.buildDir, helpers.pathToProperty(config.paths, prop)))
                } else {
                    var propPath = path.join(config.sitePath, helpers.pathToProperty(config.paths, prop))
                    helpers.setAtPath(config.paths, prop, propPath)
                    if (!fs.existsSync(propPath)) {
                        throw new Error('Missing input directory: ' + propPath + ' for property: ' + prop)
                    }
                }
            }
        })
        
        return config
    },

    /**
    * Extract the metadatas from a given markdown file
    *
    * Example:
    * =
    * title: My Article
    * =
    * Outputs: { title: "My Article" }
    *
    *
    * @param {String} file The path to the file from which to extract metadatas
    * @return {Object} The plain metadatas extracted from the file
    */
    getMetadatas: function (file) {
        var data    = fs.readFileSync(file, { encoding: 'utf-8' })
        var metaStr = data.match(/^=([\s\S]+?)=([\s\S]*)/)

        if (!metaStr) {
            throw new Error('Could not find metadatas for file: ' + file)
        } else {
            var metadatas      = require('yamljs').parse(metaStr[1])
            metadatas.content  = metaStr[2]
            metadatas.filename = path.basename(file)
        }
        return metadatas
    },

    /**
    * Extract plain metadatas from a given markdown file and parse them
    * 
    * @param {String} file The path to the file from which to parse metadatas
    * @return {Object} The parsed metadatas
    */
    parseMetadatas: function (file) {
        var metadatas   = this.getMetadatas(file)
        var parsedMetas = {
            plainmetas : metadatas
            , filename   : metadatas.filename
            , slug       : metadatas.slug
            , layout     : metadatas.layout
            , toJade     : {
                title   : metadatas.title || helpers.normalizeFilenameAsTitle(metadatas.filename)
                , content : helpers.trim(metadatas.content)
            }
        }

        if (!parsedMetas.slug || !/^[a-z0-9-]+$/.test(parsedMetas.slug)) {
            throw new Error('Provided slug is missing or invalid in: \'' + metadatas.filename + '\'')
        }

        return parsedMetas
    },

    /**
    * Extract plain metadatas from a given blog post markdown file and parse them
    *
    * @param {String} file The path to the file from which to parse metadatas
    * @param {Object} config The website config object
    * @return {Object} The parsed metadatas for a given blog post
    */
    parsePostMetadatas: function (file, config) {
        var moment      = require('moment')
        var parsedMetas = this.parseMetadatas(file)
        var plainMetas  = parsedMetas.plainmetas

        if (!helpers.isValidDate(new Date(plainMetas.date))) {
            throw new Error('Invalid or missing date in metadatas for post: '.white + plainMetas.filename)
        }
        if (!plainMetas.title) {
            throw new Error('No title provided in metadatas for post: '.white + plainMetas.filename)
        }

        parsedMetas.toJade.author = parsedMetas.plainmetas.author || config.owner
        parsedMetas.toJade.date   = moment(new Date(plainMetas.date)).format(config.dateFormat)
        parsedMetas.toJade.link   = path.join('/', path.basename(config.paths.posts.output), parsedMetas.slug + '.html')
        
        return parsedMetas
    }
}