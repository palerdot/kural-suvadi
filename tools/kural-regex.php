<?php 

require_once("kural-source.php");

$pattern = "/(.*)\n(.*)\n\n(\d+)/";

preg_match_all( $pattern, $subject, $matches, PREG_SET_ORDER );

$output_string = "";

echo "<html><meta charset='UTF-8'><body>";
//echo "hello universe";
//print_r( $matches );
foreach ( $matches as $match ) {
    $output_string .= get_template( $match[1], $match[2], $match[3] ) . ",";
}
print_r( rtrim( $output_string, "," ) );
echo "</body></html>";

function get_template ( $first, $second, $yen ) {

    return "
        {
            \"yen\": \"$yen\",
            \"label\": \"$first $second\"
        }
    ";

}

?>
