var Q = require('q');
var fs = require('fs');

exports.restart = function(pidfile) {
    var ready = Q.defer();
    var should_close = Q.defer();
    var started = false;
    var pidfile_removed = false;

    function read_pid(suffix) {
        if (fs.existsSync(pidfile)) {
            return String(fs.readFileSync(pidfile + (suffix || '')));
        } else {
            return null;
        }
    }
    function write_pid(suffix) {
        fs.writeFileSync(pidfile + (suffix || ''), process.pid);
    }

    function start() {
        started = true;
        write_pid();
        ready.resolve();
    }

    function remove_pidfile() {
        if (!pidfile_removed) {
            pidfile_removed = true;
            fs.unlinkSync(pidfile);
        }
    }

    process.on('SIGUSR2', function() {
        if (!started) {
            start();
        } else {
            should_close.resolve();
        }
    });

    process.on('SIGINT', function() {
        remove_pidfile();
        process.exit();
    });

    var pid = read_pid();
    if (pid) {
        console.log("sending close signal to existing process", pid);
        write_pid('-next');
        try {
            var ok = process.kill(pid, 'SIGUSR2');
            console.log("OK", ok);
            // make sure we don't exit before receiving the signal
            setTimeout(function() {}, 300);
        } catch (err) {
            console.log("hops", err);
            start();
        }
    } else {
        start();
    }

    return {
        ready : ready.promise,
        should_close : should_close.promise,
        finish: function() {
            var next_pid = read_pid('-next');
            if (next_pid) {
                remove_pidfile();
                process.kill(next_pid, 'SIGUSR2');
            }
        }
    };
}

