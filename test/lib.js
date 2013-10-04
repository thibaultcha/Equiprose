var assert = require('assert')
, config   = require('../config.json')

describe('Lib', function () {
	var lib = require('../src/lib.js')

	describe('#walk()', function () {
		var regex = new RegExp(/\.md$/)
		var res
		it('should return an Array', function (done) {
			lib.walk(config.content_dir, regex, function (err, results) {
				assert.ifError(err)
				assert(results instanceof Array)
				res = results
				done()
			})
		})
		it('should only return files matching the specified regex', function () {
			for (var i = res.length - 1; i >= 0; i--)
				assert(regex.test(res[i]))
		})
	})

	describe('#capitalize()', function () {
		var str = 'index'
		it('should return a string', function () {
			str = lib.capitalize('index')
			assert(typeof str == 'string' || str instanceof String)
		})
		it('should capitalize the first letter', function () {
			assert.equal('I', lib.capitalize(str).charAt(0))
		})
	})

	describe.skip('#parsePostFilename()', function () {
		var result = lib.parsePostFilename('2013-09-13_blog-post.md')
		it('should return an Array', function () {
			assert(result instanceof Array)
		})
		it('should contain a Date in first element of returned Array', function () {
			assert(result[0] instanceof Date)
		})
		it.skip('should return a slugified filename in second element of returned Array', function () {
			
		})
	})

	describe('#parseFileStr()', function () {
		var parsedFileMetadatas = lib.parseFile('test/test.md')
		it('should return an Object', function () {
			assert(parsedFileMetadatas instanceof Object)
		})
		it('should contain an Object with the required properties', function () {
			assert(parsedFileMetadatas.layout)
			assert(parsedFileMetadatas.title)
			assert(parsedFileMetadatas.slug)
			assert(parsedFileMetadatas.content)
		})
	})

	describe('#parseMetadatas()', function () {
		
	})
})