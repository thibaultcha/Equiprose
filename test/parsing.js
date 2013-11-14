var assert = require('assert')
var path   = require('path')
var parse  = require('../lib/parsing.js')

describe('parsing.js', function () {
    var testFiles       = 'test/test-files'
    
    var pageRightFormat = path.join(testFiles, 'page.md')
    var pageNoTitle     = path.join(testFiles, 'errors', 'page-no-title.md')
    var pageNoMetas     = path.join(testFiles, 'errors', 'page-no-meta.md')
    var pageWrongSlug   = path.join(testFiles, 'errors', 'page-wrong-slug.md')
    var pageNoSlug      = path.join(testFiles, 'errors', 'page-no-slug.md')
    var pageNoContent   = path.join(testFiles, 'errors', 'page-no-content.md')
    
    var postRightFormat = path.join(testFiles, 'post.md')
    var postNoTitle     = path.join(testFiles, 'errors', 'post-no-title.md')
    var postNoContent   = path.join(testFiles, 'errors', 'post-no-content.md')
    var postNoAuthor    = path.join(testFiles, 'errors', 'post-no-author.md')
    var postWrongDate   = path.join(testFiles, 'errors', 'post-wrong-date.md')

    describe('#parseGlobalConfig()', function () {
        it('should return the global config', function () {
            var globalConfig = parse.parseGlobalConfig()
            assert(globalConfig.configFile, 'No configFile property')
            assert(globalConfig.paths.templateDir, 'No default templateDir property')
            assert(globalConfig.paths.posts.input, 'No default posts input property')
            assert(globalConfig.paths.pages.input, 'No default pages input property')
            assert(globalConfig.paths.assets.input, 'No default assets input property')
            assert(globalConfig.paths.assets.output, 'No defaultassets output property')
            assert(globalConfig.paths.buildDir, 'No default buildDir property')
        })
    })

    describe('#parseConfig()', function () {
        var siteNoBuildDirConfig       = {}
        var siteBuildDirConfig         = {}
        var siteAbsoluteBuildDirConfig = {}
        var siteOverrideConfig         = {}

        before(function () {
            siteNoBuildDirConfig       = parse.parseConfig('test/test-sites/no-build-dir')
            siteBuildDirConfig         = parse.parseConfig('test/test-sites/build-dir')
            siteAbsoluteBuildDirConfig = parse.parseConfig('test/test-files/config-absolute-build-dir')
            siteOverrideConfig         = parse.parseConfig('test/test-files/config-override')
        })

        it('should return an object', function () {
            assert(siteBuildDirConfig instanceof Object)
            assert(siteNoBuildDirConfig instanceof Object)
        })
        it('should add a `sitePath` property to the config object', function () {
            assert(siteBuildDirConfig.sitePath)
            assert(siteNoBuildDirConfig.sitePath)
        })
        it('should always return paths relative to the `sitePath` property in `paths` in paths are relative', function () {
            // relative buildDir
            assert.equal(siteBuildDirConfig.paths.buildDir, path.join(siteBuildDirConfig.sitePath, 'dist'), 
                'buildDir is incorrect for relative buildDir')
            assert.equal(siteBuildDirConfig.paths.assets.output, path.join(siteBuildDirConfig.sitePath, 'dist/assets'), 
                'assets output path is incorrect for relative buildDir')
            
            // no buildDir
            assert.equal(siteNoBuildDirConfig.paths.buildDir, path.join(siteNoBuildDirConfig.sitePath, 'www'), 
                'buildDir property is not relative to sitePath for no buildDir')
            assert.equal(siteNoBuildDirConfig.paths.assets.output, path.join(siteNoBuildDirConfig.sitePath, 'www/assets'), 
                'assets output path incorrect for no buildDir')
        })
        it('should keep absolute paths in `paths` property if those paths are absolute', function () {
            // absolute buildDir
            assert.equal(siteAbsoluteBuildDirConfig.paths.buildDir, '/tmp', 
                'buildDir property is incorrect when absolute path is given')
            assert.equal(siteAbsoluteBuildDirConfig.paths.assets.output, '/tmp/assets', 
                'assets output path is incorrect to sitePath for absolute buildDir')
        })
        it('should override any global property if the same property is overriden in config.yml', function () {
            assert.equal(siteOverrideConfig.dateFormat, 'MMM DD YYYY')
            assert.equal(siteOverrideConfig.paths.buildDir, '/tmp')
            assert.equal(siteOverrideConfig.paths.templateDir, path.join(siteOverrideConfig.sitePath, 'custom_template'))
            assert.equal(siteOverrideConfig.paths.assets.input, path.join(siteOverrideConfig.sitePath, 'custom_assets'))
            assert.equal(siteOverrideConfig.paths.assets.output, path.join(siteOverrideConfig.paths.buildDir, 'myassets'))
        })
        it('should include a custom property if provided in the website config file', function () {
            assert(siteBuildDirConfig.toJade, 'No custom property found in test config file')
            assert(siteBuildDirConfig.toJade.owner, 'Custom property `owner` has not been attached to the config object')
            assert(siteBuildDirConfig.toJade.website, 'Custom property `website` has not been attached to the config object')
            assert.equal('OwnerName', siteBuildDirConfig.toJade.owner.name, 'Custom property `owner.name` is incorrect')
            assert.equal('Build dir', siteBuildDirConfig.toJade.website.title, 'Custom property `website.title` is incorrect')
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
        var postmetas = {}

        beforeEach(function () {
            postmetas = parse.parsePostMetadatas(postRightFormat, 'Tests', 'DD MMM YYYY')
        })
        
        it('should return an Object', function () {
            assert(postmetas instanceof Object)
        })
        it('should return the required properties for a well formatted blog post', function () {
            // should have absolute path to post link
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
            assert.equal('Tests', noAuthorMetas.toJade.author)
        })
        it('should return a well formatted date', function () {
            var rightFormatMetas = parse.parsePostMetadatas(postRightFormat, 'Tests', 'DD MMM YYYY')
            assert.equal('07 Oct 2013', rightFormatMetas.toJade.date)

            rightFormatMetas = parse.parsePostMetadatas(postRightFormat, 'Tests', 'MMMM DD YYYY')
            assert.equal('October 07 2013', rightFormatMetas.toJade.date)
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
        it('should normalize the filename if no title is provided in metas', function () {
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
            assert.throws(function (){ parse.parseMetadatas(pageNoSlug) }, /slug/)
        })
    })
})