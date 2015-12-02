var column_chart = (function() {
    var _ = window._;
    var $ = window.$;
    var aux = window.aux;
    var log = aux.log;

    var make_the_chart = function(charts, total_max) {
        var max_height = 120;

        var labels = _.map(charts, function(chart) {
            return _.map(chart.bars, function() {
                return $('<div class="label">xxx</div>')[0];
            });
        });
        var barcells = _.map(charts, function(chart) {
            return _.map(chart.bars, function(bar) {
                return $('<td class="bar-' + bar.class_ + '"></td>')[0];
            });
        });

        var stack_labels = [];

        var $table = $('<table class="stack-bars">').append(
            $('<tr></tr>').append(
                aux.interleave(
                    _.map(labels, function(divs, ix) {
                        var labels = $('<div class="label-cont"></div>').append(divs);
                        return $('<td class="labels column' + ix + '"></td>').append(labels);
                    }),
                    _.map(barcells, function(tds, ix) {

                        var bar = $('<td class="stack-bar-container column' + ix + '"></td>')
                            .height(max_height+1);

                        if (charts[ix].label != undefined) {

                            var $stack_label = $('<div class="stack-bar-label-cont"><div>');
                            var $cont = $('<div class="stack-bar-label"></div>');
                            $cont.append('<span class="stack-bar-span">Kokonaistarve</span>');
                            $cont.append('<div class="stack-bar-arw"></div>');
                            $cont.append('<div class="stack-bar-line"></div>');
                            $stack_label.append($cont);
                            stack_labels[ix] = $stack_label;
                            bar.append($stack_label);
                        }

                        bar.append(
                                $('<table class="stack-bar"></table>').append(
                                    _.map(tds, function(td) {
                                        return $('<tr></tr>').append(td);
                                    })
                                )
                            );
                        return bar;
                    }),
                    _.map(_.range(charts.length-1), function() {
                        return $('<td class="empty-space"></td>');
                    })
                ),
                $('<td></td>')
            ),
            $('<tr></tr>').append(
                aux.interleave(
                    _.map(charts, function(chart, ix) {
                        var th1 = (ix == 0)
                            ? '<th class="bordering column0"></th>'
                            : '<th></th>';

                        return $(th1 + '<th class="column' + ix + '">'
                                + chart.title + '</th>');
                    }),
                    _.map(_.range(charts.length-1), function() {
                        return $('<th></th>');
                    })
                ),
                $('<th class="bordering"></th>')
            )
        )

        var scale = max_height;

        function update(charts, fst) {
            log("CHARTS", charts);
            var totals = _.map(charts, function(chart, ix) {
                return aux.sum(_.pluck(chart.bars, 'value'));
            });

            scale = max_height / (total_max || _.max(totals));


            _.each(charts, function(chart, chart_index) {
                var cumulative = 0;
                var prev_bottom = -100;
                var bars = chart.bars;

                scale *= fst ? chart.scale || 1 : 1;

                if (stack_labels[chart_index]) {
                    var deficit = totals[chart_index]*scale;
                    stack_labels[chart_index].toggleClass('toblack', bars[0].value < 0);
                    stack_labels[chart_index].find('.stack-bar-label').css('bottom', deficit + 'px');
                }

                var total_h = Math.round(totals[chart_index] * scale);
                for (var bar_index = bars.length-1; bar_index >= 0; --bar_index) {
                    var value = bars[bar_index].value;
                    var label = labels[chart_index][bar_index];
                    var barcell = barcells[chart_index][bar_index];
                    if (value <= 0) {
                        label.innerHTML = "";
                        barcell.style.height = '0';
                        barcell.style.visibility = 'hidden';
                    } else {
                        var height = bar_index > 0
                            ? Math.round(value * scale)
                            : total_h - cumulative;
                        var bottom = Math.max(
                            cumulative + height/2 - 8,
                            prev_bottom + 12
                        );
                        prev_bottom = bottom;
                        cumulative += height;
                        barcell.style.height = height + 'px';
                        label.style.bottom = bottom + "px";
                        label.innerHTML = aux.format_decimal(value, -1) + " M€";
                        barcell.style.visibility = 'inherit';
                    }
                }
            });
        }
        update(charts, true);
        return {
            $table : $table,
            update : update
        }
    }

    return {
        make_column_chart : function(
            columns,
            options,
            $column_chart,
            $bar_control,
            apply_income_factors
        ) {
            log("COLUMNS", columns);
            log("OPTIONS", options);

            var on_change = aux.event();

            console.log("$bc", $bar_control);

            var allow_manual_change = $bar_control && !$bar_control.hasClass('no-control');

            var total_max;

            function make_columns(options) {
                return  _.map(columns, function(column) {
                    return {
                        title : column.caption,
                        label : column.label,
                        scale : column.scale,
                        total : column.get_total && column.get_total(),
                        bars : _.map(options, function(option, ix) {
                            var perc = column.percentages
                                ? column.percentages[ix]
                                : option.percentage;
                            log("OO", ix, option, column.percentages);

                            if (option.key) {
                                var val = column.get_values(option.key);
                                if (total_max === undefined || val > total_max) {
                                    total_max = val;
                                }
                            }
                            return {
                                value  : option.key
                                    ? (apply_income_factors
                                        ? perc * 0.01 * column.get_values(option.key)
                                        : column.get_values(option.key)
                                    )
                                    : perc * 0.01 * column.get_total()
                                ,
                                label  : option.name,
                                class_ : option.color
                            }
                        })
                    };
                });
            }

            var chart = make_the_chart(
                make_columns(options),
                total_max
            );

            $column_chart.html(chart.$table);

            function control_button(label, color) {
                return $('<button type="button" class="bar-'
                    + color + ' butt">'+ label + '</button>');
            }

            function format_number(num) {
                if (num === undefined) {
                    return "undef";
                }
                if (num % 1 == 0) { 
                    return num;
                } else {
                    return num.toFixed(1);
                }
            }

            var button_click_event = aux.event();

            function sort_options_for_control(options) {
                return _.sortBy(options, function(it) {
                    return it.control_priority || 0;
                });
            }
            if ($bar_control) {
                $bar_control.html(
                    _.map(sort_options_for_control(options),
                        function(option, ix) {
                            var buttons;
                            if (option.control_buttons) {
                                buttons = option.control_buttons;
                            } else if (allow_manual_change) {
                                buttons = $('<td></td>').append(
                                    control_button('-', option.color)
                                        .bind('click', function(event) {
                                            button_click_event.fire({
                                                option : option,
                                                change : -1
                                            });
                                        }),
                                    control_button('+', option.color)
                                        .bind('click', function(event) {
                                            button_click_event.fire({
                                                option : option,
                                                change : 1
                                            });
                                        })
                                )
                            } else {
                                buttons = '<td><div class="bar-' + option.color
                                        + ' no-button"></div></td>';
                            }
                            return $('<tr></tr>').append(
                                '<td class="label">' + option.name + '</td>',
                                buttons,
                                '<td class="percentage"' +
                                    (option.hide_percentage
                                        ? ' style="visibility:hidden"'
                                        : ''
                                    )+
                                    '>' + format_number(option.percentage) + ' %'
                                + '</td>'
                        );
                    })
                );
            }
            function update_bars(options) {
                chart.update(make_columns(options));
            }

            function update() {
                update_bars(options);
                var ix = 0;
                var sorted_options = sort_options_for_control(options);
                if ($bar_control) {
                    $bar_control.find(".percentage").each(function() {
                        $(this).text(format_number(sorted_options[ix++].percentage) + ' %');
                    });
                }
            }

            update_bars(options);

            return {
                on_change : on_change.react,
                on_button_click : button_click_event.react,

                update : update

            };
        }
    };
})();
