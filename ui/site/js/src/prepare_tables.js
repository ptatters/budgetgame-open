window.budjettipeli_data = (function() {
    var data = {};
    var tables = window.table_data;

    var nasnb_sums = _.map(aux.transpose(tables.NASNB), function(table) {
        return aux.sum(table);
    });

    _.each(tables.fixed_public_expenses, function(by_year, group_id) {
        var y2013 = by_year['2013'];
        var y2016 = by_year['2016'];
        var y2025 = by_year['2025'];
        var totals = [y2013, y2016, y2016, y2016, y2016, y2025, y2025, y2025, y2025];

        var table = _.map(tables.NASNB, function(nasnb_row) {
            return _.map(nasnb_sums, function(nasnb_sum, jx) {
                return nasnb_row[jx] * (totals[jx] / nasnb_sum);
            });
        });
        tables.expenses[group_id] = table;
    });


    function by_year_by_retirement_by_age_table(table) {
        var ixs = table.length == 9 ? [1,2,3,4,5,6,7,8] : [1,1,1,1,2,2,2,2];
        var value2013 = table[0];
        return {
            "2013" : {
                "-1" : value2013,
                "0"  : value2013,
                "1"  : value2013,
                "2"  : value2013,
            },
            "2016" : {
                "-1" : table[ixs[0]],
                "0"  : table[ixs[1]],
                "1"  : table[ixs[2]],
                "2"  : table[ixs[3]],
            },
            "2025" : {
                "-1" : table[ixs[4]],
                "0"  : table[ixs[5]],
                "1"  : table[ixs[6]],
                "2"  : table[ixs[7]]
            }
        };
    }

    //------------------------------------------------------------------------
    // auxiliary function for transforming the source tables to
    // three-dimensional tables indexed by
    //      - year (string, one of ["2013", "2016", "2025"])
    //      - career length change (string, one of ["-1", "0", "1", "2"])
    //      - age group index (integer, in range [0..18])
    //------------------------------------------------------------------------
    function by_year_by_retirement_by_age(tables) {
        return aux.mapdict(tables, function(table, key) {
            return by_year_by_retirement_by_age_table(aux.transpose(table));
        });
    }

    // auxiliary function that creates 2-dimensional tables indexed by
    // year and career length change from the 3-dimensional tables produced
    // by the function above, by summing the values for age groups.
    function by_year_by_retirement(table) {
        return aux.mapdict_deep(2, table, function(it) {
            return aux.sum(it);
        });
    }

    // Tabulate income by year, by retirement adjustment, and by age group
    data.income_by_year_by_retirement_by_age
        = by_year_by_retirement_by_age(tables.income);

    // Tabulate total needs, by year, and by retirement adjustment
    data.income_by_year_by_retirement = by_year_by_retirement(
        data.income_by_year_by_retirement_by_age
    );

    // Tabulate total fixed income, by year and by retirement adjustment
    data.fixed_income_by_year_by_retirement = by_year_by_retirement(
        by_year_by_retirement_by_age(tables.fixed_income)
    );

    // Tabulate expenses by year, by retirement adjustment, and by age group
    data.expenses_by_year_by_retirement_by_age
        = by_year_by_retirement_by_age(tables.expenses);

    // Tabulate total needs, by year, and by retirement adjustment
    data.expenses_by_year_by_retirement =  by_year_by_retirement(
        data.expenses_by_year_by_retirement_by_age
    );

    data.nasnb_by_year_by_retirement_by_age
        = by_year_by_retirement_by_age({ 'NASNB' : tables.NASNB })['NASNB'];


    //------------------------------------------------------------------------
    //  Create a question object for each question defined in the HTML.
    //
    //  The questions object has structure like this:
    //      questions : {
    //          q-lapsilisat : {
    //              id : 'q-lapsilisat',
    //              group : 'perhepolitiikka',
    //              effect_as_percentage_of_total_need : -0.30556,
    //              effect_by_age : [-0.17, -0.61, -0.64, 0, 0, 0, 0, ...]
    //          },
    //          q-ansiosidonnainen { ... },
    //          ...
    //      }
    //
    //------------------------------------------------------------------------
    data.questions = aux.lazy(function() {
        var result = {};
        var expenses_table = data.expenses_by_year_by_retirement_by_age;
        var income_table = data.income_by_year_by_retirement_by_age;

        var expenses_total_table = data.expenses_by_year_by_retirement;
        var income_total_table = data.income_by_year_by_retirement;


        $('.question-templates').find('.question-view').each(function() {
            // get the default public expenses in year 2016
            var group_id = this.id;

            $(this).find('.question').each(function() {
                var $q = $(this);
                var data = JSON.parse($q.find('.json-data').html());

                var target = data.target || group_id;
                console.log("target:", target);
                var table = expenses_table[target] || income_table[target];
                var expenses_by_age = table["2016"]["0"];

                var total = (expenses_total_table[target] || income_total_table[target])
                            ["2016"]["0"];

                var effects = data.effects;
                var sum = typeof(effects) === 'number'
                    ? effects
                    : aux.sum(effects);

                function format(n) {
                    if ((n % 1) == 0) {
                        return n;
                    } else {
                        return aux.format_decimal(n, 1)
                    }
                }

                var is_expense = expenses_table[target] !== undefined;
                var word = is_expense
                    ? ((sum < 0) ? 'säästö' : 'menolisäys')
                    : ((sum < 0) ? 'tulonvähennys' : 'lisätulo');

                $q.find('h5').append(''
                    + ' (Keskimääräinen ' + word + ' / vuosi: '
                    + '<span class="nowrap">' + format(Math.abs(sum))
                    + ' M€)</span>'
                );

                if (typeof(effects) !== 'number') {
                    var new_effects = {}
                    _.each(effects, function(value, key) {
                        var match = /(\d+)-(\d+)(\+?)/.exec(key)
                        if (match) {
                            var start = parseInt(match[1]);
                            var end = parseInt(match[2]);
                            if (match[3] == '+') {
                                end += 4;
                            }

                            var len = end - start + 1;
                            console.assert(len % 5 == 0);
                            var count = len / 5;
                            if (count == 1) {
                                new_effects[key] = value;
                            } else {
                                var amount = value / count;
                                for (var i = 0; i < count; ++i) {
                                    var k = start == 90
                                        ? '90+'
                                        : start + "-" + (start+4);
                                    new_effects[k] = amount;
                                    start += 5;
                                }
                            }
                        } else {
                            new_effects[key] = value
                        }
                    });
                    effects = new_effects;
                }

                var effect_by_age = _.map(
                    tables.age_groups,
                    typeof(effects) === 'number'
                        ?   // distribute envenly to all age groups
                            function(age_group, ix) {
                                return ((effects / tables.age_groups.length) /
                                       expenses_by_age[ix]) || 0;
                            }
                        :   function(age_group, ix) {
                                return (effects[age_group] /
                                        expenses_by_age[ix]) || 0;
                        }
                );

                result[this.id] = {
                    id : this.id,
                    group: group_id,
                    effect_as_percentage_of_total_need : sum / total,
                    effect_by_age : effect_by_age,
                    target : target
                };
            });
        });

        console.assert(_.size(result) !== 0);
        return result;
    });
    data.questions_by_group = aux.lazy(function() {
        return aux.lookup(data.questions(), "group");
    });

    data.question_effects_by_age = aux.mapdict(
        tables.question_effects,
        function(table, groupid) {
            var totals = data.expenses_by_year_by_retirement_by_age[groupid]["2016"]["0"];
            return _.map(table.values, function(row, age_ix) {
                return _.map(row, function(value) {
                    return value == 0 ? 0 : value / totals[age_ix];
                });
            });
        }
    );

    // calculate the effects of question to the public share of the expenses
    // of given expense group. Optionally takes age_group_ix, otherwise
    // calculates the total effects over all age groups.
    data.calculate_question_effects = function(answers, group_id, age_group_ix) {
        var qs = data.questions_by_group();
        var questions = answers.questions || {};
        if (age_group_ix === undefined) {
            return aux.sum(qs[group_id], function(question) {
                return questions[question.id]
                    ? question.effect_as_percentage_of_total_need
                    : 0;
            });
        } else {
            return aux.sum(qs[group_id], function(question) {
                return questions[question.id]
                    ? question.effect_by_age[age_group_ix]
                    : 0;
            });
        }
    };

    return data;
})();