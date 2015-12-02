<?
//----------------------------------------------------------------------------
// Open database connection
//----------------------------------------------------------------------------
function open_mysqli_connection() {
    $server   = "{{ options.database.server }}";
    $user     = "{{ options.database.user }}";
    $password = "{{ options.database.password }}";
    $database = "{{ options.database.database }}";

    $mysqli = new mysqli($server, $user, $password, $database);
    if ($mysqli->connect_errno) {
        die ("Failed to connect to MySQL: ("
            . $mysqli->connect_errno . ") "
            . $mysqli->connect_error);
    }
    return $mysqli;
}

$database_tablesp

?>