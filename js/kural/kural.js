/*
TODO: Clean up the entire javascript by 

- using MOBILE Events, not desktop events like 'click'
- caching jquery objects
- implementing the design patterns
- reduce the code clutter by removing the unwanted javascript in different files

*/

// ********************************************************************************************************************************
// START: Suvadi App
// ********************************************************************************************************************************

( function( root ){

    // 'root' <==> 'window'
    
    // START: 'Suvadi' app
    root.Suvadi = {
    
        // "Suvadi version"
        // important to fetch sources from the localStorage and
        // maintaing the updated sources
        version: "0.1",
    
        // data about 'Kural' and 'Adhikaram' as json
        // 'Kural' and 'Adhikaram' objects are created from this data
        data: {
            kural: [],
            adhikaram: [],
            porul: []
        },
    
        // Array of 'Kural' Objects
        kural: [],
        
        // Array of 'Adhikaram' Objects
        adhikaram: [],
        
        // stores 'current' kural and adhikaram
        current: {
            kural: 0,
            adhikaram: 0
        },
        
        // jQuery Factory - importatnt jQuery references to cache
        $jf: [],
        
        // set of statuses
        status: {
            is_ulleedu_udhavi_loaded: false,
            is_suvadi_patri_loaded: false,
            debug_mode: false // enable this to force load the kural sources 
        },
        
        // handles the loader function
        loader: {
            
            $el: $( "#kural-loading" ),
            
            show: function(){
                this.$el.show();
            },
            
            hide: function(){
                this.$el.hide();
            }    
            
        },
        
        // initializing function
        // loads the first random kural,
        // initializes the adhikaram view, 
        // initializes the viruppam
        init: function(){
        
            var self = this; // save context
            
            // hide the loader
            this.loader.hide();
        
            // --------------------------------------------------------------------------------
        
            // initialize the sources => load from localStorage, or dynamically load
            // the sources from the scripts
            // data is stored in localStorage as follows:
            // Suvadi_sources: {
            //  version: "", // version number,
            //  data: {}, // mimics the Suvadi data structure
            // }
            
            var local_source = JSON.parse( localStorage.getItem( "Suvadi_sources" ) );
            var local_version = false;
            var app_version =  this.version; 
            
            if ( local_source ) {
                // local source is present; and we have a local version
                local_version = local_source.version.toString();
            }
            
            if ( this.status.debug_mode || !local_version || ( versionCompare( local_version, app_version ) < 0 ) ) {
                
                // local version is less than app version; update the sources (or)
                // there is no local version - foolproof when browser deletes data?
                $.cachedScript( "js/min/sources.min.js" ).done( function( script, textStatus ) {
                   
                    // currently, this operation is not tested for "success/failure".
                    // it is considered as success and proceeded
                    var updated_sources = {
                        version: app_version,
                        data: self.data
                    };
                    // update the local Source data
                    localStorage.setItem( "Suvadi_sources", JSON.stringify( updated_sources ) );
                    
                    // continue with init
                    self.init_continue();
                      
                });
                
            } else {
            
                // necessary sources are present locally; add them
                this.data =  local_source.data;
                
                // continue with init
                self.init_continue();
            
            }
        
            // --------------------------------------------------------------------------------
        
            
            
        },
        
        // continues initialization process if everything is fine with the data sources
        
        init_continue: function() {
        
            // register all the necessary event handlers for the 'Suvadi' app
            this.register_handlers();
        
            // load the first random kural
            
            // initialize the adhikaram view
            var kv = localStorage.getItem("adhikaram_viruppam") || 1;
            // create the adhikaram if not present
            if ( !this.adhikaram[ kv ] ) {
                this.adhikaram[ kv ] = new Adhikaram( this.data.adhikaram[ kv ] );
            }
            // display the adhikaram
            this.adhikaram[ kv ].display();
        
            // initialize the settings
            // add this before viruppam init, since viruppam makes use of settings
            $.each( this.settings, function( name, setting ){
                // call the corresponding setting init
                setting.init();
            } );
        
            // initialize the viruppam
            this.viruppam.init();
        
        },
        
        // manages the Suvadi app settings; 
        // currently only deleting kural viruppam is present;
        // might include more options in future
        // each setting will have an init which will be called by 'Suvadi init'
        settings: {
        
            kural_viruppam: {
                
                $el: {
                
                    info: $( "#viruppam_setting_info" ),
                    checkbox: $( "#viruppam_setting_switch" )
                
                },
                
                init: function(){
                    
                    // save context 
                    var self = this;
                    
                    // init the flip switch
                    this.$el.checkbox.flipswitch({ defaults: true });
                    
                    this.$el.checkbox.change( function () {

                        if ( $(this).is(":checked") ) {

                            self.switchOn();

                        }else {

                            self.switchOff();

                        }
                      
                    } );
                
                },
                
                enable: function(){
                    
                    this.$el.info.html( "விருப்பமாக குறிக்கப்பட்டுள்ள அனைத்து குறள்களையும் அழிக்க கீழ் உள்ள பொத்தானை சுட்டவும்" );
                    
                    this.$el.checkbox.flipswitch( "enable" );
                    // tick the checkbox
                    this.$el.checkbox.prop("checked", true);
                    
                },
                
                disable: function(){
                    this.$el.info.html( "குறள்கள் விருப்பமாக குறிக்கப்படவில்லை" );
                    
                    // tick off the checkbox
                    this.$el.checkbox.prop("checked", false);
                    this.$el.checkbox.flipswitch( "disable" );
                },
                
                switchOn: function(){
                    // no action
                },
                
                switchOff: function(){
                    // delete kural viruppam from local storage
                    localStorage.removeItem( "kural_viruppam" );
                    // disable the switch
                    this.disable();  
                },
                
                // module which is called when the settings page is shown
                refresh: function() {
                
                    // show the delete option if viruppam kural is present
                    if ( ! $.isEmptyObject( Suvadi.viruppam.data ) ) {
                        this.enable();
                    }else {
                        this.disable();
                    }
                    // refresh the element
                    this.$el.checkbox.flipswitch( "refresh" );
                
                }
                
            }
        
        },
        
        // 'viruppam' => kural preferences
        // this handles the localStorage functionalities
        viruppam: {
        
            // contains the copy of localStorage data
            // data is send/got from localStorage from this list
            data: {},
            
            // 'viruppam view' in the viruppam page; holds all the kural preferences
            // this is available only after DOM Ready; so assign it in iniit function
            $el: '',
        
            // initializes the preferences at the start of app
            init: function(){
                
                this.$el = $( "#viruppam-view" );
                this.data = JSON.parse( localStorage.getItem("kural_viruppam") );
                var $v_view = this.$el;
                // clear the viruppam view
                $v_view.html('');
                
                if ( ! $.isEmptyObject( this.data ) ) {
                    // there are preferences stored
                    // sort the data to display the most recent 'Viruppam' first
                    var sorted = [];
                    $.each( this.data, function( index, value ){
                        sorted.push( value );
                    } );
                    // sort the 'viruppam'
                    sorted.sort( function( a, b ){
                        return b.created - a.created;
                    } );
                    // now display the sorted viruppam
                    $.each( sorted, function( index, value ){
                    
                        var k_index = parseInt( value.yen, 10 );
                        // create the kural object if not present
                        if ( !Suvadi.kural[ k_index ] ) {
                            Suvadi.kural[ k_index ] = new Kural( Suvadi.data.kural[ k_index ] );
                        }
                        
                        // main div
                        var $viruppam_div = $("<div>", { "class": "ui-corner-all custom-corners viruppam",
                                                         "data-kural-yen": k_index })
                                            // define swipe event to remove the viruppam
                                            .on( 'swipeleft', function(){
                                                var yen = $( this ).data( "kural-yen" );
                                                Suvadi.viruppam.handle_swipe( this, 'left', yen );
                                            } )
                                            .on( 'swiperight', function(){
                                                var yen = $( this ).data( "kural-yen" );
                                                Suvadi.viruppam.handle_swipe( this, 'right', yen );
                                            } )
                                            // show the kural when the viruppam is clicked
                                            .on( "click", function(){
                                                var yen = $( this ).data( "kural-yen" );
                                                Suvadi.show_kural( yen );
                                            } );
                        // header part
                        var $viruppam_header = $('<div class="ui-bar ui-bar-a kural-header">\
                                                <h3>31. பொறையுடைமை</h3>\
                                                <span class="kural-number">224</span>\
                                              </div>');
                        // viruppam start
                        var $viruppam_star = $("<span>", { "class": "star starred", "data-kural-yen": k_index })
                                                .on('click', function(){
                                                
                                                    $(this).removeClass('starred');
                                                    $viruppam_header.trigger( 'swipeleft' );
                                                    
                                                    // prevent propagation of event to prevent parent 'viruppam' click
                                                    return false;
                                                });
                                                
                        // append the star to header
                        $viruppam_header.append( $viruppam_star );
                        // content part
                        var $viruppam_body = $('<div class="ui-body ui-body-a">\
                                              </div>');
                        // add content to viruppam header
                        $viruppam_header.children("h3").text( Suvadi.kural[ k_index ].adhikaram.yen + ". " + Suvadi.kural[ k_index ].adhikaram.title );
                        $viruppam_header.children("span.kural-number").text( k_index );
                        // add content to viruppam body
                        $viruppam_body.html( Suvadi.kural[ k_index ].view );
                        // add header and content to div
                        $viruppam_div.append( $viruppam_header ).append( $viruppam_body );
                        // append to the 'viruppam view' in the page
                        $v_view.append( $viruppam_div );

                    } );
                    
                    // enable the kural viruppam if disabled
                    Suvadi.settings.kural_viruppam.enable();
                    
                } else {
                    // there are no preferences stored
                    // assign an empty object to replace the null value from parsed localStorage
                    this.data = {};
                    this.$el.append( "<div class='info'> குறள்கள் விருப்பமாக குறிக்கப்படவில்லை  </div>" );
                    
                    // manage the kural viruppam preferences by disabling it
                    Suvadi.settings.kural_viruppam.disable();
                    
                }
                
            },
            
            // saves the kural to viruppam
            save: function( kural ){
                
                // the viruppam object to store details
                this.data[ kural ] = {
                    created: new Date().getTime(),
                    yen: kural
                };
                // save the data to the localStorage
                localStorage.setItem( "kural_viruppam", JSON.stringify( this.data ) );
                
            },
            
            // removes a kural from preference
            remove: function( kural ){
                
                // delete the 'kural' from viruppam
                delete this.data[ kural ];
                // save the data to the localStorage
                localStorage.setItem( "kural_viruppam", JSON.stringify( this.data ) );    
                
            },
            
            // handle the viruppam swipe
            handle_swipe: function( el, dir, kural ){
            
                // el => the jQuery div reference of this viruppam
                // dir => right/left swipe direction
                // kural => kural to remove from viruppam
            
                // Remove the 'viruppam' and save it
                // this is the destination for 'swipeleft', 'swiperight', 'viruppam star click'
                // remove the kural from 'viruppam'
                this.remove( kural );
                
                // prepare the div to fade and slide
                var slideWidth = $( el ).width();
                $( el ).css({ 'position': 'static', 'width': slideWidth + 'px', 'opacity': '0.8' });
                
                var swipe_margin = ( dir == 'left' ) ? ('-' + slideWidth + 'px') : (slideWidth + 'px');
                
                $( el ).animate({
                    'marginLeft': swipe_margin,
                    'opacity': '0.1'
                }, 1000, function(){
                    // slide animation complete; remove the div
                    // make a smooth 'slideUp'
                    $( el ).slideUp( function(){
                        // remove the 'div' finally
                        $( el ).remove();
                    } );
                });
            }
        
        }, // end of viruppam object
        
        // resizes the "kural font" depending on window width
        handle_kural_font: function(){
        
            var width = this.$jf['win'].width();
            var fsize = (0.75/360) * (width);
            this.$jf['k'].css( "font-size", fsize + "em" );
        
        },
        
        // registers all the event handlers for the 'Suvadi'
        
        register_handlers: function(){
        
            // save reference to use within jQuery functions
            var self = this;
            // cache important jQuery references
            // ----------------------------------------------------
            // main jQuery mobile page container
            this.$jf['mpage'] = $( ":mobile-pagecontainer" );
            // window object
            this.$jf['win'] = $( window );
            // kural class
            this.$jf['k'] = $(".kural");
            // ----------------------------------------------------
            // adjust kural font depending on window width
            this.handle_kural_font();
            this.$jf['win'].on( "resize", function(){
                self.handle_kural_font();
            } );
            // ----------------------------------------------------
            // kural popup
            this.$jf['kpop'] = $( "#kural-popup" );
            // kural popup content
            this.$jf['kpop_content'] = $( "#kural_popup_content" );
            // kural popup title
            this.$jf['kpop_title'] = $( "#kural_popup_title" );
            // adhikaram name
            this.$jf['k_a_name'] = $( "#kural_adhikaram_name" );
            // adhikaram number
            this.$jf['k_no'] = $( "#kural_number" );
            // kural porul
            this.$jf['k_porul'] = $( "#kural_porul" );
            
            // search/thedal box
            this.$jf['k_thedal'] = $( "#kural_thedal" );
            // ---------------------------------------------------
            // Register different page changes functionality
            
            // 'Before Page Change' Functionality
            // can be used to wire functionalities for specific page transitions
            this.$jf['mpage'].on( "pagebeforechange", function( event, ui ){
                
                // this method is triggered twice;
                // typeof(ui.toPage) == 'string' => navigation is about to commence
                // typeof(ui.toPage) == 'object' => page is ready to be loaded but yet to be shown
                
                if ( typeof(ui.toPage) == 'string' ) {
                    
                    // navigation is about to commence
                    var url = ui.toPage;
                    var changed_page = url.substring( url.lastIndexOf('#')+1 );
                    
                    // we have got the id of the current page visited
                    switch ( changed_page ) {
                    
                        case 'viruppam':
                            // viruppam page is visited; init the viruppam
                            Suvadi.viruppam.init();
                        break;
                        
                        case 'suvadi_viruppam':
                            // preferences page
                            Suvadi.settings.kural_viruppam.refresh();
                        break;
                    
                    } // end of 'switch'
                
                } 
                
            } );  // end of 'pagebeforechange'
            
            // 'After page change' functionality
            this.$jf['mpage'].on( "pagechange", function( event, ui ){
                
                var $j_el = $( ui.toPage[0] );
                // get the id of the page
                var changed_page = $j_el.attr("id");
                
                switch ( changed_page ) {
                
                    case 'thedal':
                        // focus the search box
                        Suvadi.$jf['k_thedal'].focus();
                    break;
                
                }
                
            } );
            
            // ---------------------------------------------------
            // Register handlers to 'adhikaram' view
            this.$jf['a_view'] = $("#adhikaram-view");
            
            // register the 'refresh' functionality
            this.$jf['a_view'].on( "click", "#adhikaram_refresh", function(){
                
                Suvadi.adhikaram_refresh();
                
            } );
            
            // Register the 'kural show' functionality when adhikaram row is clicked
            this.$jf['a_view'].on( "click", ".adhikaram-row", function(){
            
                var kural_yen = $(this).data('kural-yen');
                Suvadi.show_kural( kural_yen );
            
            } );
            
            // ----------------------------------------------------
            // 'Refresh' Functionality
            
            // kural refresh button
            this.$jf['k_refresh'] = $( "#kural_refresh" );
            // adhikaram refresh button
            this.$jf['a_refresh'] = $( "#adhikaram_refresh" );
            
            this.$jf['k_refresh'].on( "click", function(){
            
                Suvadi.kural_refresh();
            
            } );
            
            // --------------------------------------------------------------
            
            // kural 'viruppam' indicator in the popup
            this.$jf['kstar'] = $( "#kural_star" );
            
            // wire the 'save' or 'remove' viruppam functionality
            this.$jf['kstar'].on( 'click', function(){
                
                var current = Suvadi.current.kural;
                
                if ( Suvadi.is_viruppam_kural( current ) ) {
                
                    // this kural is currently in viruppam; remove it
                    Suvadi.viruppam.remove( current );
                    // remove the starred class
                    $( this ).removeClass( "starred" );
                     
                } else {
                
                    // this kural is NOT in viruppam; store it
                    Suvadi.viruppam.save( current );
                    // add the starred class
                    $( this ).addClass( "starred" );
                    
                }
                
            } );
            
            // ---------------------------------------------------------------
        
            var $a_panel = $("#adhikaram");
            var $a_list = $(".adhikaram-list");
        
            // --------------------------------------------------------------
            // wire the adhikaram panel functionality            
            $a_panel.one( "panelbeforeopen", function( event, ui ) {
		        
		        $(this).find('form.ui-filterable input').ime({languages: ['ta']});
		        
	            // wire the functionality only once; at the first time opening of panel
	            $a_list.click( function(){
	                
	                try{
	                
	                    var a_yen = $(this).data("adhikaram-yen");
	                    // PS: cannot use 'this' as Suvadi here; inside jQuery object!
	                    if ( !Suvadi.adhikaram[ a_yen ] ) {
	                        // if the adhikaram object is not present, create it
	                        Suvadi.adhikaram[ a_yen ] = new Adhikaram( Suvadi.data.adhikaram[ a_yen ] );
	                    }
	                    // close the panel
	                    $a_panel.panel("close");
	                    // display the adhikaram
	                    Suvadi.adhikaram[ a_yen ].display();
	                    
	                }catch( e ){
	                    console.log("adhikaram yen data attribute not found");
	                }
	                
	            } );
	            
		    } );
		
		    // hide the ime selector when the panel is closed
		    $a_panel.on( "panelbeforeclose", function( event, ui ) {
		        $( 'div.imeselector-menu' ).removeClass( 'ime-open' );
                $( 'div.imeselector' ).hide();
		    } );
            // ------------------------------------------------------------
            
            // wire the autocomplete functionality for the search box
            
            
            // wire the ime editor to autocomplete box
            this.$jf['k_thedal'].ime({languages: ['ta']});
            
            // add kural yen to the suggestion
            // make use of suvadi api to display the clicked kural
            
            this.$jf['k_thedal'].autocomplete({
	            
	            search: function( event, ui ){
	            
	                // prevent the search if empty spaces are entered in the input box
	                if( $.trim($(this).val()) ==  '' ){
	                    event.preventDefault();
	                    return;
	                }
	            
	            },
	            
	            delay: 500, //delay half second after typing before showing results
	            
	            minLength: 2,
	            
	            source: Suvadi.data.kural,
	            
	            select: function( event, ui ){
	            
	                //change the content of the popup to the kural
	                var kural_split = ui.item.label.split(" ");
                    var first_line = kural_split[0]+" "+kural_split[1]+" "+kural_split[2]+" "+kural_split[3];
                    var second_line = kural_split[4]+" "+kural_split[5]+" "+kural_split[6];
                    
                    var kural = first_line + "<br>" + second_line;
                    
                    // get the kural yen
                    var k_yen = ui.item.yen;
                    
                    // show the kural
                    Suvadi.show_kural( k_yen );
                    
	            } // end of select 
	            
            }).data( "ui-autocomplete" )._renderItem = function( ul, item ){
                
                /*
                 * split the label according to "திருக்குறள்" format
                 *
                 * split using spaces; first four words in one line
                 * and next three in the next
                 */ 
               
                
                var kural_split = item.label.split(" ");
                var first_line = kural_split[0]+" "+kural_split[1]+" "+kural_split[2]+" "+kural_split[3];
                var second_line = kural_split[4]+" "+kural_split[5]+" "+kural_split[6];
                
                return $( "<li class='kural suggestion meera'>" )
                    .attr( "item.autocomplete", item )
                    .append( $("<a>").html( first_line + "<br>" + second_line) )
                    .appendTo( ul );
                
            };
            
            // ------------------------------------------------------------
            
            // 'உதவி' Section
            
            // panel
            this.$jf['u_panel'] = $( "#udhavi-panel" );
            // buttons in panel
            this.$jf['u_btn'] = $( ".udhavi-btn" );
            
            // enhance the external udhavi panel
            this.$jf['u_panel'].panel({ defaults: true }).enhanceWithin();
            
            var self = this;
            
            this.$jf['u_btn'].on( "click", function(){
                
                // show the loader
                self.loader.show();
                
                self.$jf['u_panel'].panel( "close" );
                var target = $(this).attr("href");
                
                switch ( target ) {
                
                    case "#ulleedu_udhavi":
                        
                        // load the ulleedu udhavi page if not loaded
                        if ( !self.status.is_ulleedu_udhavi_loaded ) {
                            
                            // get all the external page contents
                            self.$jf["uu_content"] = $( "#ulleedu_udhavi_content" );
                            // load the udhavi page contents
                            self.$jf["uu_content"].load( "pages/udhavi.html" );
                            // change the status as loaded
                            self.status.is_ulleedu_udhavi_loaded = true;
                            
                        }
                        
                        break;
                        
                    case "#suvadi_patri":
                    
                        // load the ulleedu udhavi page if not loaded
                        if ( !self.status.is_suvadi_patri_loaded ) {
                            
                            // get all the external page contents
                            self.$jf["patri_content"] = $( "#suvadi_patri_content" );
                            // load the udhavi page contents
                            self.$jf["patri_content"].load( "pages/patri.html" );
                            // change the status as loaded
                            self.status.is_suvadi_patri_loaded = true;
                            
                        }
                    
                        break;
                
                }
                
                self.$jf['u_panel'].panel({
                  close: function( event, ui ) {
                    // change to this particular page
                    self.$jf['mpage'].pagecontainer( "change", target, { transition: "none" } );
                    self.loader.hide();
                  }
                });
                
                // page changed; hide the loader
                //self.loader.hide();
                
                return false;
                
            } );
            
            // ------------------------------------------------------------
            
            // 'misc' section (not so important)
            
            this.$jf['isel-menu'] = $( 'div.imeselector-menu' );
            this.$jf['isel'] = $( 'div.imeselector' );
            this.$jf['ime-u'] = $(".ime-udhavi");
            
            // this will not show long enough to click; just in case
            this.$jf['ime-u'].click( function(e){
                e.preventDefault();
                Suvadi.$jf['mpage'].pagecontainer( "change", "#ulledu_udhavi", { transition: "none" } );
                return false;
            } );
            // hide ime selector when the window is resized
            
            this.$jf['win'].resize( function () {
	            Suvadi.$jf['isel-menu'].removeClass( 'ime-open' );
                Suvadi.$jf['isel'].hide();
            } ); 
            
            
            // -------------------------------------------------------------
            
        }, // end of registering
        
        show_kural: function( yen ){
            
            // make a 'fadeOut' effect
            // make a fade In effect
            this.$jf['kpop'].css( "opacity", "0.2" );
            
            // load the kural if not present. highly likely to be present
            // PS: here 'this' => 'Suvadi'
            if ( !this.kural[ yen ] ) {
                this.kural[ yen ] = new Kural( this.data.kural[ yen ] );
            }
            // store the yen in an attribute 'Suvadi.current_kural' and use it for 'Viruppam'
            this.current.kural = yen;
            // add class to 'viruppam star' depending on whether this kural is in viruppam or not
            if ( this.is_viruppam_kural( yen ) ) {
                // this kural is in viruppam; add 'starred' class
                this.$jf['kstar'].addClass("starred");
            } else {
                // remove the 'starred' class
                this.$jf['kstar'].removeClass("starred");
            }
            
            // get the kural view
            var kv = Suvadi.kural[ yen ].generate_view();
            // load the kural in the content
            this.$jf['kpop_content'].html( kv );
            // load the kural title
            this.$jf['k_a_name'].text( this.kural[ yen ].adhikaram.yen + ". " + this.kural[ yen ].adhikaram.title );
            // load the kural yen to header
            this.$jf['k_no'].text( yen );
            // load the kural porul; for now load only one 'porul', first one
            this.$jf['k_porul'].text( this.kural[ yen ].porul );
            // show the popup page [pop transition causes problems - so make it none]
            this.$jf['mpage'].pagecontainer( "change", "#kural-popup", { transition: "none" } );
            // make a fade In effect
            this.$jf['kpop'].animate( {
                opacity: 1
            }, 500, function(){
                // bug fix; android 4.4 shows selected autocomplete list at top
                $("ul.ui-autocomplete li").hide();
            } );
            
        },
        
        // checks if a kural is in 'viruppam' or not
        is_viruppam_kural: function( kural ){
        
            // get the viruppam data to check
            var vdata = this.viruppam.data;
            
            if ( !vdata ) {
                // if there is no 'viruppam' in localStorage
                return false;
            }
            
            if ( vdata[ kural ] ) {
                // if the kural is in viruppam
                return true;
            } else {
                // kural is not in viruppam
                return false;
            }
        
        },
        
        // creates the adhikaram object if not present and displays it
        show_adhikaram: function( yen ){
        
            // create the adhikaram object if not present
            if ( !this.adhikaram[ yen ] ) {
                this.adhikaram[ yen ] = new Adhikaram( this.data.adhikaram[ yen ] );
            }
            
            // store this as current adhikaram
            this.current.adhikaram = yen;
            
            // display the adhikaram
            this.adhikaram[ yen ].display();
        
        },
        
        // refreshes 'Kural'
        kural_refresh: function(){
        
            // get a random number for kural in the range of '1' - '1330'
            var kmax = 1331, kmin = 1;
            var k_random = Math.floor( Math.random() * ( kmax - kmin ) ) + kmin;
            
            this.show_kural( k_random );
        
        },
        
        // refreshes 'Adhikram'
        
        adhikaram_refresh: function(){
        
            // get a random number for adhikaram in the range of '1' - '133' 
            var amax = 134, amin = 1;
            var a_random = Math.floor( Math.random() * ( amax - amin ) ) + amin;
            
            this.show_adhikaram( a_random );
            
        }
    
    };
    // END: 'Suvadi' app
    
    // -------------------------------------------------------------
    // START: 'Kural' and 'Adhikaram' Object constructor definitions
    
    // 'Kural' Object Definition
    
    function Kural( kural_details ){
    
        // we will get the 'kural' details as an object
        // kural number
        this.yen = kural_details.yen;
        // kural
        this.kural = kural_details.label;
        // adhikaram
        this.adhikaram = this.get_adhikaram();
        // porul
        this.porul = this.get_porul();
        // kural view
        this.view = this.generate_view();
        
    } // end of definition
    
    // -------------------------------------------------------------
    
    // 'Kural' prototype
    
    Kural.prototype = {
    
        constructor: Kural,
        
        get_adhikaram: function(){
            var k_index = parseInt(this.yen, 10);
            // calculate the adhikaram index
            var a_index = Math.floor((k_index - 1)/10)+1;
            return {
                "yen": Suvadi.data.adhikaram[a_index].yen,
                "title": Suvadi.data.adhikaram[a_index].title  
            }
        },
        
        generate_view: function(){
        
            var kural_split = this.kural.split(" ");
            var first_line = kural_split[0]+" "+kural_split[1]+" "+kural_split[2]+" "+kural_split[3];
            var second_line = kural_split[4]+" "+kural_split[5]+" "+kural_split[6];

            var kural = first_line + "<br>" + second_line;
            
            return "<div class='kural'>" + kural + "</div>"
        
        },
        
        get_porul: function(){
        
            // 'porul' is an array; enables to add more poruls later
            if ( !Suvadi.data.porul[ this.yen ] ) {
                // if 'porul' is not present, return an empty porul
                return '';
            }
            // porul is present; return it
            return Suvadi.data.porul[ this.yen ].porul;
        
        }
    
    };
    
    // -------------------------------------------------------------
    
    // 'Adhikaram' Object Definition
    
    function Adhikaram( adhikaram_details ){
        // we will get the 'adhikaram' details as an object
        
        // adhikaram yen
        this.yen = adhikaram_details.yen;
        // adhikaram title
        this.title = adhikaram_details.title;
        // the individual adhikaram view containing title and kurals
        this.view = this.generate_view();
        // main adhikaram window
        this.$el = $("#adhikaram-view");
    
    } // end of definition
    
    // --------------------------------------------------------------
    
    Adhikaram.prototype = {
    
        constructor: Adhikaram,
        
        // $el: $("#adhikaram-view"),
        
        generate_view: function(){
            // generates the adhikaram view
            // componenets - title, individual kural div, refresh button
            // checks if all the kural objects for this particular
            // adhikaram - for eg: 1 - 10 for adhikaram one is loaded, and 
            // then gets their view and appends them
            
            // final template which is about to hold the view
            var $a_view = $("<div>");
            
            // define the adhikaram refresh element
            var $a_refresh = $( "<span>", 
                                { 
                                'class': 'ui-btn ui-icon-refresh ui-btn-icon ui-btn-icon-notext refresh', 
                                'id': 'adhikaram_refresh' 
                                });
            
            // adhikaram header element
            var $a_header = $("<div>", {'class': 'adhikaram_title_header'})
                            .append( 
                                $("<span>", { 'class': 'adhikaram_title' }).html( this.yen + ". " + this.title ) 
                             )
                             .append( $a_refresh );
            
            // add the header to view 
            $a_view.append( $a_header );
            
            var a_index = this.yen;
            var a_index_start = (a_index - 1)*10 + 1;
            var a_index_end = a_index*10;
            
            for ( var i = a_index_start; i <= a_index_end; i++ ) {
            
                if ( !Suvadi.kural[i] ) {
                    // if the kural object is not yet created, create it
                    Suvadi.kural[ i ] = new Kural( Suvadi.data.kural[ i ] );
                }
                
                // get the view of this particular kural
                var av = Suvadi.kural[ i ].generate_view();
                // create the kural body
                var $k_body = $( "<div>", { 'class': 'ui-corner-all custom-corners adhikaram-row',
                                            'data-kural-yen': i } )
                                .html( 
                                    $( "<div>", { 'class': 'ui-body ui-body-a' } ).html( av ) 
                                 );           
                // add the kural to the view
                $a_view.append( $k_body );
                
            }
            
            // return the adhikarm view
            return $a_view;
            
        },
        
        // displays the adhikaram in the adhikaram view
        // this.$el contains the main window
        // this.view contains the content for this particular adhikaram
        
        display: function(){
            // save this adhikaram as preference
            localStorage.setItem("adhikaram_viruppam", this.yen);
            // store this adhikaram as current
            Suvadi.current.adhikaram = this.yen;
            // show the adhikaram
            this.$el.hide().html( this.view ).fadeIn();
        }
    
    };
    
    // END: 'Kural' and 'Adhikaram' Object constructor definitions
    // -------------------------------------------------------------

}( this ) );
 
