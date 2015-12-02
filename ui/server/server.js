var fs = require('fs-extra');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var secureRandom = require('secure-random');
var nedb = require('nedb');
var base32 = require('base32');
var optimist = require('optimist');
var bodyParser = require('body-parser');
var Q = require('q');

var template = require('../jslib/template.js');

var restart = require('./restart.js');

var pathprefix = optimist.argv.pathprefix || '';

var port = 8222;
var base_url = optimist.argv.dev
    ? "http://localhost:"+ port + "/"
    : "https://huikea.com/dev/budjettipeli/"
    ;

if (optimist.argv.local) base_url = 'http://192.168.1.35:' + port + '/';

var build_root = 'build/local';

if (optimist.argv.dev) {
    console.log("development mode.");
    var build = require("../jslib/build.js");
    var rebuild = function() {
        return build.build({
            build_root : build_root,
            source_root : 'site',
            minify : false,
            options : {
                include_analytics : false,
                base_url : base_url
            },
            files : [
                'main.html',
                'index.html'
            ]
        });
    }
    rebuild();
} else {
    var done = Q.defer();
    done.resolve();
    rebuild = function() {
        return done.promise;
    }
}


fs.ensureDirSync("database");
var pidfile = "database/api-server-pid";

function invent_id_and_insert_record(db, record, tries) {
    tries = tries || 3;
    var result = Q.defer();
    function try_insert() {
        record.id = base32.encode(secureRandom(10));
        db.insert(record, function(err, inserted_record) {
            if (err) {
                console.log("error inserting:", err);
                if (--tries > 0) {
                    try_insert();
                } else {
                    result.reject(err);
                }

            } else {
                console.log("inserted:", inserted_record.id);
                result.resolve(inserted_record);
            }
        });
    }
    try_insert();
    return result.promise;
}

var daemon = restart.restart(pidfile);
daemon.ready.then(function() {
    var app = express();
    app.use(logger('combined'));
    app.use(bodyParser.json());

    var db = new nedb({ filename : 'database/database', autoload : true });
    db.ensureIndex({ fieldName : 'id', unique: true });

    function index_template() {
        return String(fs.readFileSync(path.join(build_root, 'main.html')));
    }

    function index_page() {
        return String(fs.readFileSync(path.join(build_root, 'index.html')));
    }

    function log_error(err) {
        console.log(err);
        console.log(err.stack);
    }



    app.get('/', function(request, response) {
        rebuild()
            .then(function() {
                response.send(index_page());
            })
            .fail(function(error) {
                log_error(error);
            });
    });

    app.post(pathprefix + '/api/new_budget', function(request, response) {
        console.log("PARAMS", JSON.stringify(request.body));

        invent_id_and_insert_record(db, {
                timestamp : new Date().getTime(),
                data : request.body.data
            })
            .then(function(doc) {
                response.send({
                    id : doc.id,
                    url : base_url + 'budjetti/' + doc.id
                });
            })
            .fail(function(error) {
                response.status(500).send("Failure");
            });
    });
    // soifom919
    app.get(pathprefix + '/budjetti/:id', function(request, response) {
        var id = request.params.id;
        console.log("retrieve:", id);

        var record = db.find({id : id}, function(err, docs) {
            if (err) {
                log_error(err);
                response.status(500).send("Failure");
                return;
            }

            if (docs.length === 0) {
                response.status(404).send("not found.");
                return;
            }

            var record = docs[0];

            var budget_page = template.evaluate(index_template(), {
                base : base_url,
                stored_budget_data : ''
                    + '<script>'
                    +   'window.application_state.update('
                    +       JSON.stringify(record.data) + ');'
                    + '</script>'
            });

            rebuild()
                .then(function() {
                    response.send(budget_page);
                })
                .fail(function(error) {
                    log_error(error);
                });
        });
    });

    app.use(express.static(build_root));

    process.on('uncaughtException', function(exception) {
        console.log("uncaught exception:");
        log_error(exception);
        console.log("continuing anyway.");
    });

    var server = app.listen(port, function() {
        var host = server.address().address;
        var port = server.address().port;

        console.log('HTTP server listening on port %s', port);
    });
    daemon.should_close.then(function() {
        server.close(function() {
            console.log("server closed, another process taking over.")
            daemon.finish();
        });
    });
});