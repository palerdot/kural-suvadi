// பொருள்source
// we are using dummy "0" index to access things like an array


( function( $ ) {

    var porul_source = [
        {
            "yen": "0",
            "porul": ""
        },
        {
            "yen": "1",
            "porul": "குறள் வாழ்வில் மிகவும் தேவையான ஒன்று ஆகும். குறளின் பொருள் மிகவும் அர்த்தம் வாய்ந்தது 1"
        },
        {
            "yen": "2",
            "porul": "குறள் வாழ்வில் மிகவும் தேவையான ஒன்று ஆகும். குறளின் பொருள் மிகவும் அர்த்தம் வாய்ந்தது 2"
        },
        {
            "yen": "3",
            "porul": "குறள் வாழ்வில் மிகவும் தேவையான ஒன்று ஆகும். குறளின் பொருள் மிகவும் அர்த்தம் வாய்ந்தது 3"
        }
    ];
    
    // register the adhikaram with the Suvadi app
    Suvadi.data.porul = porul_source;

}( jQuery ) );
