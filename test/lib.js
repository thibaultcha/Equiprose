var assert = require('assert')
, config   = require('../config.json')
, lib      = require('../engine/lib/lib.js')

describe('Lib', function () {
    describe('#walk()', function () {
        var regex = new RegExp(/\.md$/)
        var res
        it('should return an Array', function (done) {
            lib.walk(config.content_dir, regex, function (err, results) {
                assert.ifError(err)
                assert(results instanceof Array)
                res = results
                done()
            })
        })
        it('should only return files matching the specified regex', function () {
            for (var i = res.length - 1; i >= 0; i--)
                assert(regex.test(res[i]))
        })
    })

    describe('#capitalize()', function () {
        var str = 'index'
        it('should return a string', function () {
            str = lib.capitalize('index')
            assert(typeof str == 'string' || str instanceof String)
        })
        it('should capitalize the first letter', function () {
            assert.equal('I', lib.capitalize(str).charAt(0))
        })
    })
})