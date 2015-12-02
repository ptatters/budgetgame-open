<?
/*  This implements the API call to store a budget into the database.
    It expects a POST request with a body of JSON-encoded data. The request
    body must be an object with a 'data' field. The contents of this field
    are written in the database. The request returns a JSON object with
    'id', the generated public id for the new stored budget, and 'url', an
    URL that is used to access the stored budged.

    INPUT (JSON):
            {
                data : { // ... whatever JSON data

                }
            }

    OUTPUT (JSON):
            {   id : "XXXXXXXX" // 8-character unique identifier
            ,   url : "http://budjettipeli.fi/budjetti/XXXXXXXX"
            }

*/

require('dbconnect.php');
$mysqli = open_mysqli_connection();
$saved_budgets = "{{ options.database.table_prefix + 'saved_budgets' }}";
$base_url = '{{ options.base_url }}';

function generate_random_public_id() {
    // Brute forcey approach: try 1000 times to find a id with no special
    // characters. If still notf found, replace the special characters with
    // 'x' and 'X'.
    for ($tries = 0; $tries < 1000; ++$tries) {
        $it = base64_encode(fread(fopen('/dev/urandom', 'r'), 6));
        if (strpos($it, '/') === false && strpos($it, '+') === false) {
            return $it;
        }
    }
    $it = str_replace('/', 'x', $it);
    $it = str_replace('+', 'X', $it);
    return $it;
}

$data = json_decode(file_get_contents('php://input'))->data;
$escaped_data = $mysqli->real_escape_string(json_encode($data));

for ($tries = 0; ; ++$tries) {
    $public_id = generate_random_public_id();

    $query = "
        INSERT INTO $saved_budgets (public_id, data)
        VALUES ('$public_id', '$escaped_data');
    ";
    if ($mysqli->query($query)) {
        // Success!
        break;
    }
    $error = "Unable to insert (" . $mysqli->errno . ") " . $mysqli->error;
    error_log($error);
    if ($tries === 5) {
        die($error);
    }
}

header('Content-Type: application/json');
echo json_encode(array(
    'id' => $public_id,
    'url' => "$base_url/budjetti/$public_id"
));

?>