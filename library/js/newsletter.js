jQuery(document).ready(function($) {

	//Newsletter Form Submit
	$('body').on( 'click', '#newsletterSignUp', function(evt) {
		evt.preventDefault();

		$('#newsletter-form').submit();
	});

	$('#newsletter-form').on( 'submit', function(evt) {

		evt.preventDefault();

		var form = $(this);

		/* Send Form */	
		$.ajax({
			url: ajax_url,
			type: 'POST',
			data: form.serialize(),
			success: function(result) {
				var data = JSON.parse(result);

				console.log( data );

				//errors ?
				if ( data.fields ) {
					//remove errors
					form.find('.error').removeClass('error');
					$.each( data.fields, function(i, v) {

						form.find( '[name='+v+']' ).addClass('error');
						
					});

				} else {
					form.find('.error').removeClass('error');

					form.fadeOut( 500, function() {

						$('#newsletter-success').fadeIn( 500 );

					} );
				}


			}
		});

	});

});