var vm = require('vm');
var _ = require('underscore');

function eval_in_context(string, context) {
    vm.runInNewContext(string, context);
};

exports.eval_in_context = eval_in_context;

exports.evaluate = function(source, context, target) {
    source = String(source);
    target = target || { result : '' };
    var ix = 0;
    while (true) {
        var start = source.indexOf('{{', ix);
        if (start < 0) { break; }

        target.result += source.slice(ix, start);
        start += 2;

        var end = source.indexOf('}}', start);
        var block = source.slice(start, end);
        ix = end+2;

        if (block.indexOf('{{') == 0) {
            target.result += block;
        } else {
            var T = {
                echo : function(str) {
                    target.result += str;
                }
            };
            var CTX = _.extend({T:T}, context);
            try {
                eval_in_context("(THE_EVAL_RESULT = " + block + "\n);", CTX);
                var value = CTX.THE_EVAL_RESULT;
                if (value !== undefined) {
                    target.result += value;
                }
            } catch (error) {
                eval_in_context(block, CTX);
            }
        }
    }
    target.result += source.slice(ix);
    return target.result;
};
