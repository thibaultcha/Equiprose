var fs   = require('fs')
var fse  = require('fs-extra')
var path = require('path')
var glob = require('glob')

var jade   = require('jade')
var stylus = require('stylus')
var marked = require('marked')
var emoji  = require('emoji-images')
var pygmentize = require('pygmentize-bundled')

var parse   = require('./parsing')
var helpers = require('./helpers')

var markedOpts = {
  gfm: true,
  highlight: function (code, lang, callback) {
    pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
      if (err) return callback(err)
      callback(null, result.toString())
    })
  },
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: ''
}

module.exports = {
  compileStylusFile: function (stylusfile, buildDir, compress, callback) {
    if (arguments.length === 3) {
      callback = compress
      compress = true
    }
    var cssFilePath = path.join(buildDir, path.basename(stylusfile).replace(/\.styl$/, '.css'))

    fs.readFile(stylusfile, { encoding: 'utf-8' }, function (err, data) {
      if (err) return callback(err)
      stylus(data)
        .set('compress', compress)
        .set('paths', [path.dirname(stylusfile)])
        .render(function (err, css) {
          if (err) return callback(err)
          fs.exists(buildDir, function (exists) {
            if (!exists) {
              fse.mkdirsSync(buildDir)
            }
            fs.writeFile(cssFilePath, css, function (err) {
              if (err) return callback(err)
              return callback()
            })
          })
        })
    })
  },

  /**
  * Compile a given markdown file into an HTML file, assuming the `layout`
  * property from its metadatas leads to an existing Jade file
  *
  * @param {String} layoutsDir The path to the directory containing the Jade files
  * @param {Object} options
  * @param {Boolean} compress Defines the Jade options.pretty parameter
  * @param {Function} callback The function callback
  * @return {Function} callback(err, html, options)
  */
  renderJade: function (layoutsDir, options, compress, callback) {
    if (arguments.length === 3) {
      callback = compress
      compress = true
    }

    options.pretty = !compress

    glob(layoutsDir + '/**/' + options.layout + '.jade', { sync: true, nosort: true }, function (err, files) {
      if (err) return callback(err)
      if (files.length === 0) {
        return callback(new Error("No jade file for asked layout: '" + options.layout + "'"))
      }
      else if (files.length > 1) {
        return callback(new Error("Multiple jade files for asked layout: '" + options.layout + "'"))
      }
      else {
        jade.renderFile(files[0], options, function (err, html) {
          if (err) return callback(err)
          return callback(null, html, options)
        })
      }
    })
  },

  /**
  * Write an HTML file from a markdown file with metadatas in the given buildDir
  * This function uses renderJade() to fetch the jade templating file from
  * the layoutsDir joined with the layout property in the markdown metadatas.
  *
  * ## Example ##
  * A markdown file _pages/index.md with those metadatas:
  * =
  * layout: page
  * title: Home
  * slug: index
  * =
  * Will be rendered in buildDir/index.html using the jade template layoutsDir/page.jade
  *
  * @param {String} mdfile The path to the markdown file to render
  * @param {Object} config The website config object
  * @param {Array} posts An array containing the blog blog post to be passed as a variable to Jade
  * @param {Function} callback The callback function
  *
  * ## Optional ##
  * @param {Object} postMetas Metadatas from a postfile. If set, the method will know it is called to compile a post file
  *
  * @return {Function} callback(err, htmlFilePath, html, options)
  */
  compileMarkdownToFile: function (mdfile, config, posts, postMetas, callback) {
    var filemetas = {}
    var htmlFilePath = ''
    var self = this

    if (arguments.length === 4) {
      callback  = postMetas
      filemetas = parse.parseMetadatas(mdfile)
      // let's retrieve the path with pages.input as root
      // so if the page is at ../_pages/nested/index.html
      // we will retrieve a path /nested/index.html
      // so we'll write the file in buildDir/nested/index.html
      var regex = new RegExp("^[\\s\\S]*\/_pages\/([\\s\\S]*)")
      var pathFromPagesInput = mdfile.match(regex)
      htmlFilePath = path.join(config.paths.buildDir, path.dirname(pathFromPagesInput ? pathFromPagesInput[1] : ''), filemetas.slug + '.html')
    }
    else {
      // we are compiling a blog post
      filemetas    = postMetas
      htmlFilePath = path.join(config.paths.posts.output, filemetas.slug + '.html')
    }

    var postsToJade = []
    posts.forEach(function (post) {
      postsToJade.push(post.toJade)
    })

    marked(filemetas.toJade.content, markedOpts, function (err, content) {
      if (err) return callback(err)

      var options = {
        layout  : filemetas.layout,
        content : content.replace('\n', ''),
        config  : config.toJade,
        metas   : filemetas.toJade,
        posts   : postsToJade
      }

      self.renderJade(config.paths.templateDir, options, config.compress, function (err, html, jadeOptions) {
        if (err) return callback(err)
        fse.mkdirp(path.dirname(htmlFilePath), function (err) {
          if (err) return callback(err)
          fs.writeFile(htmlFilePath
           , emoji(html, config.emojisURL, 17)
           , { encoding: 'utf-8' }
           , function (err) {
            if (err) return callback(err)
            callback(null, htmlFilePath, html, jadeOptions)
          })
        })
      })
    })
  }
}
