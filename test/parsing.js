var assert = require('assert')
, path     = require('path')
, parse    = require('../lib/parsing.js')

describe('parsing.js', function () {
    var testFiles       = 'test/test-files'

    var pageRightFormat = path.join(testFiles, 'page.md')
    , pageNoTitle       = path.join(testFiles, 'errors', 'page-no-title.md')
    , pageNoMetas       = path.join(testFiles, 'errors', 'page-no-meta.md')
    , pageWrongSlug     = path.join(testFiles, 'errors', 'page-wrong-slug.md')
    , pageNoContent     = path.join(testFiles, 'errors', 'page-no-content.md')

    var postRightFormat = path.join(testFiles, 'post.md')
    , postNoTitle       = path.join(testFiles, 'errors', 'post-no-title.md')
    , postNoContent     = path.join(testFiles, 'errors', 'post-no-content.md')
    , postNoAuthor      = path.join(testFiles, 'errors', 'post-no-author.md')
    , postWrongDate     = path.join(testFiles, 'errors', 'post-wrong-date.md')

    describe('#parseGlobalConfig()', function () {
        it('should return the global config', function () {
            var globalConfig = parse.parseGlobalConfig()
            assert(globalConfig.configFile)
            assert(globalConfig.templateDir)
            assert(globalConfig.posts.input)
            assert(globalConfig.pages.input)
            assert(globalConfig.assets.input)
            assert(globalConfig.assets.output)
            assert(globalConfig.defaultOutput)
        })
    })

    describe('#parseConfig()', function () {
        var siteNoBuildDir = 'test/test-sites/no-build-dir'
        , siteNoBuildDirConfig
        
        var siteBuildDir = 'test/test-sites/build-dir'
        , siteBuildDirConfig

        var siteAbsoluteBuildDir = 'test/test-sites/absolute-build-dir'
        , siteAbsoluteBuildDirConfig

        before(function () {
            siteNoBuildDirConfig       = parse.parseConfig(siteNoBuildDir)
            siteBuildDirConfig         = parse.parseConfig(siteBuildDir)
            siteAbsoluteBuildDirConfig = parse.parseConfig(siteAbsoluteBuildDir)
        })

        it('should return an object', function () {
            assert(siteBuildDirConfig instanceof Object)
            assert(siteNoBuildDirConfig instanceof Object)
        })
        it('should contain a `sitePath` property to the config object', function () {
            assert(siteBuildDirConfig.sitePath)
            assert(siteNoBuildDirConfig.sitePath)
        })
        it('should contain a `buildDir` property pointing to the build directory if a relative buildDir property is provided in config.yml', function () {
            assert(siteBuildDirConfig.buildDir)
            assert.equal(siteBuildDirConfig.buildDir, 'test/test-sites/build-dir/dist')
        })
        it('should contain a `buildDir` property pointing to the build directory if an absolute buildDir property is provided in config.yml', function () {
            assert(siteAbsoluteBuildDirConfig.buildDir)
            assert.equal(siteAbsoluteBuildDirConfig.buildDir, '/tmp')
        })
        it('should contain a `buildDir` property pointing to the default build directory if no buildDir property is provided in config.yml', function () {
            assert(siteNoBuildDirConfig.buildDir)
            assert.equal(siteNoBuildDirConfig.buildDir, 'test/test-sites/no-build-dir/www')
        })
        it('should throw an error when no config.yml file is found', function () {
            assert.throws(function () { parse.parseConfig('test/test-sites/errors/no-config') }, /No config.yml file/)
        })
    })

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
    })
})