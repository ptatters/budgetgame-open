var application_state = (function() {
    var tables = window.table_data;

    var state = {
        reset : function() {
            _.extend(this, {
                answers : {
                    questions : {},
                    shares : aux.deepcopy(tables.expenses_default_shares)
                },
                active_year : 2016,
                gdb_adjustment : "+1.5",
                career_adjustment : "0",
                income_factors : {
                    "valilliset_verot" : 100,
                    "sotumaksut" : 100,
                    "tuloverot" : 100
                }
            });
        },
        update: function(data){
            _.extend(this, data);
        }
    };
    state.reset();
    return state;
})();
