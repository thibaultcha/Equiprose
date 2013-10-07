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
        it('should return a string', function () {
            var str = lib.capitalize('index')
            assert(typeof str === 'string')
        })
        it('should capitalize the first letter', function () {
            assert.equal('I', lib.capitalize('index').charAt(0))
        })
    })

    describe('#slugify()', function () {
        it('should return a string', function () {
            var str = lib.slugify('hello world')
            assert(typeof str === 'string')
        })
        it('should return a slugified string for any input', function () {
            assert.equal(true, /^[a-z0-9-]+$/.test(lib.slugify('%Test_#.Slug"!\'è§')))
            assert.equal('hello-world', lib.slugify('-hello #world--'))
        })
    })

    describe('#cutHeadTailLinebreaks()', function () {
        it('should return a string', function () {
            var str = lib.cutHeadTailLinebreaks('\n\n\nHello World')
            assert(typeof(str) === 'string')
        })
        it('should remove all line breaks at the beginning of a string', function () {
            var str = lib.cutHeadTailLinebreaks('\n\n\nHello World')
            assert.equal('Hello World', str)
            str = lib.cutHeadTailLinebreaks('\n\n\nHello\nWorld\n')
            assert.equal('Hello\nWorld', str)
        })
    })

    describe('#normalizeFilenameAsTitle()', function () {
        it('should return a string', function () {
            var str = lib.normalizeFilenameAsTitle('hello_world.md')
            assert(typeof(str) === 'string')
        })
        it('should normalize a file name to be a title', function () {
            var str = lib.normalizeFilenameAsTitle('hello_world.md')
            assert.equal('Hello World', str)
        })
    })
})