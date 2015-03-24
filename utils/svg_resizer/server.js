var http = require('http');
var fs = require('fs');
var connect = require('connect');
var serve_index = require('serve-index');
var serve_static = require('serve-static');
var body_parser = require('body-parser');
var finalhandler = require('finalhandler');

var server = null;

var BOWER_DIR = "../../bower_components";
var PUBLIC_DIR = "../../Jet2/public/";
var SVG_OUT_DIR = "../../Jet2/public/catalog/";

// Close the server and end the process.
var die = function(msg) {
    if (server != null) {
        server.close();
    }
    process.stdout.write(msg);
    process.exit();
};

// Request listener. Requires the following query params:
//      svgName - SVG name.
//      svgXml  - SVG XML.
// For additional documentation, see:
// https://github.com/senchalabs/connect
var listener = connect();

// Listen for svg post data.
listener.use(body_parser.urlencoded({ extended: false, limit: '10mb' }));
listener.use('/write_svg', function(req, res) {

    var fname = req.body.svgName;
    var data = req.body.svgXml;
    
    fs.writeFile(SVG_OUT_DIR + fname, data, function(err) {
        if (err != null) console.log(err);
    });
    process.stdout.write(SVG_OUT_DIR + fname + " written.\n");
    
    res.end("RECVD");
});

// Serve catalog XML file.
listener.use('/catalog', function(req, res) {
    var index = serve_index(PUBLIC_DIR);
    var serve = serve_static(PUBLIC_DIR);
    serve(req, res, function onNext(err) {
        var done = finalhandler(req, res);
        
        if (err) {
            return done(err);
        }
        index(req, res, done);
    });
});

// Bower components.
listener.use('/bower_components', function(req, res) {
    var index = serve_index(BOWER_DIR);
    var serve = serve_static(BOWER_DIR);
    serve(req, res, function onNext(err) {
        var done = finalhandler(req, res);
        
        if (err) {
            return done(err);
        }
        index(req, res, done);
    });
});

// Serve static index.html.
listener.use('/', function(req, res) {
    var serve = serve_static('.', { index: 'index.html' });
    serve(req, res);
});

server = http.createServer(listener).listen(8000);