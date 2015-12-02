<?
require('dbconnect.php');
$mysqli = open_mysqli_connection();
$saved_budgets = "{{ options.database.table_prefix + 'saved_budgets' }}";

//----------------------------------------------------------------------------
// Create the saved_budgets table, if not already done
//----------------------------------------------------------------------------
$query = "
    CREATE TABLE IF NOT EXISTS $saved_budgets (
        sequential_id int(6) NOT NULL auto_increment,
        public_id CHAR(16) NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data TEXT NOT NULL,

        PRIMARY KEY (sequential_id),
        UNIQUE (sequential_id),
        UNIQUE (public_id)
    )
";
$mysqli->query($query) or die("Unable to create table("
    . $mysqli->errno . ") "
    . $mysqli->error
);

//----------------------------------------------------------------------------
// Create index on public_id, if not already done
//----------------------------------------------------------------------------
$query = "
    CREATE INDEX budget_by_public_id ON $saved_budgets(public_id)
";
if (!$mysqli->query($query) && $mysqli->errno != 1061) {
    // index creation failed, and the reason was not that the index already
    // exists.
    die("Unable to create index("
        . $mysqli->errno . ") "
        . $mysqli->error
    );
}

?>