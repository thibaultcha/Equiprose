var assert = require('assert')
, config   = require('../config.json')

describe('Parsing', function () {
    var parse = require('../engine/lib/parsing.js')
    var metadatas

    describe('#getMetadatas()', function () {
        it('should return an Object', function (done) {
            parse.getMetadatas('test/test_correct.md', function (err, metas) {
                assert(metas instanceof Object)
                metadatas = metas
                done()
            })
        })
        it('should contain an Object with the required properties', function (done) {
            parse.getMetadatas('test/test_correct.md', function (err, metas) {
                assert(metas.layout)
                assert(metas.title)
                assert(metas.slug)
                assert(metas.content)
                done()
            })
        })
        it('should throw an error when passing a bad formatted file', function (done) {
            assert.throws(parse.getMetadatas('test/test_incorrect.md'))
            done()
        })
    })

    describe('#parseMetadatas()', function () {
        it('should return an Object', function (done) {
            parse.parseMetadatas(metadatas, function (metas) {
                assert(metas instanceof Object)
                done()
            })
        })
        it.skip('should return the required properties for any type of page', function (done) {
            parse.parseMetadatas(metadatas)
            done()
        })
    })
})