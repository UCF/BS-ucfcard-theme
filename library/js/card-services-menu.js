jQuery(document).ready(function($) {


	/* - = - = - = - = - = - = - =- = = - =- = = - =- =

		Card Services Mobile Menu

	- = - = - = - = - = - = - = - = - = = - =- = = - =- = */

	$initial_window_width = $(window).width();

	$('#mobile-menu .hamburger').on( 'click', function(evt) {
		evt.preventDefault();

		$(this).toggleClass( 'close' );

		$('#actual-mobile-menu').toggleClass( 'active' );

	} );

	$('body').on( 'click', '#ucfhb-mobile-toggle', function() {

		$('#card-services-menu').toggleClass( 'ucfhb-opened' );

	} );

	$(window).scroll( function() {

    	//Window Width
		var $window_width = $(window).width();

		if ( $window_width < 960 ) {
	    	//Check if At Top Of Window
	    	if ( $(window).scrollTop() > 130 ) {
	    		$('#card-services-menu').addClass( 'fixed' );
			} else {
				$('#card-services-menu').removeClass( 'fixed' );
			}
		}

    } );

    $(window).resize( function() {

		$resized_window_width = $(window).width();

		if ( $resized_window_width >= 960 ) {
			
			$('#card-services-menu').removeClass( 'fixed' );

		} else {

			if ( $(window).scrollTop() > 130 ) {
	    		$('#card-services-menu').addClass( 'fixed' );
			}

		}
 
	});


});