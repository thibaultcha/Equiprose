var assert = require('assert')
, config   = require('../config.json')

describe('Walker', function () {

	var walker = require('../lib/walker.js').walk

	describe('#walk()', function () {
		it('should only return files matching the specified regex', function (done) {
			var regex = new RegExp(/\.md$/)
			walker(config.content_dir, regex, function (err, results) {
				if (err) throw err
				for (var i = results.length - 1; i >= 0; i--)
					assert.equal(true, regex.test(results[i]))
				done()
			})
		})
	})

})