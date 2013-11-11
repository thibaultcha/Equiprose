var fs    = require('fs')
, path    = require('path')
, helpers = require('./helpers.js')
, colors  = require('colors')

var parseGlobalConfig = function () {
    var data = fs.readFileSync(path.join(__dirname, 'global_config.yml'), { encoding: 'utf-8'})
    , globalConfig = require('yamljs').parse(data)

    return globalConfig
}
exports.parseGlobalConfig = parseGlobalConfig

exports.parseConfig = function (sitePath) {
    var globalConfig = parseGlobalConfig()

    if (!fs.existsSync(path.join(sitePath, globalConfig.configFile))) throw new Error('No ' + globalConfig.configFile + ' file at path: ' + sitePath)
    
    var configStr   = fs.readFileSync(path.join(sitePath, globalConfig.configFile), { encoding: 'utf-8' })
    var config      = require('yamljs').parse(configStr)
    config.sitePath = sitePath

    // merge the global into the local config
    // if a global prop is overriden in local, don't merge the prop
    helpers.enumerateProperties(globalConfig, function (path) {
        var localProperty  = helpers.pathToProperty(config, path)
        var globalProperty = helpers.pathToProperty(globalConfig, path)
        if (!localProperty) {
            helpers.setAtPath(config, path, globalProperty)
        }
    })

    // if buildDir is not absolute, get the relative path from sitePath
    var absoluteBuildDir = config.paths.buildDir
    var firstChar = config.paths.buildDir.charAt(0)
    if (firstChar !== path.sep && firstChar !== 'C:\\') {
        absoluteBuildDir = path.join(sitePath, config.paths.buildDir)
    }

    // finally, make all non-absolute paths relative to sitePath
    helpers.enumerateProperties(config.paths, function (prop) {
        var firstChar = helpers.pathToProperty(config.paths, prop).charAt(0)
        if (firstChar !== path.sep && firstChar !== 'C:\\') {
            if (prop.match(/\.output$/))
                helpers.setAtPath(config.paths, prop, path.join(absoluteBuildDir, helpers.pathToProperty(config.paths, prop)))
            else
                helpers.setAtPath(config.paths, prop, path.join(sitePath, helpers.pathToProperty(config.paths, prop)))
        }
    })

    /*
    console.log('\n')
    console.log(config)
    console.log('\n')    
    */
    
    return config
}

var getMetadatas = function (file) {
    var data  = fs.readFileSync(file, { encoding: 'utf-8' })
    , metaStr = data.match(/^=([\s\S]+?)=([\s\S]*)/)

    if (!metaStr) throw new Error('Could not find metadatas for file: '.white + file.red)
    else {
        var metadatas      = require('yamljs').parse(metaStr[1])
        metadatas.content  = metaStr[2]
        metadatas.filename = path.basename(file)
        metadatas.dirpath  = path.dirname(file)
    }
    return metadatas
}
exports.getMetadatas = getMetadatas

var parseMetadatas = function (file) {
    var metadatas = getMetadatas(file)
    , parsedMetas = {
        plainmetas : metadatas,
        filename   : metadatas.filename,
        slug       : metadatas.slug,
        layout     : metadatas.layout,
        toJade     : {
            title   : metadatas.title || helpers.normalizeFilenameAsTitle(metadatas.filename),
            content : helpers.trim(metadatas.content)
        }
    }

    if (!/^[a-z0-9-]+$/.test(parsedMetas.slug)) throw new Error('Provided slug is not valid in: \''.white + metadatas.filename.red + '\''.white)

    return parsedMetas
}
exports.parseMetadatas = parseMetadatas

exports.parsePostMetadatas = function (file, owner, dateFormat) {
    var moment      = require('moment')
    var parsedMetas = parseMetadatas(file)
    var plainMetas  = parsedMetas.plainmetas

    if (!helpers.isValidDate(new Date(plainMetas.date))) throw new Error('Invalid or no date provided in metadatas for post: '.white + plainMetas.filename.red)
    if (!plainMetas.title) throw new Error('No title provided in metadatas for post: '.white + plainMetas.filename.red)
    if (!parsedMetas.toJade.content) throw new Error('No content for post in file: '.white + plainMetas.filename.red)

    parsedMetas.toJade.author = parsedMetas.author || owner
    parsedMetas.toJade.date   = moment(parsedMetas.date).format(dateFormat)
    parsedMetas.toJade.link   = parsedMetas.slug + '.html'
    
    return parsedMetas
}