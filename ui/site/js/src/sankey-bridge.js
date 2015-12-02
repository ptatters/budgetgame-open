var sankey_bridge = (function() { "use strict";
    var aux = window.aux;
    var $ = window.$;
    var _ = window._;
    var log = aux.log;
    var on_refresh_links = window.budjettipeli.on_refresh_links;

    function round(value) {
        return Math.round(value / 10) * 10;
    }

    function make_sankey_data(data) {
        var orange = "#FF8B1A";
        var purple = "#C15096";
        var blue   = "#0778B8";
        var expenses = data.expenses;

        // must use rounded values so that the numbers given to the diagram
        // match exactly.
        var private_expenses_total = aux.sum(expenses, function(it) {
            return round(it['private'] || 0);
        });

        var expense_labels = [
            { id : "julkishallinto", label : "Yleinen julkishallinto"      },
            { id : "elinkeinoelama", label : "Elinkeinoelämän edistäminen" },
            { id : "maanpuolustus",  label : "Maanpuolustus"               },
            { id : "muu_julkinen",   label : "Muut julkiset menot"         },
            { id : "tyottomyys",     label : "TYÖTTÖMYYS"                  },
            { id : "elakkeet",       label : "ELÄKKEET"                    },
            { id : "perhepolitiikka",label : "PERHEPOLITIIKKA"             },
            { id : "terveys",        label : "TERVEYS JA HYVINVOINTI\n" },
            { id : "koulutus",       label : "KOULUTUS"                 },
            { id : "asuminen",       label : "Asuminen"                 },
            { id : "liikenne",       label : "Liikenne"                 },
            { id : "elintarvikkeet", label : "Elintarvikkeet"           },
            { id : "muu_yksityinen", label : "Muut tavarat ja palvelut" }
        ];

        var public_income_labels = [
            {id : 'valilliset_verot', label : 'VÄLILLISET VEROT\n', editable : true},
            {id : 'sotumaksut', label : 'TYÖNANTAJAN\nSOSIAALITURVAMAKSUT\n', editable : true},
            {id : 'muut_tulot', label : 'Muut tulot\n'},
        ];
        var private_income_labels = [
            {id : 'transfers', label : 'Saadut tulonsiirrot\n', color : '#747473'},
            {id : 'salaries', label : 'Palkka- ja yrittäjätulot\n'},
            {id : 'property_income', label : 'Omaisuustulot\n'},
        ];

        var node_id_counter = 0;

       var public_income_nodes = [];
       var private_income_nodes = [];

       _.each(public_income_labels, function (it) {
            public_income_nodes.push({
                dataid : it.id,
                name : it.label,
                id : node_id_counter++,
                editable : it.editable,
                startnode : true,
                color : '#0778B8'
            });
       });

       _.each(private_income_labels, function (it) {
            private_income_nodes.push({
                dataid : it.id,
                name : it.label,
                id : node_id_counter++,
                editable : it.editable,
                startnode : true,
                color : it.color || '#FF8B1A'
            });

       });
       var income_nodes = public_income_nodes.concat(private_income_nodes);

        var private_income_node =
            {   id : node_id_counter++
            ,   name : "KOTITALOUDET\nMenot yhteensä\n"
            ,   color : orange
 //           ,   arrowed : "bot"
            };
        var private_wealth_node =
            {   id : node_id_counter++
            ,   name : "Kotitalouksien\nreaalivarallisuus (netto)\n"
            ,   color : "#AA5F2B"
            ,   onode : true
            };
        private_income_node.olink = private_wealth_node.id;

        var public_expenses_node =
            {   id : node_id_counter++
            ,   name : "JULKISYHTEISÖT\nMenot yhteensä\n"
            ,   color : blue
     //       ,   arrowed : "top"
            };

        var public_wealth_node =
            {   id : node_id_counter++
            ,   name : "Julkisyhteisöjen\nnettorahoitus-\nvarallisuus\n"
            ,   color : "#3B5772"
            ,   onode: true
            ,   cap : 80000
            };
        public_expenses_node.olink = public_wealth_node.id;


        var public_income_links = [];
        var private_income_links = [];
        _.each(public_income_nodes, function (it) {
            public_income_links.push({
                source : it.id,
                target : public_expenses_node.id,
                value : round(data.income[it.dataid])
            });
        });
        _.each(private_income_nodes, function (it) {
            private_income_links.push({
                source : it.id,
                target : private_income_node.id,
                value : round(data[it.dataid])
            });
        });
        var income_links = public_income_links.concat(private_income_links);

        var expense_nodes = [];
        var expense_links = [];
        _.each(expense_labels, function(it) {
            var values = expenses[it.id];
            log(it.id, values);
            var node_id = node_id_counter++;
            expense_nodes.push({
                id : node_id,
                name : it.label,
                editable : values['editable'],
                required : round(expenses[it.id].required)
            });
            if (values['public'] != undefined) {
                expense_links.push({
                    source : public_expenses_node.id,
                    target : node_id,
                    value : round(values['public'])
                });
            }
            if (values['private'] != undefined) {
                expense_links.push({
                    source : private_income_node.id,
                    target : node_id,
                    value : round(values['private'])
                })
            }
        });

        var service_deficit_info_node = {
            name  : "= Vähennykset palveluihin\n(kattamaton osa arvioidusta\nkokonaistarpeesta)",
            color : "#E21D19",
            inode : true
        };

        var private_to_public
            = data.income['tuloverot'];

        return {
            nodes : [
                // level 1 nodes
                income_nodes,
                // level 2 nodes
                [   private_income_node,
                    private_wealth_node
                ],
                // level 3 nodes
                [   public_expenses_node,
                    public_wealth_node
                ],
                // level 4
                expense_nodes.concat([service_deficit_info_node])
            ],
            links : [
                {   source: private_income_node.id
                ,   target: public_expenses_node.id
                ,   value: round(private_to_public)
                ,   editable: true
                ,   name : "VEROT JA\nVERONLUONTEISET\nMAKSUT\n"
                ,   color : '#747473'
                }
            ].concat(income_links, expense_links),
            inputs : [
                {   target: private_wealth_node.id
                ,   value: round(data.private_net_wealth)
                ,   nopath: true
                },
                {   target: public_wealth_node.id
                ,   value: round(data.public_net_wealth)
                ,   nopath: true
                }
            ]
        };
    }

    return {
        initialize : function(data) {
            // Create Sankey diagram
            var sankey_data = make_sankey_data(data);
            log("SANKEY_DATA:", sankey_data);

            var d3diagram = d3.select('.sankey-diagram');
            $(d3diagram[0]).empty()

            var sankey = new _sankey('.sankey-diagram', sankey_data);

            var open_pane_event = aux.event();
            var events = [
                { type : 'income',   id : "valilliset_verot"},
                { type : "income",   id : "sotumaksut" },
                { type : "income",   id : "tuloverot" },

                //{ type : "expenses", id : "julkishallinto" },
                //{ type : "expenses", id : "elinkeinoelama" },
                //{ type : "expenses", id : "maanpuolustus" },
                //{ type : "expenses", id : "muu_julkinen" },
                { type : "expenses", id : "combined4" },


                { type : "expenses", id : "tyottomyys" },
                { type : "expenses", id : "elakkeet" },
                { type : "expenses", id : "perhepolitiikka" },
                { type : "expenses", id : "terveys" },
                { type : "expenses", id : "koulutus" }
            ];

            // Observe clicks on the ?-icons inside the diagram.
            $('.sankey-diagram').find('.sankey_icons').find('.sicon')
                .each(function(ix) {
                    events[ix].sicon_id = this.id; // save element id for popup growth animation
                    $(this).bind('click', function() {
                        open_pane_event.fire(events[ix]);
                        //event.preventDefault();
                    });
                });

            return {
                on_open_pane : open_pane_event.react,
                update : function(data) {
                    // update the existing sankey_data object with new data
                    // and redraw the sankey diagram.
                    sankey.reparse(make_sankey_data(data));
                    sankey.redraw();
                },
                open_pane: function(pane){
                    if(pane >= 0 && pane < events.length){
                        open_pane_event.fire(events[pane]);
                    }
                }
            };
        },
    }
})();
