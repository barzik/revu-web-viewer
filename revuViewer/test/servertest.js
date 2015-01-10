/**
 * Created by ran on 10/01/15.
 */

var assert = require("assert"), http = require("http"), path = require("path"); // core module

/**
 * Server can handle differents ports
 */

describe('Server Operations - checking port definition', function(){
    before(function(done) {
        var revuViewer = require(__dirname+'/../index.js')({
            "port": 4000
        });
        done();
    });
    it('should return 200', function (done) {
        http.get('http://localhost:4000', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });
});

/**
 * The HTML is changed according to configuration
 */

describe('Server Operations - checking HTML', function(){

    before(function(done){
        var revuViewer  = require('./../index.js')({
            "port": 3000,
            "title" : 'red fox is coming',
            "refresh": 5555
        });
        done();


    });


    it('have h1 the same as title config', function (done) {
        http.get('http://localhost:3000', function (res) {
            res.setEncoding('utf8');
            var body_html = '';
            res.on('data', function (chunk) {
                body_html += chunk;
            });
            res.on('end', function () {
                assert.notEqual(-1, body_html.indexOf("<h1>red fox is coming</h1>"));
                done();
            });
        });
    });

    it('have refresh meta the same as refresh config', function (done) {
        http.get('http://localhost:3000', function (res) {
            res.setEncoding('utf8');
            var body_html = '';
            res.on('data', function (chunk) {
                body_html += chunk;
            });
            res.on('end', function () {
                assert.notEqual(-1, body_html.indexOf("<meta http-equiv='refresh' content='5555'>"));
                done();
            });
        });
    });

});

/**
 * Changes in reVu XML will be reflected on the web
 */


describe('Adding reVu XML will change the server output', function(){

    before(function(done){
        var fs = require('fs');
        var rd = fs.createReadStream(__dirname+'/test.xml');
        var wr = fs.createWriteStream(path.resolve(__dirname+'/../../')+"/demo_xml_file_folder/test.xml");
        wr.on("close", function(ex) {
            done();
        });
        rd.pipe(wr);

    });


    it('have Mr Test', function (done) {
        http.get('http://localhost:3000', function (res) {
            res.setEncoding('utf8');
            var body_html = '';
            res.on('data', function (chunk) {
                body_html += chunk;
            });
            res.on('end', function () {
                assert.notEqual(-1, body_html.indexOf("Mr. Test"));
                assert.notEqual(-1, body_html.indexOf("This is test project subtext"));
                assert.notEqual(-1, body_html.indexOf("Test reVu"));
                done();
            });
        });
    });

    it('Does not have Mr Test after file remove', function (done) {
        var fs = require('fs');
        fs.unlinkSync(path.resolve(__dirname+'/../../')+"/demo_xml_file_folder/test.xml");

        http.get('http://localhost:3000', function (res) {
            res.setEncoding('utf8');
            var body_html = '';
            res.on('data', function (chunk) {
                body_html += chunk;
            });
            res.on('end', function () {
                assert.equal(-1, body_html.indexOf("Mr. Test"));
                assert.equal(-1, body_html.indexOf("This is test project subtext"));
                assert.equal(-1, body_html.indexOf("Test reVu"));
                done();
            });
        });
    });

});

