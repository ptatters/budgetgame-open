var budjettipeli_model = (function() {

    log = aux.log;


    var tables = table_data;

    // Fixed model for year 2013
    var model2013 = _.extend({
        personal_balance_by_age : _.map(
            tables.age_groups,
            function(age_group, age_ix) {
                return Math.round(
                    tables.service_deficit['2013'][age_ix] * 1000000 /
                    tables.population['2013'][age_ix]
                );
            }
        ),

        service_deficit_by_age : _.map(
            tables.age_groups,
            function(age_group, age_ix) {
                return { total : tables.service_deficit['2013'][age_ix] };
            }
        )
    }, tables.base_numbers['2013']);

    function calculate(state) {
        var data = window.budjettipeli_data;

        var career_adjustment = state.career_adjustment;
        var gdb_adjustment = state.gdb_adjustment;
        var answers = state.answers;

        var gdb_growth = tables.volume_growth[gdb_adjustment];

        numbers2016 = tables.base_numbers['2016'];

        // calculate numbers for each year
        var result = aux.dict(["2016","2025"], function(year) {

            //find the growth factor that is used to scale the numbers
            var growths = aux.mapdict(tables.growth_factors[year] || {}, function (growth) {
                return growth[gdb_adjustment] || 1;
            });

            // Calculate public income
            var table = data.income_by_year_by_retirement;
            var base_income = {
                'sotumaksut'        : table['sotumaksut'][year][career_adjustment],
                'muut_tulot'        : 30995
            };

            // apply growth
            base_income = aux.mapdict(base_income, function(value, group) {
                return Math.round(value) * (growths[group] || 1);
            });

            base_income['tuloverot'] = table['tuloverot'][year][career_adjustment];

            log("base_income", base_income);

            var private_expenses_total = 0;
            var groups = _.keys(data.expenses_by_year_by_retirement);

            // calculate dynamic expenses
            var expenses = aux.mapdict(
                data.expenses_by_year_by_retirement,
                function(table, group) {
                    var total = table[year][career_adjustment] * (growths[group] || 1);
                    var percs = answers.shares[group];
                    var public_  = total * percs[0] * 0.01 ;
                    var private_ =  total * (percs[1] + percs[2]) * 0.01;

                    private_expenses_total += private_;

                    return {
                        "required" : total,
                        "public"   : public_,
                        "private"  : private_,
                        "deficit"  : total - public_ - private_,
                        "editable" : (
                            group != 'elinkeinoelama' &&
                            group != 'maanpuolustus' &&
                            group != 'muu_julkinen'

                        )
                    }
                }
            );

            // Add fixed public expenses
            // expenses = _.extend(expenses, aux.mapdict(
            //     tables.fixed_public_expenses,
            //     function(table, group) {
            //         return { "public" : table[year] * (growths[group] || 1) }
            //     }
            // ));

            // Add private expenses
            expenses = _.extend(expenses, aux.mapdict(
                tables.fixed_private_expenses,
                function(table, group) {
                    private_expenses_total += table[year] * (growths[group] || 1);
                    return { "private" : table[year] * (growths[group] || 1) }
                }
            ));

            base_income['valilliset_verot'] = private_expenses_total * .275;



            // apply user-settable income factors to public
            // incomes
            var income = aux.mapdict(base_income, function(value, key) {
                var factor = state.income_factors[key]
                if (factor !== undefined) {
                    value *= factor * 0.01;
                }
                return value;
            });
            var public_income_total = aux.sum(income);
            log("public_income_total", public_income_total);

            var extra_effects = aux.mapdict(
                tables.expenses_default_shares,
                function(default_shares, group_id) {
                    var total_effects
                        = answers.shares[group_id][0]
                        - default_shares[0];
                    return total_effects
                         - data.calculate_question_effects(answers, group_id);
                }
            );

            function calculate_service_deficit_by_age(with_effects) {
                // calculate "service deficit by age".

                var cadj = with_effects ? career_adjustment : "0";

                return _.map(
                    tables.age_groups,
                    function(age_group, age_ix) {
                        var expenses = aux.sum(
                            data.expenses_by_year_by_retirement_by_age,
                            function(table, group_id) {
                                var total_expenses
                                    = table[year][cadj][age_ix]
                                    * (growths[group_id] || 1);

                                if (tables.fixed_public_expenses[group_id]) {
                                    total_expenses *= 0.4436;
                                }

                                var default_share = tables.expenses_default_shares[group_id][0] * 0.01;
                                if (!with_effects) {
                                    return total_expenses * default_share;
                                }

                                var question_effects = data.calculate_question_effects(answers, group_id, age_ix);

                                var expenses_left = total_expenses * (default_share + question_effects);
                                return expenses_left * (1 + extra_effects[group_id] * 0.01);
                            }
                        );

                        //var nasnb = data.nasnb_by_year_by_retirement_by_age[year][career_adjustment][age_ix];
                        //expenses += nasnb * (growths['NASNB'] || 1);

                        var income = aux.sum(
                            data.income_by_year_by_retirement_by_age,
                            function(table, group) {
                                var ratio = with_effects ? state.income_factors[group] * 0.01 : 1;
                                return table[year][cadj][age_ix] * ratio * (growths[group] || 1);
                            }
                        );

                        // ...
                        return {
                            expenses : expenses,
                            income : income,
                            total : income - expenses
                        }
                    }
                );
            }
            var service_deficit_by_age = calculate_service_deficit_by_age(true);
            var service_deficit_by_age_without_effects = calculate_service_deficit_by_age(false);

            var population = tables.population[year];

            var personal_balance_by_age = _.map(
                service_deficit_by_age,
                function(record, age_ix) {
                    var balance = record.income - record.expenses;
                    return Math.round(balance * 1000000 / population[age_ix]);
                }
            );

            var service_deficit = aux.sum(expenses, 'deficit');
            var public_expenses_total = aux.sum(expenses, 'public');

            var deficit = public_expenses_total - public_income_total;

            // BKT
            var gdb = year == "2016"
                ? numbers2016.gdb
                : numbers2016.gdb * gdb_growth;

            // Saadut tulonsiirrot
            var transfers = (
                expenses['elakkeet']['public']
                + expenses['tyottomyys']['public']
                + expenses['terveys']['public'] * 0.3
            );

            // Palkka- ja yrittäjätulot
            var fixed_table = data.fixed_income_by_year_by_retirement;
            var salaries = fixed_table['salaries'][year][career_adjustment] * (growths['salaries'] || 1);

            // Omaisuustulot
            var property_income
                = numbers2016.property_income
                * (growths['property_income'] || 1);

            // Yksityishenkilöiden tulot yhteensä
            var private_income
                = transfers
                + salaries
                + property_income;

            var numbers = {
                expenses : expenses,
                income : income,
                base_income : base_income,

                public_expenses_total : public_expenses_total,
                public_income_total : public_income_total,
                deficit : deficit,

                service_deficit : service_deficit,

                // all private income, minus private expenses and
                // transfers to public (tuloverot)
                private_surplus : private_income
                        - aux.sum(expenses, 'private')
                        - base_income['tuloverot'],

                // "Yksityishenkilöiden tulot yhteensä"
                private_income : private_income,
                transfers : transfers,
                salaries : salaries,
                property_income: property_income,

                gdb : gdb,

                deficit_gdb_ratio : deficit / gdb,

                service_deficit_by_age : service_deficit_by_age,
                personal_balance_by_age : personal_balance_by_age,

                service_deficit_by_age_without_effects : service_deficit_by_age_without_effects
            };

            return _.extend(numbers, tables.base_numbers[year]);
        });
        result['2013'] = model2013;

        // we need to calculate the deficit for both years before we can
        // calculate debt for 2025.
        var r2016 = result['2016'];
        var r2025 = result['2025'];

        var average_deficit = (r2016.deficit + r2025.deficit) / 2.0;

        r2025.debt = r2016.debt + 9 * average_deficit - 27000;
        r2016.debt_gdb_ratio = r2016.debt / r2016.gdb;
        r2025.debt_gdb_ratio = r2025.debt / r2025.gdb;

        r2025.public_net_wealth = r2016.public_net_wealth - 9 * average_deficit + 27000;

        // Kotitalouksien reaalivarallisuus
        var average_private_surplus
            = (r2016.private_surplus + r2025.private_surplus) / 2.0;
        r2025.private_net_wealth
            = (r2025.private_net_wealth || 0)
            + r2016.private_net_wealth + 9 * average_private_surplus;

        return result;
    }
    return { calculate : calculate };
})();