var fs = require('fs-extra');
var path = require('path');
var Q = require('q');
var QQ = require('./qq.js');
var html_minifier = require('html-minifier');
var html5Lint = require('html5-lint');
var htmltidy = require('htmltidy');
var _ = require('underscore');
var merge = require('merge');

var cat = require("./cat.js");


function build_files(args, cache, into) {
    if (!args.files) {
        return QQ.done;
    }
    var htmls = cat.catenate({
        source_directory : args.source_root,
        build_directory : args.build_root,
        files : args.files,
        context : args,
        cache : cache
    });

    return QQ.each(htmls, function(html, filename) {
        if (args.minify) {
            var result = Q.defer();
            // Process HTML: first minify, removing comments and unnecessary
            // white space, then reformat it using htmltidy.
            html = html_minifier.minify(html, {
                removeComments : true,
                collapseWhitespace : true
            });
            var tidy_options = {
                indent : true,
                dropEmptyParas: false
            }
            htmltidy.tidy(html, tidy_options, function(err, html) {
                if (err) {
                    // log errors, proceed anyway.
                    console.log("ERROR:", err);
                }
                fs.writeFileSync(path.join(args.build_root, filename), html);
                into[filename] = html;
                result.resolve();
            });
            return result.promise;
        } else {
            fs.writeFileSync(path.join(args.build_root, filename), html);
            return QQ.done;
        }
    });
}


exports.build = function(args) {
    fs.ensureDirSync(args.build_root);

    var result = {};
    var cache = {};

    function recurse(args) {
        return build_files(args, cache, result).then(function() {
            if (args.phases) {
                return QQ.each(args.phases, function(phase) {
                    var no_phases = _.extend({}, args);
                    delete no_phases.phases;
                    return recurse(merge.recursive(true, no_phases, phase));
                });
            }
        });
    }
    return recurse(args).then(function() {
        return result;
    })
};

exports.check_html = function(html) {
    // Check the catenated HTML using html5lint.
    html5Lint( html, function( err, results ) {
        results.messages.forEach( function( msg ) {
            console.log( "HTML5 Lint [%s]: %s", msg.type, msg.message);
        });
    });
};