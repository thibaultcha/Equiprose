var assert = require('assert')
, config   = require('../config.json')
, parse    = require('../engine/lib/parsing.js')

describe('Parsing', function () {
    var rightFormatFile  = 'test/test_files/test_right_format.md'
    , wrongFormatFile    = 'test/test_files/test_wrong_format.md'
    , wrongMetadatasFile = 'test/test_files/test_wrong_metas.md'

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
        })
        it('should throw an error when passing a bad formatted file', function () {
            assert.throws(function(){ parse.getMetadatas(wrongFormatFile) }, Error)
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
            /*
            {
                layout : parsedMeta.layout,
                slug   : pageSlug + '.html',
                toJade : {
                    assetsPath : assetsPath,
                    layoutCss  : path.join(assetsPath, 'css', parsedMeta.layout + '.css'),
                    customCss  : customCssFile || null,
                    title      : pageTitle,
                    owner      : config.owner,
                    content    : marked(parsedContent),
                    
                    post       : postMetadata || null,
                    blog       : blogMetadata || null
                }
            }
            */
        })
        it.skip('should return the required properties for a blog post', function () {

        })
        it.skip('should return an Array containing blog posts for a blog index', function () {
            
        })
        it('should capitalize the filename if no title is provided', function () {
            var metas = parse.parseMetadatas(parse.getMetadatas(rightFormatFile))
            assert(metas.toJade.title != '')
        })
        it('should throw an error if layout file does not exists', function () {
            var metas = parse.getMetadatas(wrongMetadatasFile)
            assert.throws(
                function () {
                    parse.parseMetadatas(metas)
                },
                /jade/
            )
        })
        it('should throw an error if stylus file does not exists', function () {
            var metas = parse.getMetadatas(wrongMetadatasFile)
            assert.throws(
                function () {
                    parse.parseMetadatas(metas)
                }, 
                /stylus/
            )
        })
    })
})