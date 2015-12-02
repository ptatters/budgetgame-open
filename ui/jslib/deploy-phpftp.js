var build = require("./build.js");
var template = require("./template.js");
var ftpsync = require('./ftpsync.js');
var QQ = require('./qq.js');

var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');

exports.deploy = function(config) {

    build.build(config.build).then(function() {
        return ftpsync.sync({
            ftp : config.ftp,
            source_root : config.build.build_root,
        });
    }).done();
};
