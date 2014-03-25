var assert = require('assert')
var path = require('path')

var cli = require('../lib')

describe('cli.js', function () {

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
      cli.configFromArgument(__dirname + '/test-sites/build-dir', function (config) {
        assert(config instanceof Object)
      })
    })
    it('should throw an error if no config file at given path', function () {
      assert.throws(function(){ cli.configFromArgument(__dirname + '/test-sites/errors/no-config') }, /No config.yml file/)
    })
  })

})
