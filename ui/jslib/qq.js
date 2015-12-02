/*
    Some helper functions to ease the use of Q promises.

    Functions:
        promise ::  (A) -> Promise(A)
            -- creates a fulfilled promise with the given value

        each :: ([A], (A) -> Promise()) -> Promise()
            -- maps a promise-yielding function to an array of promises, and
            -- executes the functions sequentially. The resulting promise
            -- is fulfilled when all the array elements have been processed.

    Constants:

        done :: Promise()
            -- fulfilled promise with no value

*/

var Q = require('q');
var _ = require('underscore');

exports.promise = function(value) {
    var done = Q.defer();
    done.resolve(value);
    return done.promise;
};

exports.done = exports.promise();

exports.each = function(array, func) {
    if (_.isArray(array)) {
        var ix = 0;
        function step() {
            if (ix === array.length) {
                return exports.done;
            } else {
                var key = ix++;
                return func(array[key], key).then(step);
            }
        }
        return step();
    } else {
        var keys = _.keys(array);
        var ix = 0;
        function step2() {
            if (ix === keys.length) {
                return exports.done;
            } else {
                var key = keys[ix++]
                return func(array[key], key).then(step2);
            }
        }
        return step2();
    }
};

exports.mapdict = function(dict, func) {
    var result = {};
    var ix = 0;
    var array = [];
    for (var key in dict) {
        array.push({ key : key, value : dict[key] });
    }
    function step() {
        if (ix === array.length) {
            return exports.promise(result);
        } else {
            var elt = array[ix++];
            return func(elt.value, elt.key).then(function(value) {
                result[elt.key] = value;
                return step();
            });
        }
    }
    return step();
}
