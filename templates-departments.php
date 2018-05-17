<?php /*
Template Name: Departments
*/ ?>

<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>

<?php if ( have_posts() ) : while( have_posts() ) : the_post(); ?>

	<div id="card-service-wrap">

		<?php /* =- =- =- =- =- =- =- = =- 

			HEADER

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="card-services-header" style="background: url(<?php echo get_field( 'header_image_2' ); ?>) no-repeat; background-position: center; background-size: cover;">
			<div class="overlay"></div>
			<div class="outer">
				<div class="inner">
					<div class="header-container">
						<div class="header-quote">Departments</div>
						<div class="header-sub-heading">&amp; Forms</div>
					</div>
				</div>
			</div>
		</section> <?php /* END Newsletter Section */ ?>


		<?php /* =- =- =- =- =- =- =- = =- 

				FORMS SECTION

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="white-section form-section">

			<div class="float-container wid-920 wid-1000 align-center">

				<div class="left-container">

					<div class="center-pad">

						<div class="form-nav grey-container">

							<h4 class="checkboxes-break">Request Type</h4>

							<ul>
								<li>
									<a href="#" class="active" data-form="department-badge">Department Card/Badge</a>
								</li>
								<li>
									<a href="#" data-form="ucf-card-id">UCF Card</a>
								</li>
								<li>
									<a href="#" data-form="visitor-badge">Visitor Badge</a>
								</li>
								<li>
									<a href="#" data-form="nursing">Nursing Badge</a>
								</li>
								<li>
									<a href="#" data-form="police-department">Police Department</a>
								</li>
							</ul>

						</div>

					</div>

				</div>

				<div class="right-container">

					<div class="center-pad">

						<div id="department-forms-main-wrap" class="grey-container large">

							<h3><?php the_field( 'container_title' ); ?></h3>

							<div class="container-wrap">
								<h4><?php the_field( 'first_title' ); ?></h4>

								<div class="container-content">
									<?php the_field( 'first_content' ); ?>
								</div>
							</div>

							<div class="container-wrap">
								<h4><?php the_field( 'second_title' ); ?></h4>

								<div class="container-content">
									<?php the_field( 'second_content' ); ?>
								</div>
							</div>

							<div id="department-form" data-form="card-id" class="hide-form formly">

								<?php gravity_form( 3, false, true, false, null, true, null ); ?>

								<div class="clear"></div>

							</div>

							<div id="department-form2" data-form="department-badge" class="active formly">

								<?php gravity_form( 4, false, true, false, null, true, null ); ?>

								<div class="clear"></div>

							</div>

							<div id="department-form3" data-form="police-department" class="hide-form formly">

								<?php gravity_form( 5, false, true, false, null, true, null ); ?>

								<div class="clear"></div>

							</div>

							<div id="department-form4" data-form="nursing" class="hide-form formly">

								<?php gravity_form( 6, false, true, false, null, true, null ); ?>

								<div class="clear"></div>

							</div>

							<div id="department-form5" data-form="visitor-badge" class="hide-form formly">

								<?php gravity_form( 7, false, true, false, null, true, null ); ?>

								<div class="clear"></div>

							</div>


						</div>

					</div>

				</div>

				<div class="clear"></div>

			</div>

		</section> <?php /* END Newsletter Section */ ?>


	</div>


<?php endwhile; endif; ?>

<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/card-services-menu.js'; ?>"></script>
<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/icheck.min.js'; ?>"></script>

<script type="text/javascript">

	jQuery(document).ready( function($) {

		$('.gfield_radio input').iCheck( { radioClass: 'iradio_flat-yellow' } );

		$('#gform_wrapper_3').show();

		$('.excel-link').attr( 'href', "<?php echo THEME_URL . '/library/includes/docs/Nursing Template.xlsx'; ?>" )

		$('.form-nav ul li a').on( 'click', function(evt) {

			evt.preventDefault();

			if ( !$(this).hasClass( 'active' ) ) {

				//Clear Form Errors
				$('#department-form').find('.error').removeClass('error');

				$('#department-form').trigger("reset");

				$('.form-nav ul li a.active').removeClass( 'active' );
				$(this).addClass( 'active' );

				$selected_form = $(this).data( 'form' );

				$('#form_type').val( $selected_form );

				switch( $selected_form ) {

				    case 'ucf-card-id':

				    	$('.formly.active').removeClass( 'active' ).fadeOut( 300, function() {
				    		$('#department-form').fadeIn( 500 ).addClass( 'active' );
				    	} );

				    break;

				    case 'department-badge':

				    	$('.formly.active').removeClass( 'active' ).fadeOut( 300, function() {
				    		$('#department-form2').fadeIn( 500 ).addClass( 'active' );
				    	} );

				    break;

				    case 'police-department':

				    	$('.formly.active').removeClass( 'active' ).fadeOut( 300, function() {
				    		$('#department-form3').fadeIn( 500 ).addClass( 'active' );
				    	} );

				    break;

				    case 'nursing':

				    	$('.formly.active').removeClass( 'active' ).fadeOut( 300, function() {
				    		$('#department-form4').fadeIn( 500 ).addClass( 'active' );
				    	} );

				    break;

						case 'visitor-badge':

							$('.formly.active').removeClass( 'active' ).fadeOut( 300, function() {
								$('#department-form5').fadeIn( 500 ).addClass( 'active' );
							} );
							
						break;

				}

			}


		} );

		$('#input_6_4, #input_8_4, #input_3_4, select').fancySelect();

		// $('input[name=payee]').on( 'change', function() {

		// 	$selected_payee = $(this).val();

		// 	$('#payee_type').val( $selected_payee );

		// 	switch( $selected_payee ) {

		// 		case 'individual':

		// 			$('#field_6_7, #field_7_7, #field_8_7').fadeOut( 500 );

		// 		break;

		// 		case 'department':

		// 			$('#field_6_7, #field_7_7, #field_8_7').fadeIn( 500 );

		// 		break;

		// 	}

		// });

		$(document).bind('gform_post_render', function() {
			$('.gfield_list_14_cell1').find('input').attr( 'placeholder', 'First Name*' );
			$('.gfield_list_14_cell2').find('input').attr( 'placeholder', 'Last Name*' );
			$('.gfield_list_14_cell3').find('input').attr( 'placeholder', 'UCF ID Number*' );
			$('#input_6_4, #input_8_4, select').fancySelect();
			$('.gfield_radio input').iCheck( { radioClass: 'iradio_flat-yellow' } );
	    });

		$('.gfield_list_14_cell1').find('input').attr( 'placeholder', 'First Name*' );
		$('.gfield_list_14_cell2').find('input').attr( 'placeholder', 'Last Name*' );
		$('.gfield_list_14_cell3').find('input').attr( 'placeholder', 'UCF ID Number*' );


	});

</script>

<?php get_template_part( 'section', 'card-services-footer' ); ?>