var assert = require('assert')
, parse    = require('../bin/lib/parsing.js')
, lib      = require('../bin/lib/lib.js')

describe('Parsing', function () {
    var config          = lib.parseConfig('test/test_site')
    , testFiles         = config.sitePath + '/pages/'
    , rightFormatFile   = testFiles + 'test_page_right_format.md'
    , noTitleFile       = testFiles + 'test_page_no_title.md'
    , wrongFormatFile   = testFiles + 'test_page_wrong_format.md'
    , wrongLayoutFile   = testFiles + 'test_page_wrong_layout.md'
    , wrongSlugFile     = testFiles + 'test_page_wrong_slug.md'
    , noContentFile     = testFiles + 'test_page_no_content.md'
    , wrongDatePostFile = testFiles + 'test_post_wrong_date.md'
    , noTitlePostFile   = testFiles + 'test_post_no_title.md'
    , noContentPostFile = testFiles + 'test_post_no_content.md'
    , rightBlogPostFile = config.sitePath + '/posts/2013-12-01_its-snowing-today.md'

    describe('#getMetadatas()', function () {
        it('should return an Object', function () {
            var metas = parse.getMetadatas(rightFormatFile)
            assert(metas instanceof Object)
        })
        it('should contain an Object with the required properties for a well formatted file', function () {
            var metas = parse.getMetadatas(rightFormatFile)
            assert(metas.layout)
            assert(metas.title)
            assert(metas.slug)
            assert(metas.content)
            assert(metas.filename)
            assert(metas.dirpath)
        })
        it('should throw an error when passing a bad formatted file', function () {
            assert.throws(function (){ parse.getMetadatas(wrongFormatFile) }, Error)
        })
    })

    describe('#fetchBlogPosts()', function () {
        it('should return an Array', function () {
            var posts = parse.fetchBlogPosts(config)
            assert(posts instanceof Array)
        })
        it('should return an Array with blog posts containing all required properties', function () {
            var posts = parse.fetchBlogPosts(config)
            for (var i = posts.length - 1; i >= 0; i--) {
                assert(posts[i].date)
                assert(posts[i].author)
                assert(posts[i].link)
            }  
        })
    })

    describe('#parsePostMetadatas()', function () {
        it('should return an Object', function () {
            var postmetas = parse.parsePostMetadatas(parse.getMetadatas(rightBlogPostFile), config)
            assert(postmetas instanceof Object)
        })
        it('should return the required supplementary properties for a well formatted blog post', function () {
            var postmetas = parse.parsePostMetadatas(parse.getMetadatas(rightBlogPostFile), config)
            assert(postmetas.date)
            assert(postmetas.author)
            assert(postmetas.link)
        })
        it('using [#cutHeadTailLinebreaks()] should not contain line breaks at beginning or end of \`content\` property', function () {
            var metas = parse.getMetadatas(rightBlogPostFile)
            metas.isBlogPost = true
            var postmetas = parse.parsePostMetadatas(metas, config)
            assert.equal(false, /^[\n]+|[\n]+$/.test(postmetas.content))
        })
        it('should return owner name if no author is specified in metadatas', function () {
            var metas = parse.getMetadatas(rightBlogPostFile)
            metas.isBlogPost = true
            var postmetas = parse.parsePostMetadatas(metas, config)
            assert.equal(config.owner.name, postmetas.author)
        })
        it('should throw an error if blog post is missing or has invalid date value', function () {
            var postmetas = parse.getMetadatas(wrongDatePostFile)
            postmetas.isBlogPost = true
            assert.throws(function () { parse.parsePostMetadatas(postmetas, config) }, /date/)
        })
        it('should throw an error if blog post is missing title value', function () {
            var postmetas = parse.getMetadatas(noTitlePostFile)
            postmetas.isBlogPost = true
            assert.throws(function () { parse.parsePostMetadatas(postmetas, config) }, /title/)
        })
        it('should throw an error if blog post is missing content value', function () {
            var postmetas = parse.getMetadatas(noContentPostFile)
            postmetas.isBlogPost = true
            assert.throws(function () { parse.parsePostMetadatas(postmetas, config) }, /content/)
        })
    })

    describe('#parseMetadatas()', function () {
        it('should return an Object', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile), config)
            assert(metas instanceof Object)
        })
        it('should return the required properties for well formatted standard pages', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile), config)
            assert(metas.layoutPath)
            assert(metas.slug)
            assert(metas.toJade.title)
            assert(metas.toJade.content)
            // TOTO: handle incorrect metadatas as parameter
        })
        it('using [#normalizeFilenameAsTitle()] should normalize the filename if no title is provided', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(noTitleFile), config)
            assert.equal('Test Page No Title',  metas.toJade.title)
        })
        it('using [#cutHeadTailLinebreaks()] should not contain line breaks at beginning or end of \`content\` property', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile), config)
            assert.equal(false, /^[\n]+|[\n]+$/.test(metas.toJade.content))
        })
        it('using [#parsePostMetadatas()] should return required properties for blog post', function () {
            var metas = parse.getMetadatas(rightBlogPostFile)
            metas.isBlogPost = true
            var postmetas = parse.parseMetadatas(metas, config)
            assert(postmetas.slug)
            assert(postmetas.layoutPath)
            assert(postmetas.toJade.date)
            assert(postmetas.toJade.author)
            assert(postmetas.toJade.title)
            assert(postmetas.toJade.content)
        })
        it('should not throw an error if no content is provided', function () {
            var metas = parse.getMetadatas(noContentFile)
            assert.doesNotThrow(function (){ parse.parseMetadatas(metas, config) })
        })
        it('should throw an error if slug is not valid', function () {
            var metas = parse.getMetadatas(wrongSlugFile)
            assert.throws(function (){ parse.parseMetadatas(metas, config) }, /slug/)
        })
        it('should throw an error if layout file does not exist', function () {
            var metas = parse.getMetadatas(wrongLayoutFile)
            assert.throws(function (){ parse.parseMetadatas(metas, config) }, /jade/)
        })
    })
})