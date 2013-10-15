var assert = require('assert')
, path     = require('path')
, lib      = require('../lib/lib.js')
, fs       = require('../lib/files.js')

describe('files.js', function () {
    var config = lib.parseConfig('test/test_site')

    describe('#getFiles()', function () {
        var regex = new RegExp(/\.md$/)
        , files

        it('should return an Array', function (done) {
            fs.getFiles(config.sitePath + '/_pages', regex, function (err, results) {
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

    describe('#walk()', function () {
        var files

        before(function (done) {
            fs.getFiles(config.sitePath + '/_pages', new RegExp(/\.md$/), function (err, results) {
                assert.ifError(err)
                files = results
                done()
            })
        })

        it('should callback each file matching the specified regex', function (done) {
            fs.walk(config.sitePath + '/_pages', new RegExp(/\.md$/), function (item, idx) {
                assert(/\.md$/.test(item))
                if (idx == files.length - 1) done()
            })
        })
    })

    describe('#rmrf()', function () {
        var pathDir, pathBase

        before(function (done) {
            pathDir  = path.join(config.sitePath, 'rmdir', 'recur')
            pathBase = pathDir.substring(0, pathDir.lastIndexOf("/"))
            
            fs.mkdir(path.join(pathBase), function (err) {
                assert.ifError(err)
                fs.mkdir(pathDir, function (err) {
                    assert.ifError(err)
                    done()
                })
            })
        })

        it('should delete a non empty directory recursively', function (done) {
            fs.rmrf(pathBase, function () {
                assert.equal(false, fs.existsSync(pathDir))
                done()
            })
        })

        after(function (done) {
            if (fs.existsSync(pathBase)) {
                fs.rmrf(pathBase, function () {
                    done()
                })
            }
            else {
                done()
            }
        })
    })

    describe('#mkdirp()', function () {
        var pathDir, pathBase

        before(function (done) {
            pathDir  = path.join(config.sitePath, 'mkdir', 'recur')
            pathBase = pathDir.substring(0, pathDir.lastIndexOf("/"))
            fs.mkdirp(pathDir, 0777, function (err) {
                assert.ifError(err)
                done()
            })
        })

        it('should create directories recursively', function () {
            assert(fs.existsSync(pathDir))
        })

        after(function (done) {
            if (fs.existsSync(pathBase)) {
                fs.rmrf(pathBase, function () {
                    done()
                })
            }
            else {
                done()
            }
        })
    })
})