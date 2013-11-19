var assert = require('assert');
var fs     = require('fs');
var path   = require('path');
var fse    = require('fs-extra');
var files  = require('../lib/files');

describe('files.js', function () {
    var testDir = path.join(__dirname, 'test-files/new-files');

    before(function (done) {
        fse.mkdirp(testDir, function (err) {
            assert.ifError(err);
            done();
        });
    });

    describe('#newPage()', function () {
        var newpage   = 'page';
        var metaspage = 'metas';

        it('should create a page with given name at given path', function (done) {
            files.newPage(newpage, testDir, function (err, pagePath) {
                assert.ifError(err);
                
                assert(fs.existsSync(path.join(testDir, newpage + '.md')));
                assert.equal(pagePath, path.join(testDir, newpage + '.md'));

                done();
            });
        });
        it('should include metadatas in its content', function (done) {
            files.newPage(metaspage, testDir, function (err, pagePath) {
                assert.ifError(err);

                fs.readFile(pagePath, { encoding: 'utf-8' }, function (err, data) {
                    assert.ifError(err);
                    var metaStr   = data.match(/^=([\s\S]+?)=([\s\S]*)/)
                    var metadatas = require('yamljs').parse(metaStr[1])
                    
                    assert.equal(metadatas.layout, 'page');
                    assert.equal(metadatas.title, 'Metas');
                    assert.equal(metadatas.slug, 'metas');

                    done();
                });
            });  
        });
        it.skip('should throw an error if a file with the same name already exists', function (done) {
            var existingFile = 'bar';

            before(function () {
                fs.writeFileSync(path.join(testDir, existingFile + '.md'), 'foo');
            });

            assert.throws(function () { 
                files.newPage(existingFile, testDir, function (err) {
                    done();
                    if (err) throw err;
                    //assert.ifError(err);
                });
            }, 
            /already exists/);
        });
    });

    describe.skip('#newPost()', function () {
        var newpostTitle = 'Hello World';

        it('should create a post with given name at given path', function (done) {
            files.newPost(newpostTitle, testDir, function (err, postPath) {
                
            });
        });
    });

    after(function (done) {
        fse.remove(testDir, function (err) {
            assert.ifError(err);
            done();
        });
    });
});