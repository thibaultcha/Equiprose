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
            assert(globalConfig.configFile, 'No configFile property')
            assert(globalConfig.templateDir, 'No default templateDir property')
            assert(globalConfig.posts.input, 'No default posts input property')
            assert(globalConfig.pages.input, 'No default pages input property')
            assert(globalConfig.assets.input, 'No default assets input property')
            assert(globalConfig.assets.output, 'No defaultassets output property')
            assert(globalConfig.buildDir, 'No default buildDir property')
        })
    })

    describe('#parseConfig()', function () {
        var siteNoBuildDir = 'test/test-sites/no-build-dir'
        , siteNoBuildDirConfig
        
        var siteBuildDir = 'test/test-sites/build-dir'
        , siteBuildDirConfig

        var siteAbsoluteBuildDir = 'test/test-files/config-absolute-build-dir'
        , siteAbsoluteBuildDirConfig

        var siteOverride = 'test/test-files/config-override'
        , siteOverrideConfig

        before(function () {
            siteNoBuildDirConfig       = parse.parseConfig(siteNoBuildDir)
            siteBuildDirConfig         = parse.parseConfig(siteBuildDir)
            siteAbsoluteBuildDirConfig = parse.parseConfig(siteAbsoluteBuildDir)
            siteOverrideConfig         = parse.parseConfig(siteOverride)
        })

        it('should return an object', function () {
            assert(siteBuildDirConfig instanceof Object)
            assert(siteNoBuildDirConfig instanceof Object)
        })
        it('should contain a `sitePath` property to the config object', function () {
            assert(siteBuildDirConfig.sitePath)
            assert(siteNoBuildDirConfig.sitePath)
        })
        it('should override global `buildDir` property if a relative buildDir property is provided in config.yml', function () {
            assert(siteBuildDirConfig.buildDir)
            assert.equal(siteBuildDirConfig.buildDir, 'test/test-sites/build-dir/dist')
        })
        it('should override global `buildDir` property if an absolute buildDir property is provided in config.yml', function () {
            assert(siteAbsoluteBuildDirConfig.buildDir)
            assert.equal(siteAbsoluteBuildDirConfig.buildDir, '/tmp')
        })
        it('should not override global `buildDir` property if no buildDir property is provided in config.yml', function () {
            assert(siteNoBuildDirConfig.buildDir)
            assert.equal(siteNoBuildDirConfig.buildDir, 'test/test-sites/no-build-dir/www')
        })
        it('should override any global property if the same property is overriden in config.yml', function () {
            assert.equal(siteOverrideConfig.dateFormat, 'DD MMM YYYY')
            assert.equal(siteOverrideConfig.buildDir, '/tmp')
            assert.equal(siteOverrideConfig.templateDir, 'custom_template')
            assert.equal(siteOverrideConfig.assets.input, 'custom_assets')
            assert.equal(siteOverrideConfig.assets.output, 'myassets')
            /*  
            dateFormat: MMM DD YYYY
            buildDir: /tmp
            templateDir: custom_template
            assets:
              input: custom_assets
              output: myassets
            */
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