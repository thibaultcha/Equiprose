var fs      = require('fs');
var path    = require('path');
var helpers = require('./helpers');

module.exports = {
    newPage: function (filename, dir, callback) {
        if (!callback || typeof(callback) !== 'function') {
            callback = function(){};
        }

        var metasTitle = helpers.normalizeFilenameAsTitle(filename);
        var metasSlug  = helpers.slugify(filename);
        var filePath   = path.join(dir, filename + '.md');

        var metasStr   = "=\nlayout: page\ntitle: " + metasTitle + "\nslug: " + metasSlug + "\n=\n";

        fs.exists(filePath, function (exists) {
            if (exists) {
                return callback(new Error("A page named " + filename + " already exists at path " + dir));
            }
            else {
                fs.writeFile(filePath, metasStr, { encoding: 'utf-8' }, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, filePath);
                });
            }
        });
    }
}