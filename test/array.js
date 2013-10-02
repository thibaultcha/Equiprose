var assert = require("assert")


beforeEach(function () {

})

describe('Array', function () {
  
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5))
      assert.equal(-1, [1,2,3].indexOf(0))
    })
  })

  describe('#shift()', function () {
  	it('should return the first object from an array', function () {
  		assert.equal(1, [1,2,3].shift())
  	})
  	it('should remove the object from the array', function () {
  		var arr = [1,2,3]
  		arr.shift()
  		assert.equal(2, arr.length)
  	})
  })

})