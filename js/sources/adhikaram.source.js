// அதிகாரம் source

// we are using dummy "0" index to access things like an array

( function( $ ) {

    var adhikaram_source = [
        {
            "yen": "0",
            "title": ""
        },
        {
            "yen": "1",
            "title": "அதிகாரம் 1"
        },
        {
            "yen": "2",
            "title": "அதிகாரம் 2"
        }
    ];
    
    // register the adhikaram with the Suvadi app
    Suvadi.data.adhikaram = adhikaram_source;

}( jQuery ) );
