var assert = require('assert')
, fs       = require('fs')
, helpers  = require('../lib/helpers.js')

describe('helpers.js', function () {

    describe('#capitalize()', function () {
        it('should return a string', function () {
            assert(typeof(helpers.capitalize('index')) === 'string')
        })
        it('should capitalize the first letter', function () {
            assert.equal('I', helpers.capitalize('index').charAt(0))
        })
    })

    describe('#slugify()', function () {
        it('should return a string', function () {
            assert(typeof(helpers.slugify('hello world')) === 'string')
        })
        it('should return a slugified string for any input', function () {
            assert.equal(true, /^[a-z0-9-]+$/.test(helpers.slugify('%Test_#.Slug"!\'è§')))
            assert.equal('hello-world', helpers.slugify('-hello #world--'))
        })
    })

    describe('#cutHeadTailLinebreaks()', function () {
        it('should return a string', function () {
            var str = helpers.cutHeadTailLinebreaks('\n\n\nHello World')
            assert(typeof(str) === 'string')
        })
        it('should remove all line breaks at the beginning and end of a string', function () {
            var str = helpers.cutHeadTailLinebreaks('\n\n\nHello World')
            assert.equal('Hello World', str)
            str = helpers.cutHeadTailLinebreaks('\n\n\nHello\nWorld\n')
            assert.equal('Hello\nWorld', str)
        })
    })

    describe('#normalizeFilenameAsTitle()', function () {
        it('should return a string', function () {
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

    describe('#getFiles()', function () {
        var regex = new RegExp(/\.md$/)
        var testPath = 'test/test-sites/valid-site/_pages'
        , files

        it('should return an Array', function (done) {
            helpers.getFiles(testPath, regex, function (err, results) {
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
        it('should only return valid file paths', function () {
            for (var i = files.length - 1; i >= 0; i--)
                assert(fs.existsSync(files[i]))
        })
    })

    describe.skip('#walk()', function () {
        var files
        var testPath = 'test/test-sites/valid-site/_pages'

        before(function (done) {
            helpers.getFiles(testPath, new RegExp(/\.md$/), function (err, results) {
                assert.ifError(err)
                files = results
                done()
            })
        })

        it('should callback each file matching the specified regex', function (done) {
            helpers.walk('test/test-sites/valid-site', new RegExp(/\.md$/), function (err, item, idx) {
                assert.ifError(err)
                console.log(idx +'___'+ item)
                //assert(/\.md$/.test(item))
                if (idx == files.length - 1)
                    done()
            })
        })
    })
})