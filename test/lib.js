var assert = require('assert')
, lib      = require('../bin/lib/lib.js')

describe('Lib', function () {
    var config

    before(function () {
        config = lib.parseConfig('test/test_site')
    })

    describe('#parseConfig()', function () {
        it('should return an object', function () {
            var config = lib.parseConfig('test/test_site')
            assert(config instanceof Object)
        })
        it('should contain the site path', function () {
            var config = lib.parseConfig('test/test_site')
            assert(config.sitePath)
        })
        it('should throw an error when no config.yml file is found', function () {
            assert.throws(function () { lib.parseConfig('falsepath') }, /No config.yml file/)
        })
    })

    describe('#getFiles()', function () {
        var regex, res

        before(function () {
            regex = new RegExp(/\.md$/)
            res   = []
        })

        it('should return an Array', function (done) {
            lib.getFiles(config.sitePath + '/pages', regex, function (err, results) {
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

    describe('#walk()', function () {
        var files

        before(function (done) {
            lib.getFiles(config.sitePath + '/pages', new RegExp(/\.md$/), function (err, results) {
                assert.ifError(err)
                files = results
                done()
            })
        })

        it('should callback each file matching the specified regex', function (done) {
            lib.walk(config.sitePath + '/pages', new RegExp(/\.md$/), function (item, idx) {
                console.log(item + ' ' + idx)
                assert(/\.md$/.test(item))
                if (idx == files.length - 1) done()
            })
        })
    })

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

    describe('#rmdir()', function () {
        var fs     = require('fs')
        , path     = require('path')
        , config   = lib.parseConfig('test/test_site')
        , pathDir  = path.join(config.sitePath, 'rmdir', 'recur')
        , pathBase = pathDir.substring(0, pathDir.lastIndexOf("/"))

        before(function (done) {
            fs.mkdir(path.join(pathBase), function (err) {
                if (err) throw err
                fs.mkdir(pathDir, function (err) {
                    if (err) throw err
                    done()
                })
            })
        })

        it('should delete a non empty directory recursively', function (done) {
            lib.rmdir(pathBase, function () {
                assert.equal(false, fs.existsSync(pathDir))
                done()
            })
        })

        after(function (done) {
            if (fs.existsSync(pathBase)) {
                lib.rmdir(pathBase, function () {
                    done()
                })
            }
            else {
                done()
            }
        })
    })

    describe('#mkdirp()', function () {
        var fs     = require('fs')
        , path     = require('path')
        , config   = lib.parseConfig('test/test_site')
        , pathDir  = path.join(config.sitePath, 'mkdirp', 'recur')
        , pathBase = pathDir.substring(0, pathDir.lastIndexOf('/'))

        before(function (done) {
            lib.mkdirp(pathDir, 0777, function (err) {
                assert.ifError(err)
                done()
            })
        })

        it('should create directories recursively', function () {
            assert(fs.existsSync(pathDir))
        })

        after(function (done) {
            if (fs.existsSync(pathBase)) {
                lib.rmdir(pathBase, function () {
                    done()
                })
            }
            else {
                done()
            }
        })
    })
})