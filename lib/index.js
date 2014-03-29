var path    = require('path')
var program = require('commander')
var colors  = require('colors')
var watch   = require('node-watch')

var parser  = require('./parsing')
var builder = require('../lib/building')
var serve   = require('../lib/serve')
var files   = require('../lib/files')

var pjson   = require('../package.json')

var CLI = {

 logger: {
    log: function log (msg) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(msg)
      }
      else {
        return msg
      }
    },

    success: function log_success (msg) {
      this.log('✔ '.green + msg)
    },

    error: function log_error (msg) {
      this.log('✘ '.red + msg)
    }
  },

  pathFromArgument: function path_from_arg (arg) {
    return path.resolve(arg ? arg : '.')
  },

  configFromArgument: function config_from_arg (arg) {
    var path = this.pathFromArgument(arg)
    return parser.parseConfig(path)
  },

  buildFromPath: function build_from_path (path, callback) {
    if (typeof callback !== 'function') callback = function(){}
    var siteConfig = this.configFromArgument(path)

    CLI.logger.log('Compiling website using config: ' + siteConfig.sitePath +'/config.yml')
    CLI.logger.log('    pages: ' + siteConfig.paths.pages.input)
    CLI.logger.log('    posts: ' + siteConfig.paths.posts.input)
    CLI.logger.log('   assets: ' + siteConfig.paths.assets.input)
    CLI.logger.log(' template: ' + siteConfig.paths.templateDir)

    builder.buildSite(siteConfig, function (err, websitePath) {
      if (err) return callback(err)
      CLI.logger.success('Compiled website at path: ' + websitePath.underline)
      callback(null, siteConfig)
    })
  },

  build: function build_from_cli () {
    CLI.buildFromPath(process.argv[3])
  },

  serve: function serve_from_cli () {
     // we have to handle `$ equiprose serve ~/Desktop` and `$ equiprose serve -p 1234`
    var pathArg = process.argv[3] !== '-p' ? process.argv[3] : '.'

    CLI.buildFromPath(pathArg, function (err, siteConfig) {
      if (err) throw err
      CLI.logger.log('Starting webserver for website at path: ' + siteConfig.paths.buildDir)
      serve(siteConfig, program.port || 8888, function (address) {
        CLI.logger.success('Server running on ' + address.underline)
        watch([siteConfig.paths.templateDir,
              siteConfig.paths.posts.input,
              siteConfig.paths.pages.input,
              siteConfig.paths.assets.input],
          function (file) {
            CLI.logger.log('Rebuilding because of file: ' + file)
            CLI.buildFromArgument(pathArg)
        })
      })
    })
  },

  create: function create_from_cli () {
    var path = CLI.pathFromArgument(process.argv[3])

    builder.newWebsite(path, function (err, path) {
      if (err) throw err
      CLI.logger.success('New website created at path: ' + path.underline)
    })
  },

  file: function file_from_cli () {
    var type = process.argv[3]
    var siteConfig = CLI.configFromArgument(process.argv[4])

    var readline = require('readline').createInterface({ input: process.stdin, output: process.stdout })

    switch (type) {
      case 'post':
        readline.question('Post title: ', function (title) {
          readline.question('Post author: ', function (author) {

            files.newPost(title, author, siteConfig.paths.posts.input, function (err, postPath) {
              if (err) throw err
              CLI.logger.success('New post created at path: ' + postPath.underline)
            })

            readline.close()
          })
        })
        break;
      case 'page':
        readline.question('Path to new page from \'' + siteConfig.paths.pages.input + '\': ', function (pagePath) {
          pagePath = path.join(siteConfig.paths.pages.input, path.dirname(pagePath), path.basename(pagePath))

          files.newPage(path.basename(pagePath), path.dirname(pagePath), function (err, pagePath) {
            if (err) throw err
            CLI.logger.success('New page created at path: ' + pagePath.underline)
          })

          readline.close()
        })
        break;
      default:
        throw new Error('Invalid argument: ' + type +
                        '\n  Usage: equiprose new <page|post> [path]')
        break;
    }
  },

  about: function about () {
    var str = '\n'
    str+= '\
      _____            _ \n\
     | ____|__ _ _   _(_)_ __  _ __ ___  ___  ___     \n\
     |  _| / _` | | | | | \'_ \\| \'__/ _ \\/ __|/ _ \\ \n\
     | |__| (_| | |_| | | |_) | | | (_) \\__ \\  __/  \n\
     |_____\\__, |\\__,_|_| .__/|_|  \\___/|___/\\___|\n\
              |_|       |_|   \n'.rainbow
    str += '\n'
    str += '\n  A static website and blog generator in Node.js'.italic
    str += '\n'
    str += '\n  version: ' + pjson.version
    str += '\n   author: ' + pjson.author.name + ' <' + pjson.author.email + '>'
    str += '\n   GitHub: ' + pjson.repository.url
    str += '\n'

    CLI.logger.log(str)
  }
}

module.exports = CLI
