var assert  = require('assert')
var fs      = require('fs')
var helpers = require('../lib/helpers')

describe('helpers.js', function () {

    describe('#capitalize()', function () {
        it('should return a String', function () {
            assert(typeof(helpers.capitalize('index')) === 'string')
        })
        it('should capitalize the first letter of a String', function () {
            assert.equal('I', helpers.capitalize('index').charAt(0))
        })
    })

    describe('#slugify()', function () {
        it('should return a String', function () {
            assert(typeof(helpers.slugify('hello world')) === 'string')
        })
        it('should return a slugified String for any input', function () {
            assert.equal(true, /^[a-z0-9-]+$/.test(helpers.slugify('%Test_#.Slug"!\'è§')))
            assert.equal('hello-world', helpers.slugify('-hello #world--'))
        })
    })

    describe('#trim()', function () {
        it('should return a String', function () {
            var str = helpers.trim('\n\n\nHello World')
            assert(typeof(str) === 'string')
        })
        it('should remove all line breaks at the beginning and end of a string', function () {
            var str = helpers.trim('\n\n\nHello World')
            assert.equal('Hello World', str)
            str = helpers.trim('\n\n\nHello\nWorld\n')
            assert.equal('Hello\nWorld', str)
        })
    })

    describe('#normalizeFilenameAsTitle()', function () {
        it('should return a String', function () {
            var str = helpers.normalizeFilenameAsTitle('hello_world.md')
            assert(typeof(str) === 'string')
        })
        it('should normalize a file name to be a title', function () {
            var str = helpers.normalizeFilenameAsTitle('hello_world.md')
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
            assert(typeof(helpers.isValidDate(date)) === 'boolean')
        })
        it('should return true for a correct date', function () {
            assert.equal(true, helpers.isValidDate(date))
        })
        it('should return false for an incorrect date', function () {
            assert.equal(false, helpers.isValidDate(wrong))
            assert.equal(false, helpers.isValidDate(nodate))
        })
    })

})
