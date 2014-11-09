// பொருள்source
// we are using dummy "0" index to access things like an array


( function( $ ) {

    var porul_source = [
        {
            "yen": "0",
            "porul": ""
        },
        {  
            "yen":"1",
            "porul":"எழுத்துக்கள் யாவும் 'அ' என்ற அகர ஒலியை முதலாகக் கொண்டுள்ளன; அது போல ஆதியாகிய கடவுள் உலக உயிர்க்கெல்லாம் முதலாவான்."
        },
        {  
            "yen":"2",
            "porul":"கடவுள் எனும் தூய அறிஞனது திருவடியை வணங்காதவர்களுக்கு கற்றக் கல்வியினால் பயன் ஏதுமில்லை."
        },
        {  
            "yen":"3",
            "porul":"உயிர்களின் உள்ளத்தாமரை மலரில் வீற்றிருக்கும் கடவுளின் திருவடியை நினைத்திருப்பவை இவ்வுலகில் நீண்ட காலம் வாழ்வர்."
        }
    ];
    
    // register the adhikaram with the Suvadi app
    Suvadi.data.porul = porul_source;

}( jQuery ) );
