//----------------------------------------------------------------------------
// aux module: miscellaneous generically useful functions, not directly tied
// to the budget game.
//----------------------------------------------------------------------------

var aux = {
    // change to false to deactivate logging
    should_log : false,

    //------------------------------------------------------------------------
    // logging shortcut.
    //------------------------------------------------------------------------
    log : function() {
        if (aux.should_log) {
            console.log.apply(console, arguments);
        }
    },

    //  Using a custom each function, to prevent failure on iOS 8 mobile
    //  Safari, see:
    //      http://stackoverflow.com/questions/28155841/
    each : function(array, func) {
        if (array === undefined) {
            return;
        }
        if (_.isArray(array)) {
            var len = array.length;
            for (var i = 0; i < len; ++i) {
                func(array[i], i)
            }
        } else {
            for (var key in array) {
                func(array[key], key);
            }
        }
    },

    //------------------------------------------------------------------------
    //  Mapping dictionaries. Takes a dictionary (object), and a function, and
    //  returns a new dictionary with the same keys, with the function applied
    //  to the values.
    //
    //      var dict = { "x" : "foo", "y", "barbar"};
    //      var len = function(x) { return x.length; };
    //      mapdict(dict, len)
    //      ==> { "x": 3, "y": 6}
    //
    //------------------------------------------------------------------------
    mapdict : function(dict, func) {
        var result = {};
        aux.each(dict, function(value, key) {
            result[key] = func(value, key);
        });
        return result;
    },

    //------------------------------------------------------------------------
    //  "Deep" mapdict. Applies mapping function to the leaves of a nested
    //  dictionary structure, at given depth. With depth=0, functions as
    //  mapdict.
    //------------------------------------------------------------------------
    mapdict_deep : function(depth, dict, func) {
        if (depth == 0) {
            // base case. use mapdict
            if (_.isArray(dict)) {
                return _.map(dict, func);
            } else {
                return aux.mapdict(dict, func);
            }
        } else {
            // recursive case: go down one level
            return aux.mapdict(dict, function(subdict, key) {
                return aux.mapdict_deep(depth-1, subdict, func);
            });
        }
    },

    //------------------------------------------------------------------------
    //  dict: create a dictionary with given keys, and values constructed with
    //  given constructor function
    //
    //      var len = function(x) { return x.length; };
    //      dict(["x", "foo", "bar"], len)
    //      ===> {"x" : 1, "foo" : 3, "bar" : 3}
    //------------------------------------------------------------------------
    dict : function(keys, construct_value) {
        var result = {};
        aux.each(keys, function(key) {
            result[key] = construct_value(key);
        });
        return result;
    },

    lookup : function(values, key) {
        var result = {};
        aux.each(values, function(value) {
            result[value[key]] = result[value[key]] || [];
            result[value[key]].push(value);
        });
        return result;
    },

    uninitialized : {},

    lazy : function(construct) {
        var value = aux.uninitialized;
        return function() {
            if (value === aux.uninitialized) {
                value = construct();
            }
            return value;
        }
    },

    //------------------------------------------------------------------------
    // interleave: given N lists, return one list with the argument lists
    // interleaved.
    //
    //      interleave([1,2,3],[4,5,6])
    //      ==> [1,4,2,5,3,6]
    //------------------------------------------------------------------------
    interleave : function() {
        var xss = arguments;
        var result = [];
        var k = 0;
        var m = xss.length;
        while (m > 0) {
            var n = 0;
            for (var i = 0; i < m; ++i) {
                var xs = xss[i];
                if (k < xs.length) {
                    result.push(xs[k]);
                    xss[n++] = xs;
                }
            }
            m = n;
            ++k;
        }
        return result;
    },

    //------------------------------------------------------------------------
    //  Transpose a 2-dimensional array, implemented as an array-of-arrays.
    //------------------------------------------------------------------------
    transpose : function(table) {
        // new table dimensions
        var rowcount = table.length;
        var columncount = table[0].length;

        var transposed = [];
        for (var i = 0; i < columncount; ++i) {
            var column = [];
            for (j = 0; j < rowcount; ++j) {
                column.push(table[j][i]);
            }
            transposed.push(column);
        }
        return transposed;
    },

    //------------------------------------------------------------------------
    //  deepcopy: make a deep copy of a (POD) object.
    //------------------------------------------------------------------------
    deepcopy : function(it) {
        if (_.isArray(it)) {
            return _.map(it, aux.deepcopy);
        }
        if (typeof(it) == 'object') {
            return aux.mapdict(it, aux.deepcopy);
        }
        return it;
    },

    //------------------------------------------------------------------------
    //  deep_update: update the argument object with the source object.
    //  Preserves existing objects.
    //------------------------------------------------------------------------
    deep_update : function(object, source) {
        if (_.isArray(source)) {
            if (!_.isArray(object)) {
                // the existing object is not an array (or does not exist).
                // overwrite with a new array
                object = [];
            }
            // update array contents
            for (var i = 0; i < source.length; ++i) {
                object[i] = aux.deep_update(object[i], source[i]);
            }
            return object;
        }
        if (typeof(source) === 'object') {
            if (typeof(object) !== 'object') {
                // the existing object is not an object (or does not exist).
                // return a deep copy of the source object.
                return aux.deepcopy(source);
            }
            // recursively update the properties of the object.
            for (var key in source) {
                object[key] = aux.deep_update(object[key], source[key]);
            }
            return object;
        }
        // the source value must be a non-object value. Just return it.
        return source;
    },

    //------------------------------------------------------------------------
    //  sum: calculate the sum of the numbers in the argument list, using
    //  + operator. Optionally takes a number-yielding mapping function that
    //  it applies to the elements of the argument list, similar to d3.sum()
    //
    //      sum([1,20,300])
    //      ==> 321
    //------------------------------------------------------------------------
    sum : function(xs, func) {
        if (func) { 
            if (typeof(func) == 'string') {
                xs = _.pluck(xs, func);
            } else {
                xs = _.map(xs, func);
            }
        }
        return _.reduce(
            xs,
            function(a,b) { return (b === undefined) ? a : a + b; },
            0
        );
    },

    //------------------------------------------------------------------------
    //  clamp: clamp given value in range [min...max]
    //------------------------------------------------------------------------
    clamp : function(value, min, max) {
        return value < min ? min : value > max ? max : value;
    },

    // defaulting: useful for setting default values for function arguments
    defaulting : function(value, default_value) {
        return (value === undefined) ? default_value : value;
    },

    scroll_page_top: function(top, time, options) {
        options = aux.defaulting(options, {})
        // Firefox scrolls HTML, Webkit scroll BODY
        $('html, body').stop().animate(
            { scrollTop: top },
            time,
            aux.defaulting(options.easing, 'easeOutExpo'),
            options.complete
        );
    },

    //------------------------------------------------------------------------
    //  event: create a simple event object with react() and fire() methods.
    //  react() registers a handler, fire() delivers a value to each
    //  registered handler.
    //------------------------------------------------------------------------
    event : function() {
        var reactions = [];

        return {
            react : function(func) {
                reactions.push(func);
            },
            fire : function(value) {
                aux.each(reactions, function(func) {
                    func(value);
                })
            }
        };
    },

    //------------------------------------------------------------------------
    //  format_thousands: format an integer number, grouping thousands with
    //  a thin space character
    //------------------------------------------------------------------------
    format_thousands : function(number) {
        var str = String(number);
        var cut =  str.length-3;
        if (cut > 0 && str.charAt(cut-1) != '-') {
            return aux.format_thousands(str.substring(0, cut))
                + "&thinsp;"
                + str.substring(cut);
        } else {
            return str;
        }
    },

    //------------------------------------------------------------------------
    //  format_decimal: format a number to the "places" number of decimals
    //  after the COMMA. Additionally, group thousands with a thin space. If
    //  "places" is negative, rounds the number with that many zeros.
    //
    //      format_decimal(100123.551, 4)
    //          ==> "100 123,5510"
    //
    //      format_decimal(100123,551, -2)
    //          ==> "100 100"
    //
    //------------------------------------------------------------------------
    format_decimal : function(number, places) {
        if (places > 0) {
            var num = Math.abs(number);
            for (var i = 0; i < places; ++i) { num *= 10; }
            var str = String(Math.round(num));
            var cut = Math.max(0, str.length - places);
            return (number < 0 ? '-' : '')
                + (cut == 0 ? '0' : aux.format_thousands(str.substring(0,cut)))
                + ',' + str.substring(cut);
        } else {
            for (var i = 0; i < -places; ++i) { number /= 10; }
            number = Math.round(number);
            for (var i = 0; i < -places; ++i) { number *= 10; }
            return aux.format_thousands(number);
        }
    },

    //------------------------------------------------------------------------
    //  trim: trim a string, removing whitespace from the beginning and from
    //  the end.
    //------------------------------------------------------------------------
    trim : function(string) {
        return string.replace(/^\s+|\s+$/g, '');
    },

    //------------------------------------------------------------------------
    //  Wrap text into paragraphs, splitting on empty lines.
    //------------------------------------------------------------------------
    paragraphize : function(string) {
        var lines = _.map(string.split('\n'), aux.trim);
        // add one empty line to make sure that the last paragraph is closed.
        lines.push('');
        var result = "";
        var previous_line = 'nothing'; // one of 'nothing', 'nonempty', 'empty'
        aux.each(lines, function(line) {
            if (line === '') {
                if (previous_line === 'nonempty') {
                    result += '</p>';
                }
                previous_line = 'empty'
            } else {
                if (previous_line !== 'nonempty') {
                    // start paragraph
                    result += '<p>';
                }
                result += line + '\n';
                previous_line = 'nonempty';
            }
        });
        return result;

    },

    //------------------------------------------------------------------------
    //  format_plain_text_paragraphs: format a string of plain text so that it
    //  is:
    //      * safe to embed in HTML
    //      * cut in paragraphs separated by empty lines.
    //
    //  This is useful for displaying text that has been input into a html
    //  textarea element.
    //------------------------------------------------------------------------
    format_plain_text_paragraphs : function(text) {
        return aux.paragraphize(_.escape(text));
    }

};
