{{
    // expand the main.html template with the php code that retrieves
    // the budget data from the database

    T.include(T.built('main.html'), {
        stored_budget_data : T.expand('get_stored_budget_data.php')
    });
}}
