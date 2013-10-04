var fs   = require('fs')
, colors = require('colors')

var getMetadatas = function (file, callback) {
    fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {
        if (err) throw err
        var metaStr = data.match(/^```meta([\s\S]+?)```([\s\S]*)/)
        if (!metaStr) 
            throw new Error('✘'.red + '.... Could not find metadatas for file: ' + file.red)
        if (metaStr) {
            var metadata     = JSON.parse(metaStr[1])
            metadata.content = metaStr[2]
        }
        if (callback && typeof(callback) === 'function')
            callback(err, metadata)
    })
}

var parseMetadatas = function (metadatas, callback) {
    var parsedMetas = {}

    if (callback && typeof(callback) === 'function')
        callback(parsedMetas)
}

module.exports.getMetadatas   = getMetadatas
module.exports.parseMetadatas = parseMetadatas