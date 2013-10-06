var assert = require('assert')
, config   = require('../config.json')
, parse    = require('../engine/lib/parsing.js')

describe('Parsing', function () {
    var rightFormatFile  = 'test/test_files/test_right_format.md'
    , testNoTitleFile    = 'test/test_files/test_no_title.md'
    , wrongFormatFile    = 'test/test_files/test_wrong_format.md'
    , wrongMetadatasFile = 'test/test_files/test_wrong_metas.md'
    , wrongSlugFile      = 'test/test_files/test_wrong_slug.md'
    , noContentFile      = 'test/test_files/test_no_content.md'
    , blogPath           = 'test/test_files/blog/'
    , blogIndexFile      =  blogPath + '/test_blog_index.md'

    describe('#getMetadatas()', function () {
        it('should return an Object', function () {
            var metas = parse.getMetadatas(rightFormatFile)
            assert(metas instanceof Object)
        })
        it('should contain an Object with the required properties', function () {
            var metas = parse.getMetadatas(rightFormatFile)
            assert(metas.layout)
            assert(metas.title || metas.title == '')
            assert(metas.slug)
            assert(metas.content)
            assert(metas.filename)
            assert(metas.dirpath)
        })
        it('should throw an error when passing a bad formatted file', function () {
            assert.throws(function (){ parse.getMetadatas(wrongFormatFile) }, Error)
        })
    })

    describe('#parseMetadatas()', function () {
        it('should return an Object', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert(metas instanceof Object)
        })
        it('should return the required properties for all type of pages', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert(metas.layoutPath)
            assert(metas.slug)
            assert(metas.toJade.title)
            assert(metas.toJade.layoutCss)
            assert(metas.toJade.content)
        })
        it('should return an Array of blog posts if property \`shouldFecthPosts\` is true', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(blogIndexFile))
            assert(metas.posts instanceof Array)
        })
        it('should capitalize the filename if no title is provided', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(testNoTitleFile))
            assert(metas.toJade.title != '')
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
            var metas = parse.getMetadatas(wrongMetadatasFile)
            assert.throws(function (){ parse.parseMetadatas(metas) }, /jade/)
        })
        it.skip('should throw an error if stylus file does not exist', function () {
            // TODO: pass as parameter the dir where we should verify for .styl and .jade files
            var metas = parse.getMetadatas(wrongMetadatasFile)
            assert.throws(function (){ parse.parseMetadatas(metas) }, /stylus/)
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
            for (var i = posts.length - 1; i >= 0; i--)
                assert(posts[i].isBlogPost)
        })
        it('should return required properties for a blog post', function () {
            var posts = parse.fetchBlogPosts(blogPath)
            for (var i = posts.length - 1; i >= 0; i--) {
                assert(posts[i].toJade.title)
                assert(posts[i].toJade.link)
                assert(posts[i].toJade.date)
            }
        })
        // post date format?
    })
})