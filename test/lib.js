var assert = require('assert')
, lib      = require('../lib/lib.js')

describe('lib.js', function () {

    describe('#capitalize()', function () {
        it('should return a string', function () {
            assert(typeof(lib.capitalize('index')) === 'string')
        })
        it('should capitalize the first letter', function () {
            assert.equal('I', lib.capitalize('index').charAt(0))
        })
    })

    describe('#slugify()', function () {
        it('should return a string', function () {
            assert(typeof(lib.slugify('hello world')) === 'string')
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
        it('should remove all line breaks at the beginning and end of a string', function () {
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

    describe('#isValidDate()', function () {
        var date, wrong

        before(function () {
            date   = new Date('Mon Oct 07 2013 18:26:47 GMT+0200 (CEST)')
            wrong  = new Date('wrong format')
            nodate = 'no_date'
        })

        it('should return a boolean', function () {
            assert(typeof(lib.isValidDate(date)) === 'boolean')
        })
        it('should return true for a correct date', function () {
            assert.equal(true, lib.isValidDate(date))
        })
        it('should return false for an incorrect date', function () {
            assert.equal(false, lib.isValidDate(wrong))
            assert.equal(false, lib.isValidDate(nodate))
        })
    })
})