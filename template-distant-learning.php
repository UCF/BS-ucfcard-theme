<?php /*
Template Name: Distance Learning
*/ ?>

<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>

<?php if ( have_posts() ) : while( have_posts() ) : the_post(); ?>

	<div id="card-service-wrap">

		<section class="card-services-header" style="background: url(<?php echo get_field( 'header_image_2' ); ?>) no-repeat; background-position: center; background-size: cover;">
			
			<div class="outer">

				<div class="inner">
					<div class="header-quote">Distance Learning &amp;</div>
					<div class="header-sub-heading">Regional Campuses</div>
				</div>

			</div>

		</section>

		<?php /* =- =- =- =- =- =- =- = =- 

				INFO SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="white-section">

			<div class="float-container wid-940 info-panels align-center">

				<div class="left-container">
					<div class="center-pad">
						<h3 class="info-panel-title"><?php the_field( 'left_panel_title' ); ?></h3>
						<div class="fees-info"><?php the_field( 'left_panel_content' ); ?></div>
					</div>
				</div>

				<div class="right-container">
					<div class="center-pad">
						<?php 

							$right_panels = get_field( 'right_panels' );
							$section_counter = 1;

							foreach ( $right_panels as $section ) { ?>
								<div class="panel-wrap<?php if ( $section_counter == 1 ) { echo ' first'; } ?>">
									<h3 class="info-panel-title"><?php echo $section['title']; ?></h3>
									<div class="fees-info"><?php echo wpautop( $section['content'] ); ?></div>
								</div>
							<?php $section_counter++; } 
						?>
					</div>
				</div>

				<div class="clear"></div>

			</div>
			
		</section>

		<?php /* =- =- =- =- =- =- =- = =- 

				WHATS NEW SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<section class="white-section grey-section">

				<div class="section-container-1">

					<div class="center-pad">
						<h2 class="section-title"><?php the_field( 'regional_locations_title' ); ?></h2>
						<div class="section-desc">
							<?php the_field( 'regional_locations_content' ); ?>
						</div>
					</div>

				</div>

				<div class="location-modules">

					<div class="center-pad">
						<?php

							/* Issue Arguements */
							$location_args = array(
								'post_type' => 'ucf_locations',
								'posts_per_page' => -1,
								'order' => 'ASC',
								'orderby' => 'ID',
								'post_status' => 'publish',
							);

							$locations = get_posts( $location_args );
							$loc_counter = 0;
							$backup_loc_counter = 1;
							$total_locations = count( $locations );
						?>

						<div class="module-row three-row">

							<?php foreach ( $locations as $location ) { 

								$thumb = wp_get_attachment_image_src(get_post_thumbnail_id( $location->ID ), 'post-thumbnail');

								if ($thumb) {
									$featured_img = $thumb['0'];
								}

								$loc_counter++;
							?>

								<?php if ( $loc_counter == 3 ) { ?>
									<div class="location-module-container mod-3">
								<?php } else { ?>
									<div class="location-module-container">
								<?php } ?>

										<div class="location-header">
											
											<div class="location-img" style="background: url(<?php echo $featured_img; ?>) no-repeat; background-position: center; background-size: cover;"></div>

											<div class="overlay"></div>
											<h2 class="location-title"><?php echo $location->post_title; ?></h2>
										</div>

										<div class="module-content">
											<?php echo wpautop( $location->post_content ); ?>

											<div class="btn-container">
												<a href="<?php echo get_field( 'location_link', $location->ID ); ?>" class="cta-btn yellow">View Location</a>
											</div>
										</div>

									</div>

								<?php

									if ( $backup_loc_counter == $total_locations ) {

										echo '<div class="clear"></div></div>';

									} else {

										if ( $loc_counter == 3 ) {
											$loc_counter = 1;
											echo '<div class="clear"></div></div>';

											$remaining_locs = $total_locations - $backup_loc_counter;

											if ( $remaining_locs > 3 ) {
												echo '<div class="module-row three-row">';
											} else {
												echo '<div class="module-row">';
											}

										}
									}

							$backup_loc_counter++; } ?>

					</div>

				</div>

			</section>

			<?php /* =- =- =- =- =- =- =- = =- 

				REQUEST MAIL SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<section class="request-mail" style="background: url(<?php echo THEME_URL . '/library/images/mail-footer.jpg'; ?>) no-repeat; background-size: cover; background-position: center;">
				<div class="overlay"></div>

				<div class="float-container wid-840 align-center">

					<div class="center-pad">

						<div class="left-container">
							<h3><?php the_field( 'mail_left_first_title' ); ?></h3>

							<div class="info-container">
								<?php the_field( 'mail_left_first_content' ); ?>
							</div>

							<div class="section-wrap">
								<h4><?php the_field( 'mail_left_second_title' ); ?></h4>

								<div class="info-container">
									<?php the_field( 'mail_left_second_content' ); ?>
								</div>
							</div>

						</div>

						<div class="right-container">

							<h4><?php the_field( 'mail_right_section_title' ); ?></h4>

							<div class="info-container">
								<?php the_field( 'right_section_content' ); ?>
							</div>

						</div>

						<div class="clear"></div>

					</div>

				</div>
			</section>


	</div>


<?php endwhile; endif; ?>

<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/card-services-menu.js'; ?>"></script>



<?php get_template_part( 'section', 'card-services-footer' ); ?>












