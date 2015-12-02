/*
    Rsync-style file synchronizing over FTP. Exports the function:

        sync(SyncArgs) -> Promise()

    that synchronizes a directory-tree over FTP. The argumens object has the
    structure:

        {
            source_root : String,  // root of the local directory (filepath)
            ftp : {
                host : String,  // FTP hostname
                user : String,  // FTP username
                password : String // FTP password

                directory : String // directory on the server, where to sync
            }
        }

    Works by uploading a "contents.json" file to the server that lists all
    the synced files, along with timestamps and md5 hashes.

    Note: as of now, this never deletes files on the server, even if they are
    not in the source directory anymore. Also, can not handle the case where
    a file is changed into directory, or vice versa.

*/

var FTP = require('./ftp.js');
var QQ = require('./qq.js');

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var md5 = require('MD5');


function list_dir_recursive(filepath) {
    var stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
        var contents = {};
        _.each(fs.readdirSync(filepath), function(filename) {
            contents[filename] = list_dir_recursive(path.join(filepath, filename));
        });
        return {
            type : 'directory',
            path : filepath,
            contents : contents
        };
    } else {
        return {
            type : 'file',
            path : filepath,
            last_modified : stats.mtime.getTime()
        };
    }
}

exports.list_dir_recursive = list_dir_recursive;

function compare_files(local, remote) {
    var files_to_upload = [];

    function recurse(local, remote) {
        if (remote && remote.type !== local.type) {
            throw new Error(
                "local and remote file types do not match:"
                    + local.path
                    + " " + local.type + " vs. " + remote.type
            );
        }

        if (local.type == 'file') {
            if (remote && remote.last_modified >= local.last_modified) {
                return remote;
            }
            var local_hash = md5(fs.readFileSync(local.path));
            if (!remote || remote.hash !== local_hash) {
                files_to_upload.push(local.path);
            }
            return {
                type : 'file',
                hash : local_hash,
                last_modified : local.last_modified
            };
        } else {
            var new_contents = {};
            _.each(local.contents, function(value, key) {
                new_contents[key] = recurse(
                    value,
                    remote && remote.contents[key]
                );
            });
            return {
                type : 'directory',
                contents : new_contents
            };
        }
    }
    return {
        files_to_upload : files_to_upload,
        remote_tree : recurse(local, remote)
    };
}

exports.compare_files = compare_files;

function join_path(dir, file) {
    if (file.charAt(0) == '/') {
        return file;
    } else {
        return path.join(dir, file);
    }
}

exports.sync = function(args) {
    var source_root = args.source_root;
    var target_root = args.ftp.directory;


    var local_filetree = list_dir_recursive(source_root);
    // console.log("LOCAL FILETREE");
    // console.log(JSON.stringify(local_filetree, null, 4));;

    var ftpclient = FTP.connect(args.ftp);

    var contents_path = join_path(target_root, 'contents.json');
    return ftpclient.get_as_json(contents_path, null)
        .then(function(remote_filetree) {
            // console.log("REMOTE FILETREE");
            // console.log(JSON.stringify(contents, null, 4));

            var compared = compare_files(
                local_filetree,
                remote_filetree
            );

            var files_to_upload = compared.files_to_upload;

            if (files_to_upload.length == 0) {
                console.log("All remote files up to date.");
                return ftpclient.quit()
            }

            var prefix_len = source_root.length + 1;

            return QQ.each(files_to_upload, function(sourcepath) {
                var targetpath = join_path(
                    target_root,
                    sourcepath.substring(prefix_len)
                );
                console.log(sourcepath,'->', targetpath);
                return ftpclient.put(sourcepath, targetpath);
            }).then(function() {
                console.log("==>", contents_path);
                return ftpclient.put_as_json(
                    compared.remote_tree,
                    contents_path
                );
            }).fin(function() {
                return ftpclient.quit();
            });
        });
};
