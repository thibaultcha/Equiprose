var assert = require("assert")

describe('String', function () {
  
  describe('#charAt()', function () {
    it('should return the character at the specified index', function () {
      assert.equal('o', 'I love pizza'.charAt(3))
    })
  })

})