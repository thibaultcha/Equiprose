var assert  = require('assert')
var fs      = require('fs')
var helpers = require('../lib/helpers')

describe('helpers.js', function () {

    describe('#capitalize()', function () {
        it('should return a String', function () {
            assert(typeof(helpers.capitalize('index')) === 'string')
        })
        it('should capitalize the first letter of a String', function () {
            assert.equal('I', helpers.capitalize('index').charAt(0))
        })
    })

    describe('#slugify()', function () {
        it('should return a String', function () {
            assert(typeof(helpers.slugify('hello world')) === 'string')
        })
        it('should return a slugified String for any input', function () {
            assert.equal(true, /^[a-z0-9-]+$/.test(helpers.slugify('%Test_#.Slug"!\'è§')))
            assert.equal('hello-world', helpers.slugify('-hello #world--'))
        })
    })

    describe('#trim()', function () {
        it('should return a String', function () {
            var str = helpers.trim('\n\n\nHello World')
            assert(typeof(str) === 'string')
        })
        it('should remove all line breaks at the beginning and end of a string', function () {
            var str = helpers.trim('\n\n\nHello World')
            assert.equal('Hello World', str)
            str = helpers.trim('\n\n\nHello\nWorld\n')
            assert.equal('Hello\nWorld', str)
        })
    })

    describe('#normalizeFilenameAsTitle()', function () {
        it('should return a String', function () {
            var str = helpers.normalizeFilenameAsTitle('hello_world.md')
            assert(typeof(str) === 'string')
        })
        it('should normalize a file name to be a title', function () {
            var str = helpers.normalizeFilenameAsTitle('hello_world.md')
            assert.equal('Hello World', str)
        })
    })

    describe('#isValidDate()', function () {
        var date, wrong

        before(function () {
            date   = new Date('Mon Oct 07 2013 18:26:47 GMT+0200 (CEST)')
            wrong  = new Date('wrong format')
            nodate = 'no_date'
        })

        it('should return a boolean', function () {
            assert(typeof(helpers.isValidDate(date)) === 'boolean')
        })
        it('should return true for a correct date', function () {
            assert.equal(true, helpers.isValidDate(date))
        })
        it('should return false for an incorrect date', function () {
            assert.equal(false, helpers.isValidDate(wrong))
            assert.equal(false, helpers.isValidDate(nodate))
        })
    })

    describe('#recursiveExists()', function () {
        it('should return an empty array if filename is not in given arboresence', function (done) {
            helpers.recursiveExists('foo.txt', 'test/', function (err, paths) {
                assert.ifError(err)
                assert.equal(0, paths.length)
                done()
            })
        })
        it('should return an array containing paths to matches if filename is in given arborescence', function (done) {
            helpers.recursiveExists('helpers.js', 'test/', function (err, paths) {
                assert.ifError(err)
                assert.equal(1, paths.length)
                assert.equal(paths[0], 'test/helpers.js')
                done()
            })
        })
    })

    describe('#enumerateProperties()', function () {
        var obj = { 
            foo: 'foo', 
            bar: 'bar', 
            nested: { 
                foo: 'foo', 
                bar: 'bar', 
                verynested: { important: 'test' } 
            }, 
            last: 'last'
        }
        it('should callback the dot path of all properties of a given object', function () {
            var counter = 0
            helpers.enumerateProperties(obj, function (path) {
                assert(typeof(path) === 'string', 'Callback path is not a String')
                if (counter == 0)
                    assert.equal(path, 'foo')
                else if (counter == 2)
                    assert.equal(path, 'nested.foo')
                else if (counter == 4)
                    assert.equal(path, 'nested.verynested.important')
                counter++
            })
        })
    })

    describe('#pathToProperty()', function () {
        var obj = { foo: 'foo', bar: 'bar', nested: { foo: 'foo', bar: 'bar' }, test: 'test' }
        it('should return the value of an object for a given property path', function () {
            assert.equal('foo', helpers.pathToProperty(obj, 'foo'))
            assert.equal('foo', helpers.pathToProperty(obj, 'nested.foo'))
            assert.equal('bar', helpers.pathToProperty(obj, 'nested.bar'))
            assert.equal('test', helpers.pathToProperty(obj, 'test'))
        })
    })

    describe('#setAtPath()', function () {
        var obj = { foo: 'foo', bar: 'bar', nested: { foo: 'foo', bar: 'bar' }, test: 'test' }
        it('should set the given value at the given path', function () {
            helpers.setAtPath(obj, 'foo', 'set')
            assert.equal('set', obj.foo)

            helpers.setAtPath(obj, 'nested.bar', 'test')
            assert.equal('test', obj.nested.bar)
        })
        it('should recursively create missing properties', function () {
            helpers.setAtPath(obj, 'nested.create.test', 'test')
            assert.equal('test', obj.nested.create.test, 'Missing properties not recursively created')
            helpers.setAtPath(obj, 'nested.create.very.nested.important.test', 'verynested')
            assert.equal('verynested', obj.nested.create.very.nested.important.test, 'Missing properties not recursively created')
        })
    })
})