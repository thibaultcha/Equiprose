var assert = require('assert')
, path     = require('path')
, parse    = require('../lib/parsing.js')
, fs       = require('../lib/files.js')

describe('files.js', function () {
    var sitePath = 'test/test-sites/valid-site'

    describe('#getFiles()', function () {
        var regex = new RegExp(/\.md$/)
        , files

        it('should return an Array', function (done) {
            fs.getFiles(sitePath + '/_pages', regex, function (err, results) {
                assert.ifError(err)
                assert(results instanceof Array)
                files = results
                done()
            })
        })
        it('should only return files matching the specified regex', function () {
            for (var i = files.length - 1; i >= 0; i--)
                assert(regex.test(files[i]))
        })
    })

    describe.skip('#walk()', function () {
        var files

        before(function (done) {
            fs.getFiles(sitePath + '/_pages', new RegExp(/\.md$/), function (err, results) {
                assert.ifError(err)
                files = results
                done()
            })
        })

        it('should callback each file matching the specified regex', function (done) {
            fs.walk(sitePath + '/_pages', new RegExp(/\.md$/), function (item, idx) {
                assert(/\.md$/.test(item))
                if (idx == files.length - 1) done()
            })
        })
    })
})