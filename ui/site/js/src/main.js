/* global $ */
window.budjettipeli = (function() { "use strict";
    var aux = window.aux;
    var log = aux.log;

    var disabled_elements = [];

    function disable_main_content() {
        $('.base-page').find('a, button, span').each(function(it) {
            if (this.tabIndex !== -1) {
                disabled_elements.push({ element : this, index : this.tabIndex});
                this.tabIndex = -1;
            }
        });
    }

    function enable_main_content() {
        _.each(disabled_elements, function(it) {
            it.element.tabIndex = it.index;
        });
    }

    $('.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        var $target = $($anchor.attr('href'));
        aux.scroll_page_top($target.offset().top, 1200);
        event.preventDefault();
    });

    //========================================================================
    //  Header (year boxes)
    //========================================================================
    function update_header(model) {
        var model = model || budjettipeli_model.calculate(application_state);

        var active_year = application_state.active_year;

        var $years = $('.header').find('.years');

        // choose whether to show deficit or surplus in the year boxes, based
        // on the active year.
        var use_deficit = model[active_year].deficit >= 0;

        // set the deficit/surplus label
        $years.find('.deficit-label').html(
            use_deficit ? 'Alijäämän' : 'Ylijäämän'
        );

        // Update header yearbox values
        $years.find('.yearbox').each(function() {
            var $this = $(this);
            var year = $this.find('.year').html();

            $this.find('.debt-gdb-ratio').html(
                aux.format_decimal(100 * model[year].debt_gdb_ratio, 1)
            );

            var deficit_gdb_ratio = use_deficit
                ? model[year].deficit_gdb_ratio
                : -model[year].deficit_gdb_ratio;

            log("DGR", deficit_gdb_ratio);

            $this.find('.deficit-gdb-ratio').html(
                aux.format_decimal(100 * deficit_gdb_ratio, 1)
            );

            $this.find('.service-deficit').html(
                aux.format_decimal(model[year].service_deficit, -1)
            );


            var def0 = aux.format_decimal(model[year].service_deficit, -1) == "0";
            $this.find('.yeardef').toggleClass('deficit-zero', def0);

        });
    }

    function make_service_changes_pane() {
        var application_state = window.application_state;
        var $service_changes = $('.service_changes');
        $service_changes.empty();
        var ul = $('<ul></ul>').appendTo($service_changes);

        $('.question-templates').find('.question-view').each(function() {
            var answers = application_state.answers;
            $(this).find('.question').each(function() {
                if (answers.questions[this.id]) {
                    var title = $(this).find('h5').html();
                    var $button = $(''
                        +   '<button type="button">'
                        +       '<img class="checked"'
                        +           ' src="images/checkbox_ON.png"'
                        +           ' alt="">&emsp;'
                        +       title
                        +   '</button>'
                    );
                    $button.bind('click', function() {
                        show_questions_pane();
                        event.preventDefault();
                    });

                    ul.append($('<li></li>').append($button));
                }
            });
        });
    }

    function show_deficit_by_age(model) {
        var tables = window.table_data;
        var year = application_state.active_year;

        $('.active_year').html(year);

        function get_graph_data(table) {
            var result = { };
            _.each(table, function(value, ix) {
                  result[(ix*5 + 2) + ".5"] = value.total
            })
            return result;
        }

        var graph_data = {
            'year-2013': get_graph_data(model['2013'].service_deficit_by_age),
            'current-year': get_graph_data(model[year].service_deficit_by_age),
            'current-year-without-effects': get_graph_data(model[year].service_deficit_by_age_without_effects),
        };

        $('.area-diagram').empty();
        var screen = {
            width: 700,
            height: 380,
            on: function() {},
            screen: d3.select('.area-diagram')
        };
        new AREA(screen, graph_data);

        // Show totals
        var income_sum = aux.sum(graph_data['current-year'], function (a) {
            return Math.max(0,a);
        });
        var expense_sum = aux.sum(graph_data['current-year'], function (a) {
            return Math.min(0,a);
        });

        $('.age-graph-label-income').html(  aux.format_decimal(income_sum, -1) + ' M€');
        $('.age-graph-label-expense').html( aux.format_decimal(Math.abs(expense_sum), -1) + ' M€');


        // var $table = $('<table></table>').append(
        //     $('<tr><th>Ikäryhmä</th></tr>').append(
        //         _.map(years, function(year) {
        //             return '<th>' + year + '</th>';
        //         })
        //     ),
        //     _.map(tables.age_groups, function(age_group, age_ix) {
        //         return $('<tr><th>' + age_group + '</th></tr>').append(
        //             _.map(years, function(year) {
        //                 var rec =  model[year].service_deficit_by_age[age_ix];
        //                 return ''
        //                     + '<td>'
        //                     //+  Math.round(rec.total)
        //                     +  model[year].personal_balance_by_age[age_ix]
        //                     + '</td>';
        //             })
        //         );
        //     })
        // );
        // $('.area-diagram').append($table);
    }

    var model;
    var model_change_event = aux.event();
    var on_model_changed = model_change_event.react;

    function evaluate_model() {
        model = budjettipeli_model.calculate(application_state);
        model_change_event.fire(model);
    }

    var sankey_diagram = null;

    function recreate_sankey() {
        var application_state = window.application_state;
        var data = window.budjettipeli_data;

        evaluate_model();
        show_deficit_by_age(model);

        var year_model = model[application_state.active_year];

        if (sankey_diagram) {
            // sankey diagram is already created. Update it with the new model.
            sankey_diagram.update(year_model);
            return;
        }
        sankey_diagram = sankey_bridge.initialize(year_model);
        sankey_diagram.on_open_pane(function(event) {
            show_questions_pane();
            var tables = window.table_data;
            //var year = application_state.active_year;

            var group_id = event.id;
            var pane;

            var branches = [
                "julkishallinto",
                "maanpuolustus",
                "elinkeinoelama",
                "muu_julkinen"
            ];

            if (event.type == "expenses") {

                var get_total = function (year, group_id_) {
                    group_id_ = group_id_ || group_id;

                    // get growth factor
                    var gdb_adjustment = application_state.gdb_adjustment;
                    var growth = ((tables.growth_factors[year] || {})[group_id_] || {})[gdb_adjustment] || 1;

                    if (group_id_ == "combined4") {
                        return aux.sum(branches, function(branch_id) {
                            return get_total(year, branch_id);
                        });
                    } else {
                        var expenses_by_year = data.expenses_by_year_by_retirement[group_id_];
                        var value = expenses_by_year[year]
                        if (typeof(value) == 'number') { 
                            return value * growth;
                        } else { 
                            var career_adjustment = application_state.career_adjustment;
                            return value[career_adjustment] * growth;
                        }
                    }
                }

                var percentages = application_state.answers.shares[group_id] || [100];

                var options = [
                    {   name : "Vähennykset palveluihin"
                    ,   color : 'light-grey'
                    ,   percentage : 100 - aux.sum(percentages)
                    ,   control_priority : 2
                    ,   control_buttons : ''
                        +   '<td><div class="deficit no-button"></div></td>'
                    },
                    {   name : "Julkisyhteisöt"
                    ,   color: 'blue'
                    ,   percentage : percentages[0]
                    ,   index : 0
                    },
                ];

                if (group_id == 'terveys' || group_id == 'koulutus' || group_id == "perhepolitiikka") {
                    options.push(
                        {   name : "Palvelumaksut"
                        ,   color: 'orange'
                        ,   percentage : percentages[1]
                        ,   index : 1
                        },
                        {   name : "Vapaaehtoinen kulutus"
                        ,   color: 'yellow'
                        ,   percentage : percentages[2]
                        ,   index : 2
                        }
                    );
                }

                var columns = [
                    {   caption : '2013'
                    ,   get_total : function() {
                            return get_total('2013');
                        }
                    ,   label : 'Kokonaistarve'
                    },
                    {   caption : '2016'
                    ,   get_total : function() {
                            return get_total('2016');
                        }
                    ,   label : 'Kokonaistarve'
                    },
                    {   caption : '2025'
                    ,   get_total : function() {
                            return get_total('2025');
                        }
                    ,   label : 'Kokonaistarve'
                    }
                ];

                var recalculate_shares;
                if (group_id == 'combined4') {
                    var recalculate_shares = function() {
                        _.each(columns, function(column) {
                            var year = column.caption;
                            var share = 0;
                            var tot = 0;
                            _.each(branches, function(branch_id) {
                                var total = get_total(year, branch_id);
                                var percs = application_state.answers.shares[branch_id] || [100];
                                tot += total;
                                share += total * percs[0] * 0.01;
                            });
                            var total_share = share / tot * 100;
                            column.percentages = [100 - total_share, total_share];
                            console.log("PERCS", column.percentages);
                        });
                        options[0].percentage = columns[1].percentages[0];
                        options[1].percentage = columns[1].percentages[1];
                    }
                    recalculate_shares();
                }

                pane = questions_popup.make_questions_pane({
                    group_id : group_id,

                    options : options,
                    columns : columns,
                    sicon_id: event.sicon_id,

                    group_ids: group_id == "maanpuolustus"
                        ? ["julkishallinto", "maanpuolustus"]
                        : null,

                    recalculate_shares: recalculate_shares

                });
            } else {
                var columns = [
                    {   caption : '2013'
                    ,   get_values : function(key) { return model['2013'].base_income[key]; }
                    ,   scale : 0.8
                    },
                    {   caption : '2016'
                    ,   get_values : function(key) { return model['2016'].base_income[key]; }
                    ,   scale : 0.8
                    },
                    {   caption : '2025'
                    ,   get_values : function(key) { return model['2025'].base_income[key]; }
                    ,   scale : 0.8
                    }
                ];
                var options_by_group = {
                    "valilliset_verot" : [
                        {   name : 'Välilliset verot',
                            color : 'teal-dark',
                            hide_percentage : true,
                            key : 'valilliset_verot'
                        }
                    ],
                    "sotumaksut" : [
                        {   name : 'Työnantajan sosiaaliturvamaksut',
                            color : 'teal-medium',
                            hide_percentage : true,
                            key : 'sotumaksut'
                        }
                    ],
                    "tuloverot" : [
                         {   name : 'Verot ja veronluonteiset maksut',
                            color : 'orange',
                            key : 'tuloverot',
                            hide_percentage : true
                        }
                    ]
                }
                pane = questions_popup.make_questions_pane({
                    group_id : group_id,
                    options : options_by_group[group_id],
                    columns : columns,
                    sicon_id: event.sicon_id
                });
            }

            current_question_popup = pane;
            pane.on_done(function() {
                current_question_popup = null;
                make_service_changes_pane();
                recreate_sankey();
            });
            pane.on_change(function() {
                update_header();
            });

        });
    }

    function show_questions_pane() {
        $('.contentbox').fadeTo(400, 0.5);
        $('.question-popup-holder').css({ display : 'block' });

        disable_main_content();
        window.footer.disable();

        aux.scroll_page_top(0, 400, { complete : function() {
            /*
            $('.question-popup-holder').css({
                position: 'absolute'
            });
            $('.header').css({
                position: 'absolute'
            });
            */
        }});
    }

    var current_question_popup = null;

    $(function() {

        //====================================================================
        //  Career adjustment dropdown
        //====================================================================
        window.dropdown.bind_button({
            $trigger : $('.show-retirement-menu'),
            template : $('.retirement-popup-template').html(),
            options : [
                { value : "-1", label : '-1v' },
                { value :  "0", label : '0v' },
                { value :  "1", label : '+1v'  },
                { value :  "2", label : '+2v' }
            ],
            bind : {
                object : application_state,
                property : 'career_adjustment'
            },
            on_selected : function() {
                if (current_question_popup) {
                    evaluate_model();
                    current_question_popup.update();
                } else {
                    recreate_sankey();
                }
            }
        });

        //====================================================================
        //  GDB dropdown
        //====================================================================
        window.dropdown.bind_button({
            $trigger : $('.show-gdb-menu'),
            template : $('.gdb-popup-template').html(),
            options :  window.table_data.gdb_options,
            bind : {
                object : application_state,
                property : 'gdb_adjustment'
            },
            on_selected : function() {
                if (current_question_popup) {
                    evaluate_model();
                    current_question_popup.update();
                } else {
                    recreate_sankey();
                }
            }
        });

        //====================================================================
        //  Year selection
        //====================================================================
        $('.yearbox').bind('click', function(event) {
            $('.yearbox').removeClass('active-year');
            $(this).addClass('active-year');
            var year = $(this).find('.year').html();
            window.application_state.active_year = year;
            recreate_sankey();
        });

        on_model_changed(update_header);

        //====================================================================
        //  Sharing
        //====================================================================
        var saved_url = "";
        function save_to_server() {
            var $share_section = $('.share-section');
            window.application_state.budget_info = {
                title : $share_section.find('.budget_title')[0].value,
                description : $share_section.find('.budget_description')[0].value
            };

            var data = { data: aux.deepcopy(window.application_state) };
            log("sending:", JSON.stringify(data));
            $.ajax({
                type : 'POST',
                url : 'api/new_budget',
                data : JSON.stringify(data),
                contentType: 'application/json',
                success : function(reply, status) {
                    log("reply:", reply);
                    log("status:", status);
                    saved_url = reply.url;

                    $('.shared-link').html(''
                        + 'Tai kopioi linkki:<br>'
                        + '<a href="' + saved_url + '" target="_blank">'
                        +   saved_url
                        + '</a>'
                    );
                    // update twitter share url
                    var encoded_url = encodeURIComponent(saved_url);
                    $('.fb-button').attr('href', 'https://facebook.com/sharer.php?u=' + encoded_url );
                    $('.twitter-button').attr('href', 'https://twitter.com/intent/tweet?text='+ encodeURIComponent(window.application_state.budget_info.title) +'&tw_p=tweetbutton&url=' + encoded_url );

                    $('.share-popup').css('visibility', 'visible');
                },
                error : function(error) {
                    log("error", error);
                    alert("Yhteys palvelimeen ei toiminut. "
                        + "Voit yrittää myöhemmin uudelleen."
                        + " (status " + error.status + ")");
                }
            });
        }

        $('.share-link').bind('click', function(){
            save_to_server();
        });
        $('.fb-button').bind('click', function(){
            var href = $(this).attr('href');
            window.open(href, '_blank', 'width=600,height=400');
            return false;
        });

        // Could implement better clear here. Now it reloads the page which
        // ok.
        $('.clear-button').bind('click', function(event) { });

        $(function() {
            log("application_state", application_state);
            if (application_state.budget_info) {
                var $share = $('.share');
                $share.find('.budget_title').val(
                    application_state.budget_info.title
                );
                $share.find('.budget_description').val(
                    application_state.budget_info.description
                );

                // $('.share').hide();
                // $('.shared').show();

                // $('.shared').find('h4').html(
                //     aux.format_plain_text_paragraphs(
                //         application_state.budget_info.title
                //     )
                // );

                // $('.shared').find('.description').html(
                //     aux.format_plain_text_paragraphs(
                //         application_state.budget_info.description
                //     )
                // );

                $('.new-budget-clear').click(function(event) {
                    // brute-force solution: avoid possible problems in updating
                    // the application state by reloading the page
                    location.href = "";
                });

                $('.new-budget').click(function(event) {
                    $('.shared').hide();

                    var $share = $('.share');
                    $share.show();
                    $share.find('.budget_title').val(
                        application_state.budget_info.title
                    );
                    $share.find('.budget_description').val(
                        application_state.budget_info.description
                    );

                    event.preventDefault();
                });
            }

            evaluate_model();
            recreate_sankey();

            FastClick.attach(document.body);
        });
    });

    $(function () {

        var agent = window.navigator.userAgent;
        var win_w = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
        var win_h = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;

        if( (agent.match(/android/i) && (win_w < 1024 || win_h < 768) )
        || agent.match(/webOs/i)
        || agent.match(/iphone/i)
        || agent.match(/iPod/i)
        || agent.match(/blackberry/i)
        || agent.match(/windows phone/i)
        || (agent.match(/safari/i) && agent.match(/Version\/[0-7]\./i))
        || (agent.match(/MSIE/i) && agent.match(/MSIE\s[0-9]\./i))
        ) {

            var $alarm = $('#small-screen-alert');
            $alarm.css({ 'display': 'block' });
            $alarm.find('button').click(function () {
                $alarm.css({ 'display': 'none' });
            });
        }
    });

    return {
        enable_main_content : enable_main_content,
        disable_main_content  : disable_main_content,
        recreate_sankey : recreate_sankey,
        get_sankey: function(){return sankey_diagram}
    };
})();