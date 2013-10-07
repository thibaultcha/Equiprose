var assert = require('assert')
, config   = require('../config.json')
, parse    = require('../engine/lib/parsing.js')

describe('Parsing', function () {
    var testFiles       = 'test/test_files/'
    var rightFormatFile = testFiles + 'test_page_right_format.md'
    , noTitleFile       = testFiles + 'test_page_no_title.md'
    , wrongFormatFile   = testFiles + 'test_page_wrong_format.md'
    , wrongLayoutFile   = testFiles + 'test_page_wrong_layout.md'
    , wrongSlugFile     = testFiles + 'test_page_wrong_slug.md'
    , noContentFile     = testFiles + 'test_page_no_content.md'
    , wrongDatePostFile = testFiles + 'test_post_wrong_date.md'
    , blogPath          = testFiles + 'blog/'
    , blogIndexFile     = blogPath + 'test_blog_index.md'
    , rightBlogPostFile = blogPath + '2013-12-01_its-snowing-today.md'

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
            var posts = parse.fetchBlogPosts(blogPath)
            assert(posts instanceof Array)
        })
        it('should fetch all files in given directory with the \'isBlogPost\' property in metadatas', function () {
            var posts = parse.fetchBlogPosts(blogPath)
            assert.equal(2, posts.length)
        })
        it('should only return files with the \'isBlogPost\' property in metadatas', function () {
            var posts = parse.fetchBlogPosts(blogPath)
            for (var i = posts.length - 1; i >= 0; i--)
                assert(posts[i].isBlogPost)
        })
    })

    describe('#parsePostMetadatas()', function () {
        it('should return an Object', function () {
            var postmetas = parse.parsePostMetadatas(parse.getMetadatas(rightBlogPostFile))
            assert(postmetas instanceof Object)
        })
        it('should return the required properties for a well formatted blog post', function () {
            var postmetas = parse.parsePostMetadatas(parse.getMetadatas(rightBlogPostFile))
            assert(postmetas.date)
            assert(postmetas.author)
            assert(postmetas.title)
            assert(postmetas.content)
            assert(postmetas.link)
        })
        it('should not contain line breaks at beginning or end of \`content\` property', function () {
            var postmetas = parse.parsePostMetadatas(parse.getMetadatas(rightBlogPostFile))
            assert.equal(false, /^[\n]+|[\n]+$/.test(postmetas.content))
        })
        it('should return owner name if no author is specified in metadatas', function () {
            var postmetas = parse.parsePostMetadatas(parse.getMetadatas(rightBlogPostFile))
            assert.equal(config.owner.name, postmetas.author)
        })
        it('should throw an error if blog post is missing or has invalid date value', function () {
            var postmetas = parse.getMetadatas(wrongDatePostFile)
            assert.throws(function () { parse.parsePostMetadatas(postmetas) }, /date/)
            // TODO: check invalid date
        })
        it.skip('should throw an error if blog post is missing title value', function () {
            var postmetas = parse.getMetadatas(wrongTitlePostFile)
            assert.throws(function () { parse.parsePostMetadatas(postmetas) }, /title/)
        })
        it.skip('should throw an error if blog post is missing content value', function () {
            var postmetas = parse.getMetadatas(wrongContentPostFile)
            assert.throws(function () { parse.parsePostMetadatas(postmetas) }, /content/)
        })
    })

    describe('#parseMetadatas()', function () {
        it('should return an Object', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert(metas instanceof Object)
        })
        it('should return the required properties for well formatted standard pages', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert(metas.layoutPath)
            assert(metas.slug)
            assert(metas.toJade.title)
            assert(metas.toJade.layoutCss)
            assert(metas.toJade.content)
            // TOTO: handle incorrect metadatas as parameter
        })
        it('should normalize the filename if no title is provided', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(noTitleFile))
            assert.equal('Test Page No Title',  metas.toJade.title)
        })
        it('should not contain line breaks at beginning or end of \`content\` property', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert.equal(false, /^[\n]+|[\n]+$/.test(metas.toJade.content))
        })
        it('should not return an Array of blog posts if property \`shouldFetchPosts\` is false', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert.equal(null, metas.toJade.posts)
        })
        it('should return an Array of blog posts if property \`shouldFetchPosts\` is true', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(blogIndexFile))
            assert(metas.toJade.posts instanceof Array)
        })
        it('should return required properties for blog post if \'isBlogPost\' is true', function () {
            var postmetas = parse.parseMetadatas(parse.getMetadatas(rightBlogPostFile))
            assert(postmetas.slug)
            assert(postmetas.layoutPath)
            assert(postmetas.toJade.post.date)
            assert(postmetas.toJade.post.author)
            assert(postmetas.toJade.post.title)
            assert(postmetas.toJade.post.content)
        })
        it('should not throw an error if no content is provided', function () {
            var metas = parse.getMetadatas(noContentFile)
            assert.doesNotThrow(function (){ parse.parseMetadatas(metas) })
        })
        it('should throw an error if slug is not valid', function () {
            var metas = parse.getMetadatas(wrongSlugFile)
            assert.throws(function (){ parse.parseMetadatas(metas) }, /slug/)
        })
        it('should throw an error if layout file does not exist', function () {
            var metas = parse.getMetadatas(wrongLayoutFile)
            assert.throws(function (){ parse.parseMetadatas(metas) }, /jade/)
        })
        it.skip('should throw an error if stylus file does not exist', function () {
            // TODO: pass as parameter the dir where we should verify for .styl and .jade files
            var metas = parse.getMetadatas(wrongLayoutFile)
            assert.throws(function (){ parse.parseMetadatas(metas) }, /stylus/)
        })
    })
})