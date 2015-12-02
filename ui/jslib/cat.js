//----------------------------------------------------------------------------
//  Catenating HTML, JS, and CSS files. This is used by the build module.
//----------------------------------------------------------------------------

var fs = require('fs-extra');
var path = require('path');
var _ = require('underscore');
var UglifyJS = require('uglify-js');

var template = require('./template.js');

function log() {
    console.log.apply(console, arguments);
}

//----------------------------------------------------------------------------
//  copy_file: copy source to target, but only if the source is newer than the
//  target.
//----------------------------------------------------------------------------
function copy_file(source, target) {
    if (fs.existsSync(target)) {
        var sstat = fs.statSync(source);
        var tstat = fs.statSync(target);
        if (sstat.mtime <= tstat.mtime) {
            return;
        }
    } else {
        fs.ensureDirSync(path.dirname(target));
    }
    log("copy:", source, "->", target);
    fs.copySync(source, target);
}

var Built = function(name) {
    this.name = name;
};

//----------------------------------------------------------------------------
//  Catenator class
//----------------------------------------------------------------------------
var Catenator = function(args) {
    _.extend(this, args);
    this.result = "";
};

Catenator.prototype.include = function(filename, args) {
    if (filename instanceof Built) {
        this.expand_source(this.cache[filename.name], args);
    } else {
        this._expand(path.join(this.root, filename), args);
    }
};

Catenator.prototype._catenate_files = function(filenames, base_path) {
    var root = this.root;
    return _.map(filenames, function(filename) {
        var filepath = base_path
            ? path.join(base_path, filename)
            : filename;
        var filepath = path.join(root, filepath);
        return fs.readFileSync(filepath);
    }).join('\n');
};

Catenator.prototype.require_files = function(args) {
    var target_directory = args.target_directory
        ? path.join(this.build, args.target_directory)
        : this.build;
    fs.ensureDirSync(target_directory);

    var source_directory = args.source_directory
        ? path.join(this.root, args.source_directory)
        : this.root;
    _.each(args.files, function(filename) {
        copy_file(
            path.join(source_directory, filename),
            path.join(target_directory, filename)
        );
    });
};

Catenator.prototype.write_build_file = function(filename, contents) {
    var filepath = path.join(this.build, filename);
    fs.ensureDirSync(path.dirname(filepath));
    fs.writeFileSync(filepath, contents);
};

Catenator.prototype.require_javascript = function(arg) {
    var result_name;
    if (_.isString(arg)) {
        // one script file.
        var filename = arg;
        result_name = filename;
        copy_file(
            path.join(this.root, filename),
            path.join(this.build, filename)
        );
    } else {
        var args = arg;
        result_name = args.result_name || 'scripts.js';
        var code = this._catenate_files(args.contents, args.base_path);

        if (this.minify) {
            code = UglifyJS.minify(code, { fromString: true }).code;
        }
        this.write_build_file(result_name, code);
    }
    this.result += '<script src="' + result_name + '"></script>';
};

Catenator.prototype.require_stylesheets = function(kwargs) {
    var result_name = kwargs.result_name || 'css/stylesheet.css';
    var code = this._catenate_files(kwargs.contents, kwargs.base_path);

    this.write_build_file(result_name, code);

    this.result += ''
        + '<link rel="stylesheet" type="text/css" href="'
        + result_name + '">';
};


Catenator.prototype.expand_source = function(source, argcontext) {
    var self = this;
    var context = {
        T : this,
        include : function() { return self.include.apply(self, arguments); }
    };
    _.extend(context, argcontext || this.context);
    template.evaluate(source, context, this);
};


Catenator.prototype._expand = function(filepath, argcontext) {
    var old_root = this.root;
    this.root = path.dirname(filepath);
    var source = String(fs.readFileSync(filepath));
    this.expand_source(source, argcontext);
    this.root = old_root;
};

Catenator.prototype.expand = function(filepath, argcontext) {
    var old_result = this.result;
    this.result = "";
    this._expand(path.join(this.root, filepath), argcontext);
    var result = this.result;
    this.result = old_result;
    return result;
};

Catenator.prototype.built = function(name) {
    return new Built(name);
};

exports.catenate = function(args) {
    var result = {};
    _.each(args.files, function(filename) {
        var catenator = new Catenator({
            root : args.source_directory,
            build : args.build_directory,
            context : args.context || {},
            minify : !!args.minify,
            cache : args.cache || {}
        });

        var sourcefile = _.isString(filename) ? filename : filename.source;
        var targetfile = _.isString(filename) ? filename : filename.target;

        var filepath = path.join(args.source_directory, sourcefile);
        catenator._expand(filepath);
        result[targetfile] = catenator.result;
        catenator.cache[targetfile] = catenator.result;

    });
    return result;
};

