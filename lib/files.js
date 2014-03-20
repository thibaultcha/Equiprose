var fs      = require('fs');
var fse     = require('fs-extra');
var path    = require('path');
var moment  = require('moment');
var helpers = require('./helpers');

module.exports = {
  newPage: function (filename, dir, callback) {
    var metasTitle = helpers.normalizeFilenameAsTitle(filename)
    var metasSlug  = helpers.slugify(filename)
    var filePath   = path.join(dir, filename.replace(/\.[^.]*$/, '') + '.md')

    var metasStr   = "=\nlayout: page\ntitle: " + metasTitle + "\nslug: " + metasSlug + "\n=\n"

    fs.exists(filePath, function (exists) {
      if (exists) {
        return callback(new Error("A page named " + filename + " already exists at path " + dir))
      }
      else {
        fse.mkdirp(dir, function (err) {
          if (err) return callback(err)
          fs.writeFile(filePath, metasStr, { encoding: 'utf-8' }, function (err) {
            if (err) return callback(err)
            callback(null, filePath)
          })
        })
      }
    })
  },

  newPost: function (postTitle, postAuthor, dir, callback) {
    postTitle        = helpers.trim(postTitle)
    postAuthor       = helpers.trim(postAuthor)
    var postDate     = new Date()
    var postSlug     = helpers.slugify(postTitle)
    var postFilename = moment(postDate).format('YYYY-MM-DD') + '_' + postSlug + '.md'
    var filePath     = path.join(dir, postFilename)

    var metasStr = "=\nlayout: post\ntitle: " + postTitle + "\nauthor: " + postAuthor + "\nslug: " + postSlug + "\ndate: " + postDate.toString() + "\n=\n"

    fs.writeFile(filePath, metasStr, { encoding: 'utf-8' }, function (err) {
      if (err) return callback(err)
      callback(null, filePath)
    })
  }
}
