<?php /*
Template Name: Card Services Contact
*/ ?>

<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>

<?php if ( have_posts() ) : while( have_posts() ) : the_post(); ?>

	<div id="card-service-wrap">

		<?php /* =- =- =- =- =- =- =- = =- 

				GOOGLE MAP

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<div class="map-container">
			
			<div class="overlay"></div>

			<section id="map"></section>

		</div>


		<?php /* =- =- =- =- =- =- =- = =- 

				FAQ Section

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<section class="white-section faq-section">

				<div class="float-container wid-920 wid-970 align-center">

					<div class="left-container">

						<div class="center-pad">

							<h1>FAQ</h1>

							<ul class="faq-list">

								<?php 

									$faq_cats = get_terms( 'faq_category' );

									foreach ( $faq_cats as $faq_cat ) { ?>
										<li>

											<h2><?php echo $faq_cat->name; ?></h2>

											<?php
												/* FAQ Arguements */
												$faq_args = array(
													'post_type' => 'ucf_faqs',
													'posts_per_page' => -1,
													'order' => 'ASC',
													'orderby' => 'ID',
													'post_status' => 'publish',
													'tax_query' => array(
														array(
															'taxonomy' => 'faq_category',
															'field'    => 'term_id',
															'terms'    => $faq_cat->term_id
														)
													)
												);

												$faqs = get_posts( $faq_args );
												$faq_counter = 1;
												$total_faqs = wp_count_posts( 'ucf_faqs' ); ?>

												<ul>
													<?php foreach ( $faqs as $faq ) { ?>
														<li>
															<a class="faq-link" href="#" data-faq-num="<?php echo $faq->ID; ?>"><?php echo $faq->post_title; ?></a>

															<div class="faq-info"><?php echo wpautop( $faq->post_content ); ?></div>
														</li>
													<?php } ?>
												</ul>

										</li>
									<?php }

								?>

							</ul>

						</div>

					</div>

					<div class="right-container">

						<div class="center-pad">

							<h2 class="no-margin-top">Contact Information</h2>
							<div class="faq-info show"><?php the_content(); ?></div>

							<div class="faq-social-icons">
								<a target="_blank" href="<?php echo get_field( 'twitter_link', 735 ); ?>" class="social-icon tw"></a>
								<a target="_blank" href="<?php echo get_field( 'facebook_link', 735 ); ?>" class="social-icon fb"></a>
								<div class="clear"></div>
							</div>

							<div class="contact-form-block">
								<h3 class="contact-title">Contact us today</h3>

								<div class="contact-g-form-container">
									<?php gravity_form( 1, false, true, false, null, true, null ); ?>
								</div>

								<div class="clear"></div>
							</div>

							<div class="badge-block" style="background: url(<?php the_field( 'badge_background_image' ); ?>) no-repeat; background-size: cover; background-position: center;">
								
								<div class="overlay"></div>

								<div class="outer">
									<div class="inner">

										<div class="badge-wrap">
											<h3 class="badge-title"><?php the_field( 'badge_title' ) ?></h3>
											<a href="<?php echo get_bloginfo( 'url' ); ?>/departments" class="cta-btn yellow">Request UCF Card/Badge</a>
										</div>

									</div>
								</div>

							</div>

						</div>

					</div>

					<div class="clear"></div>

				</div>

			</section>


	</div>


<?php endwhile; endif; ?>

<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB6IftJIbhuHExsKKkPqARDNmkp3kZKhS4&amp;sensor=false"></script>
<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/card-services-menu.js'; ?>"></script>

<script type="text/javascript">

	jQuery(document).ready( function($) {

		$('.faq-link').on( 'click', function(evt) {
			evt.preventDefault();

			if ( $(this).hasClass( 'active' ) ) {
				$(this).parent().find( '.faq-info' ).slideUp( 300 );
				$(this).removeClass( 'active' );
			} else {
				$('.faq-link.active').removeClass( 'active' ).parent().find( '.faq-info' ).slideUp( 300 );
				$(this).addClass( 'active' );
				$(this).parent().find( '.faq-info' ).slideDown( 300 );
			}

		} );

	});

</script>

<script type="text/javascript">

	function initializeGoogleMap() {
		var templatedir = '<?php echo bloginfo('template_directory'); ?>';

		//Latitude/Longitude
		var ll1 = new google.maps.LatLng( 28.600843, -81.202111 );

		//Set up Map Style
        var mapstyle = [{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}];
        var SPRY_MAP_STYLE = 'spry_style';

		//Map Settings
        var mapOptions = {
            center: ll1,
            zoom: 15,
            scrollwheel: false,
            streetViewControl: false,
			mapTypeControl: false,
			panControl: false,
			mapTypeId: SPRY_MAP_STYLE,
			zoomControlOptions: {
		        style: google.maps.ZoomControlStyle.LARGE,
		        position: google.maps.ControlPosition.LEFT_CENTER
		    },
        };

        //Activate Map
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);

        //Activate map style
		var mapType = new google.maps.StyledMapType(mapstyle, {name:"Spry"});    
		map.mapTypes.set(SPRY_MAP_STYLE, mapType);

        //Markers
		var markerIcon = new google.maps.MarkerImage(
			templatedir + '/library/images/map-pin-2.png',
			new google.maps.Size(87, 103)
		);

		//Orlando Map Marker
        var marker = new google.maps.Marker({
			position: ll1,
			map: map,
			title: 'UCF',
			icon: markerIcon
		});

		map.panBy(-250, -50);
    }

    //Initialize Google Map
    google.maps.event.addDomListener(window, 'load', initializeGoogleMap);

</script>



<?php get_template_part( 'section', 'card-services-footer' ); ?>