// ********************************************************************************************************************************
// END: Suvadi App 
// ********************************************************************************************************************************

// START: HACKS Area 

/*
 * A Hack to use localStorage in non supported Browsers
 *
 * ref: https://developer.mozilla.org/en/docs/Web/Guide/API/DOM/Storage
 *
 * Note: According to caniuse.com, localstorage is not supported in older android 
 * versions
 *
 * There are two versions mentioned in above reference page. We are including the 
 * exact replica of localStorage version
 */
 
 
 ( function(){
 
    // create a localStorage hack if not present
    
    if (!window.localStorage) {
      Object.defineProperty(window, "localStorage", new (function () {
        var aKeys = [], oStorage = {};
        Object.defineProperty(oStorage, "getItem", {
          value: function (sKey) { return sKey ? this[sKey] : null; },
          writable: false,
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(oStorage, "key", {
          value: function (nKeyId) { return aKeys[nKeyId]; },
          writable: false,
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(oStorage, "setItem", {
          value: function (sKey, sValue) {
            if(!sKey) { return; }
            document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
          },
          writable: false,
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(oStorage, "length", {
          get: function () { return aKeys.length; },
          configurable: false,
          enumerable: false
        });
        Object.defineProperty(oStorage, "removeItem", {
          value: function (sKey) {
            if(!sKey) { return; }
            document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          },
          writable: false,
          configurable: false,
          enumerable: false
        });
        this.get = function () {
          var iThisIndx;
          for (var sKey in oStorage) {
            iThisIndx = aKeys.indexOf(sKey);
            if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
            else { aKeys.splice(iThisIndx, 1); }
            delete oStorage[sKey];
          }
          for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
          for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
            aCouple = aCouples[nIdx].split(/\s*=\s*/);
            if (aCouple.length > 1) {
              oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
              aKeys.push(iKey);
            }
          }
          return oStorage;
        };
        this.configurable = false;
        this.enumerable = true;
      })());
    }
 
 }() );
 
// define a "cachedScript" method to make a ajax call to get resources
// ref: http://api.jquery.com/jquery.getscript/
 
jQuery.cachedScript = function( url, options ) {

    // Allow user to set any option except for dataType, cache, and url
    options = $.extend( options || {}, {
        dataType: "script",
        cache: true,
        url: url
    });

    // Use $.ajax() since it is more flexible than $.getScript
    // Return the jqXHR object so we can chain callbacks
    return jQuery.ajax( options );
}; 

// a utility function to compare version
// ref: http://stackoverflow.com/a/6832721/1410291
// ref: https://gist.github.com/TheDistantSea/8021359

function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');
 
    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
 
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
 
    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }
 
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
 
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
 
        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }
 
    if (v1parts.length != v2parts.length) {
        return -1;
    }
 
    return 0;
}
 
 // END: HACKS Area
 
 // -----------------------------------------------------------------------------------------------------------------------------
