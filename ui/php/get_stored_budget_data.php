<?
require('dbconnect.php');
$mysqli = open_mysqli_connection();
$saved_budgets = "{{ options.database.table_prefix + 'saved_budgets' }}";

$id = $_GET["id"];
$escaped_id = $mysqli->real_escape_string($id);

$query = "
    SELECT *
    FROM $saved_budgets
    WHERE public_id = '$escaped_id'
";
$result = $mysqli->query($query) or die("Query failed.");
if ($result->num_rows != 1) {
    header('HTTP/1.0 404 Not Found');
    exit(0);
}
$record = $result->fetch_object();
echo "
    <script>
        window.application_state.update( $record->data );
    </script>
";
?>