var assert = require('assert')
, path     = require('path')
, parse    = require('../lib/parsing.js')

describe('parsing.js', function () {
    var testFiles       = 'test/test-files'

    var pageRightFormat = path.join(testFiles, 'page.md')
    , pageNoTitle       = path.join(testFiles, 'errors', 'page-no-title.md')
    , pageNoMetas       = path.join(testFiles, 'errors', 'page-no-meta.md')
  //, wrongLayoutFile   = path.join(testFiles, 'errors', 'page-wrong-layout.md')
    , pageWrongSlug     = path.join(testFiles, 'errors', 'page-wrong-slug.md')
    , pageNoContent     = path.join(testFiles, 'errors', 'page-no-content.md')
    , postWrongDate     = path.join(testFiles, 'errors', 'post-wrong-date.md')

    var postRightFormat = path.join(testFiles, 'post.md')
    , postNoTitle       = path.join(testFiles, 'errors', 'post-no-title.md')
    , postNoContent     = path.join(testFiles, 'errors', 'post-no-content.md')
    , postNoAuthor      = path.join(testFiles, 'errors', 'post-no-author.md')

    describe('#getMetadatas()', function () {
        var metas = parse.getMetadatas(pageRightFormat)

        it('should return an Object', function () {
            assert(metas instanceof Object)
        })
        it('should contain an Object with the required properties for a well formatted file', function () {
            assert(metas.layout)
            assert(metas.title)
            assert(metas.slug)
            assert(metas.content)
            assert(metas.filename)
            assert(metas.dirpath)
        })
        it('should throw an error when passing a bad formatted file', function () {
            assert.throws(function (){ parse.getMetadatas(pageNoMetas) }, Error)
        })
    })

    describe('#parsePostMetadatas()', function () {
        var postmetas

        beforeEach(function () {
            postmetas = parse.parsePostMetadatas(postRightFormat, 'Tests', 'DD MMM YYYY')
        })
        
        it('should return an Object', function () {
            assert(postmetas instanceof Object)
        })
        it('should return the required properties for a well formatted blog post', function () {
            assert(postmetas.slug)
            assert(postmetas.layout)
            assert(postmetas.toJade.date)
            assert(postmetas.toJade.author)
            assert(postmetas.toJade.title)
            assert(postmetas.toJade.link)
            assert(postmetas.toJade.content)
        })
        it('should return owner name if no author is specified in metadatas', function () {
            var noAuthorMetas = parse.parsePostMetadatas(postNoAuthor, 'Tests', 'DD MMM YYYY')
            assert.equal('Tests', postmetas.toJade.author)
        })
        it('should throw an error if blog post is missing or has invalid date value', function () {
            assert.throws(function () { parse.parsePostMetadatas(postWrongDate, 'Tests', 'DD MMM YYYY') }, /date/)
        })
        it('should throw an error if blog post is missing title value', function () {
            assert.throws(function () { parse.parsePostMetadatas(postNoTitle, 'Tests', 'DD MMM YYYY') }, /title/)
        })
        it('should throw an error if blog post is missing content value', function () {
            assert.throws(function () { parse.parsePostMetadatas(postNoContent, 'Tests', 'DD MMM YYYY') }, /content/)
        })
    })

    describe('#parseMetadatas()', function () {
        var metas = parse.parseMetadatas(pageRightFormat)

        it('should return an Object', function () {
            assert(metas instanceof Object)
        })
        it('should return the required properties for well formatted standard pages', function () {
            assert(metas.filename)
            assert(metas.layout)
            assert(metas.slug)
            assert(metas.toJade.title)
            assert(metas.toJade.content)
        })
        it('should normalize the filename if no title is provided', function () {
            var metas = parse.parseMetadatas(pageNoTitle)
            assert.equal('Page No Title',  metas.toJade.title)
        })
        it('should not contain line breaks at beginning or end of \`content\` property', function () {
            assert.equal(false, /^[\n]+|[\n]+$/.test(metas.toJade.content))
        })
        it('should not throw an error if no content is provided', function () {
            assert.doesNotThrow(function (){ parse.parseMetadatas(pageNoContent) })
        })
        it('should throw an error if slug is not valid', function () {
            assert.throws(function (){ parse.parseMetadatas(pageWrongSlug) }, /slug/)
        })
        it.skip('should throw an error if layout file does not exist', function () {
            assert.throws(function (){ parse.parseMetadatas(wrongLayoutFile) }, /jade/)
        })
    })
})