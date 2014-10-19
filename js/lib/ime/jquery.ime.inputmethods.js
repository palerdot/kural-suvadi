( function ( $ ) {
	'use strict';
 
	$.extend( $.ime.sources, {
	    // only 'எழுத்துப்பெயர்ப்பு' name is needed to display the name
	    // in jquery.ime.selector
		'ta-transliteration': {
			name: 'எழுத்துப்பெயர்ப்பு',
			source: 'rules/ta/ta-transliteration.js'
		}
	} );

    // 'தமிழ்' language is added
    // only transliteration is needed as of now

	$.extend( $.ime.languages, {
		'ta': {
			autonym: 'தமிழ்',
			inputmethods: [ 'ta-transliteration' ]
		}
	} );

}( jQuery ) );
