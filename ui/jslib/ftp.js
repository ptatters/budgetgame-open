/*
    Wrapper around the jsftp module, providing nicer API using q-promises.
    Also encapsulates some quirks of jsftp (e.g. does not treat "Entering
    Passive Mode" as an error), and provides easy gets and puts for strings
    and JSON encoded data.


    Types:

        FTPAccount = {
            host :: String,
            user :: String,
            password :: String
        }

    Constructor:

            connect(GTPAccount) -> FTP
                -- create an FTP connection object with given credentials

    Methods:

            FTP.put :: (local::Filename, remote::Filename) -> Promise()
                -- transfer a local file to the remote host

            FTP.put_as_json :: (JSONdata, remote::Filename) -> Promise()
                -- encode an object into JSON and transfer it to the remote
                -- host

            FTP.get_as_string :: (remote::Filename) -> Promise(String)
                -- get a remote file as a string

            FTP.get_as_json :: (remote::Filename) -> Promise(JSONdata)
                -- get a remote file parsed as JSON

            FTP.mkdir :: (remote::Filename) -> Promise()
                -- create a remote directory

            FTP.mkdirs :: (remote::Filename) -> Promise()
                -- create a remote directory, creating the intermediate
                -- directories on the path as necessary

            FTP.quit :: () -> Promise()
                -- end the connection

*/

var path = require('path');
var JSFtp = require('jsftp');
var Q = require('q');

var FTPclient = function(ftp) {
    this._ftp = ftp;
}

var NO_SUCH_FILE = 550;
var FILENAME_NOT_ALLOWED = 553;

function ignore_error(error) {
    return String(error).indexOf(
            "Unexpected command 227 Entering Passive Mode"
        ) !== -1;
}

FTPclient.prototype.put = function(source, target) {
    var result = Q.defer();
    var self = this;
    self._ftp.put(source, target, function(error) {
        if (!error || ignore_error(error)) {
            result.resolve();
        }
        if (error && error.code === FILENAME_NOT_ALLOWED) {
            self.mkdirs(path.dirname(target)).then(
                function() {
                    self._ftp.put(source, target, function(error) {
                        if (error && error.code) {
                            result.reject(error);
                        } else {
                            result.resolve();
                        }
                    });
                },
                function(error) {
                    result.reject(error);
                }
            );
        } else {
            result.reject(error);
        }
    });
    return result.promise;
};

FTPclient.prototype.put_as_json = function(data, remote_filename) {
    return this.put(new Buffer(JSON.stringify(data)), remote_filename);
};


FTPclient.prototype.get_as_string = function(filename, default_value) {
    var result = Q.defer();

    this._ftp.get(filename, function(error, socket) {
        if (error || ignore_error(error)) {
            if (error.code === NO_SUCH_FILE && default_value !== undefined) {
                result.resolve(default_value);
            } else {
                result.reject(error);
            }
        } else {
            var str = "";
            socket.on('data', function(data) {
                str += data.toString();
            });
            socket.on('error', function(error) {
                if (result.promise.isPending()) {
                    result.reject(error);
                } else {
                    console.log("error", error);
                }
            });
            socket.on('end', function() {
                socket.end();
                if (result.promise.isPending()) {
                    result.resolve(str);
                }
            });
            socket.on('close', function(had_error) {
                if (!had_error && result.promise.isPending()) {
                    result.resolve(str);
                }
            });
            socket.resume();
        }
    });
    return result.promise;
};

FTPclient.prototype.get_as_json = function(filename, default_value) {
    return this.get_as_string(filename).then(
        function(string) {
            return JSON.parse(string);
        },
        function(error) {
            if (error.code === NO_SUCH_FILE) {
                return default_value;
            } else {
                throw error;
            }
        }
    );
};


FTPclient.prototype.mkdir = function(filepath) {
    var self = this;
    var result = Q.defer();
    if (!filepath) {
        result.reject(new Error("ftp.mkdirs: empty directory name"));
    } else {
        self._ftp.raw.mkd(filepath, function(error) {
            if (!error || ignore_error(error)) {
                result.resolve();
            } else {
                result.reject(error);
            }
        });
    }
    return result.promise;
};

FTPclient.prototype.mkdirs = function(filepath) {
    var self = this;
    return self.mkdir(filepath).fail(function(error) {
        if (error.code === NO_SUCH_FILE) {
            return self.mkdirs(path.dirname(filepath)).then(function() {
                return self.mkdir(filepath);
            });
        } else {
            throw error;
        }
    });
};

FTPclient.prototype.quit = function() {
    var result = Q.defer();
    this._ftp.raw.quit(function(error, data) {
        if (!error || ingore_error(error)) {
            result.resolve();
        } else {
            result.reject(error);
        }
    });
    return result.promise;
}

exports.connect = function(credentials) {
    var ftp = new JSFtp({
        host : credentials.host,
        user : credentials.user,
        pass : credentials.password || credentials.pass
    });
    return new FTPclient(ftp);
};

