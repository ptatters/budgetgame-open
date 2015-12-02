var questions_popup = (function() { "use strict";
    var aux = window.aux;
    var _ = window._;
    var $ = window.$;
    var log = aux.log;
    var data = window.budjettipeli_data;
    var tables = window.table_data;


    //====================================================================
    //  Questions form
    //====================================================================
    function make_questions_pane(args) {
        var group_id = args.group_id;
        var options = args.options;
        var columns = args.columns;
        var sicon_id = args.sicon_id;
        var recalculate_shares = args.recalculate_shares || function () {};
        $('.question-popup-holder').empty();

        log("make_questions_pane");
        var application_state = window.application_state;
        var answers = application_state.answers;

        _.each(options, function(option) {
            if (option.percentage === undefined && option.key) {
                option.percentage = application_state.income_factors[option.key];
            }
        });

        var $popup = $('#question-popup-template').clone();
        var $content = $('#' + group_id).clone();

        var $popup_content = $popup.find('.question-popup-content');
        $popup_content.css({visibility: 'hidden'});
        $popup_content.append($content.find('h3.question-title')); // move title up in tree, outside of scrollable area
        $popup_content.append($content);
        $content.append($('<br class="clear">'));

        var qs = data.questions();
        var groups = {};
        var the_questions = _.map($content.find('.question'), function($div) {
            var q = qs[$div.id];
            groups[q.target || group_id] = true;
            return q;
        });
        var shown_questions = the_questions;

        $('.question-popup-holder').append($popup);
        $content.css({'max-height': ($(window).height() - 230) + 'px'}).isolatedScroll();

        var done_event = aux.event();
        var change_event = aux.event();


        function make_chart(columns, options, $column_chart, $bar_control, apply_income_factors) {
            var chart = window.column_chart.make_column_chart(
                columns,
                options,
                $column_chart,
                $bar_control,
                apply_income_factors
            );
            if ($bar_control) {
                chart.on_button_click(function(event) {
                    var option = event.option;
                    var change = event.change;

                    if (option.key) {
                        // income factors

                        option.percentage = Math.max(0, option.percentage + change);
                        application_state.income_factors[option.key] = option.percentage;

                    } else {
                        // expense factors

                        var fract = option.percentage % 1;
                        if (fract !== 0) {
                            change = (change < 0) ? -fract : 1 - fract;
                        }
                        var deficit = options[0];

                        //change = Math.min(deficit.percentage, change);
                        //if (deficit.percentage - change < 0) { return; }

                        if (option.percentage + change < 0) { return; }

                        deficit.percentage -= change;
                        option.percentage += change;
                        answers.shares[group_id][option.index] = option.percentage;
                    }

                    recalculate_shares();
                    chart.update();
                    change_event.fire();
                });
            }
            return chart;
        }

        var charts;

        var fixed_columns = _.map(columns, function(column) {
            var fixed = _.extend({}, column);
            fixed.percentages = [0].concat(tables.expenses_default_shares[group_id] || [100]);
            return fixed;
        });

        function make_charts() {
            charts = [];
            charts.push(make_chart(
                columns,
                options,
                $popup.find('.effects-chart'),
                $popup.find('.bar-control'),
                true
            ));

            var $placeholder = $popup.find('#bars-placehholder'); // sic!
            if ($placeholder.length > 0) {
                var $div = $('<div class="column-chart business-as-usual-chart"></div>');
                $placeholder.replaceWith($div);
                charts.push(make_chart(
                    fixed_columns,
                    options,
                    $div,
                    false
                ));
            }
        }

        make_charts();


        $content.find('.info-link')
            .html('<img src="images/infodots.png" alt="&hellip;" class="infodots">')
            .attr('target', '_blank')
            .attr('href', 'http://fi.opasnet.org/fi/Hyvinvointibudjetti');

        var buttons_by_question_id = {};
        var unchecked_count = 0;

        function answer_question(question, checked) {
            var qid = question.id;

            if (!!answers.questions[qid] == !!checked) {
                // no change!
                return false;
            }
            var $button = buttons_by_question_id[qid];
            $button.toggleClass('checked');
            $button.toggleClass('unchecked');

            answers.questions[qid] = !!checked;

            var effect = question.effect_as_percentage_of_total_need * 100;
            if (!checked) { 
                effect = -effect;
            }

            var target = question.target || group_id;

            if (answers.shares[target]) {
                // expenses

                // effect = aux.clamp(
                //     effect,
                //     -options[1].percentage,
                //     options[0].percentage
                // )

                options[0].percentage -= effect; // service deficit
                options[1].percentage += effect; // public expenses

                answers.shares[target][0] += effect; //options[1].percentage;
            } else {
                // income

                var option = _.find(options, { key : question.target });
                log(question, options);
                option.percentage = Math.max(0, option.percentage + effect);
                application_state.income_factors[option.key] = option.percentage;
            }
        }

        var question_group_titles = {
            'elinkeinoelama' : 'Elinkeinoelämän edistäminen',
            'maanpuolustus'  : 'Maanpuolustus',
            'julkishallinto' : 'Yleinen julkishallinto',
            'muu_julkinen'   : 'Muut julkiset menot'
        }


        $content.find('.question').each(function() {
            var $q = $(this);
            var qid = this.id;

            var checked = !!answers.questions[qid];

            var $table = $(''
                + '<table class="subquestion"><tr>'
                +   '<td class="checkbox">'
                +       '<button type="button" '
                +           'class="' + (checked ? 'checked' : 'unchecked')
                +           '">'
                +       '</button>'
                +   '</td>'
                +   '<td class="question-content"></td>'
                + '</tr></table>'
            );

            $q.replaceWith($table);
            $table.find('.question-content').append($q);

            buttons_by_question_id[qid] = $table.find('button');
            unchecked_count += checked ? 0 : 1;

            var question = data.questions()[qid];

            if (question_group_titles[question.target]) {
                $q.append('<p class="question-group">'
                    + 'Vaikuttaa haaraan: '
                    + question_group_titles[question.target]
                    + '</p>'
                );
            }

            $table.bind('click', function(event) {
                var checked = !answers.questions[question.id];
                answer_question(question, checked);
                unchecked_count += checked ? -1 : 1;
                if (unchecked_count == 0 || (unchecked_count == 1 && !checked)) {
                    toggle_select_all();
                }
                update();
                change_event.fire();
                event.preventDefault();
            });
        });

        // add special select all checkbox
        var select_all_state = false;
        var $select_all = $(''
            + '<table class="subquestion select-all"><tr>'
            +   '<td class="checkbox">'
            +       '<button type="button" class="'
            +           (unchecked_count == 0 ? 'checked' : 'unchecked')
            +           '" style="margin-top:0px">'
            +       '</button>'
            +   '</td>'
            +   '<td class="question-content">'
            +       '<div class="question checkbox">'
            +           '<h5>Valitse kaikki</h5>'
            +           '<p></p>'
            +       '</div>'
            +   '</td>'
            + '</tr></table>'
        );
        $content.find('table.subquestion').first().before($select_all);

        function update() {
            recalculate_shares();
            _.each(charts, function(chart) {
                chart.update();
            });
        }

        function toggle_select_all() {
            var $select_all_button = $select_all.find('button');
            $select_all_button.toggleClass('checked');
            $select_all_button.toggleClass('unchecked');
        }

        $select_all.bind('click', function(event) {
            toggle_select_all();

            if (unchecked_count == 0) {
                // all checked already
                _.each(shown_questions, function(question) {
                    answer_question(question, false);
                    unchecked_count++;
                });
            } else {
                _.each(shown_questions, function(question) {
                    if (!answers.questions[question.id]) {
                        answer_question(question, true);
                        unchecked_count--;
                    }
                });
            }
            update();
            change_event.fire();
            event.preventDefault();
        });

        function close_question_popup() {
            log("close_question_popup");
            $popup.fadeOut(200, function() { $popup.remove(); });
            $('.contentbox').fadeTo(200, 1);
            window.footer.enable();
            window.budjettipeli.enable_main_content();
        }

        var $close_button = $popup.find('.close-button');

        $close_button.bind('click', function(event) {
            close_question_popup();
            done_event.fire();
            event.preventDefault();
        });

        $popup.find('.cancel-button').bind('click', function(event) {
            log("CANCEL");

            _.each(shown_questions, function(question) {
                delete answers.questions[question.id];
            });
            $popup.find('.checkbox').find('button')
                .removeClass('checked')
                .addClass('unchecked');

            if (group_id == 'combined4') {
                var branches = [
                    "julkishallinto",
                    "maanpuolustus",
                    "elinkeinoelama",
                    "muu_julkinen"
                ];
                _.each(branches, function(branch) {
                    var percs = _.clone(tables.expenses_default_shares[branch]);
                    answers.shares[branch] = percs;
                });
                recalculate_shares();

            } else if (tables.expenses_default_shares[group_id]) {
                var percs = _.clone(tables.expenses_default_shares[group_id]);
                answers.shares[group_id] = percs;

                options[0].percentage = 100 - aux.sum(percs);
                 _.each(options, function(option) {
                    if (option.index != undefined) {
                        option.percentage = percs[option.index];
                    }
                });

            } else {
                _.each(options, function(option) {
                    if (option.key) {
                        application_state.income_factors[option.key] = 100;
                        option.percentage = 100;
                    }
                });
            }
            unchecked_count = _.size(shown_questions);

            make_charts();
            change_event.fire();
            //close_question_popup();
            event.preventDefault();

        });

        //====================================================================
        // Animate point of origin
        //====================================================================

        var anim_box = $('<div class="pre-animation"></div>');
        var start_offsets = $('#'+sicon_id).offset();
        anim_box.css({
            top: ( start_offsets.top+10 - $(window).scrollTop() ) + 'px',
            left: ( start_offsets.left+10 ) + 'px',
            width: 10 + 'px',
            height: 10 + 'px'
        });

        $('.question-popup-holder').append(anim_box);
        var content_offsets = $popup_content.offset();
        anim_box.animate({
            top: content_offsets.top + 'px',
            left: content_offsets.left + 'px',
            width: $popup_content.width() + 'px',
            height: $popup_content.height() + 'px'
        }, 500, function(){
            $popup_content.css({visibility: 'visible'});
            anim_box.remove();

            // attach FB comments box
            var right_col = $content.find('.right-column').append(''
                +   '<div class="fb-comments"'
                +       ' data-href="' + document.location.origin + '/#' + group_id + '"'
                +       ' data-width="441"'
                +       ' data-numposts="3"'
                +       ' data-colorscheme="light">'
                +   '</div>'
            );
            FB.XFBML.parse( right_col.get(0) );
        });

        return {
            on_done : done_event.react,
            on_change : change_event.react,

            update : update
        }
    }

    return {
        make_questions_pane : make_questions_pane,
        remove: function(){
            $('.question-popup-holder').empty();
            $('.contentbox').fadeTo(200, 1);
            window.budjettipeli.enable_main_content();
            window.budjettipeli.recreate_sankey();
        }
    };

})();

// jQuery prevent scroll plugin. Prevents body scrolling when mousewheeling overflow scoll DIV
$.fn.isolatedScroll = function() {
    this.bind('mousewheel DOMMouseScroll', function (e) {
        var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
            bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
            topOverflow = this.scrollTop <= 0;

        if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
            e.preventDefault();
        }
    });
    return this;
};