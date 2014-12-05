<?php 

require_once("porul-source.php");

$pattern = "/(.*)\n\n(\d+)/";

preg_match_all( $pattern, $subject, $matches, PREG_SET_ORDER );

$output_string = "";


echo "<html><meta charset='UTF-8'><body>";

//test_porul( $matches );

foreach ( $matches as $match ) {
    $output_string .= get_template( $match[1], $match[2] ) . ",";
}
print_r( rtrim( $output_string, "," ) );
echo "</body></html>";

function get_template ( $porul, $yen ) {

    return "
        {
            \"yen\": \"$yen\",
            \"porul\": \"$porul\"
        }
    ";

}

function test_porul( $matches ){

    $test_status = ""; 
    $count = 1;
    
    foreach ( $matches as $match ) {
        
        $porul_yen = (int)$match[2];
    
        if ( $porul_yen != $count ) {
            $test_status = "invalid porul yen around $porul_yen ----> $count";
            echo $test_status;
            exit;
        }
        $count++;
        $test_status = "all is well";
        
    }
    
    echo $test_status;

}

?>
