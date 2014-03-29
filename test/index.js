var assert = require('assert')
var path   = require('path')
var fs     = require('fs')
var fse    = require('fs-extra')

var cli = require('../lib')

describe('cli.js', function () {

  describe('#success()', function () {
    it.skip('should contain a success checkmark in the first char', function () {
      console.log(cli.log.success('Test'))
      assert.equal(cli.log.success('Test'), '✔ Test')
    })
  })

  describe('#error()', function () {
    it.skip('should contain a failure checkmark in the first char', function () {
      assert.equal(cli.log.error('Test'), '✘ Test')
    })
  })

  describe('#pathFromArgument()', function () {
    it('should return the resolved path if the parameter is not null', function () {
      assert.equal(cli.pathFromArgument('./test'), __dirname)
    })
    it('should return the current directory if the parameter is null', function () {
      assert.equal(cli.pathFromArgument(null), path.resolve('.'))
    })
  })

  describe('#configFromArgument()', function () {
    it('should return a config object in callback when a config file is present', function () {
      assert(cli.configFromArgument(__dirname + '/test-sites/build-dir') instanceof Object);
    })
    it('should throw an error if no config file at given path', function () {
      assert.throws(function(){ cli.configFromArgument(__dirname + '/test-sites/errors/no-config') }, /No config.yml file/)
    })
  })

  describe('#buildFromRawArgs()', function () {
    var sitePath = ''

    it('should build a website', function (done) {
      cli.buildFromArgument('test/test-sites/no-build-dir', function (err, siteConfig) {
        sitePath = siteConfig.paths.buildDir
      assert(fs.existsSync(sitePath), 'Website not compiled from argument')
      done()
      })
    })

    after(function (done) {
      fse.remove(sitePath, function (err) {
        assert.ifError(err)
        done()
      })
    })
  })

})
