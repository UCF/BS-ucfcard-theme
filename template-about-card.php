<?php /*
Template Name: Card Services About Card
*/ ?>

<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>

<?php if ( have_posts() ) : while( have_posts() ) : the_post(); ?>

	<div id="card-service-wrap">

		<section class="card-services-header" style="background: url(<?php echo get_field( 'header_image_2' ); ?>) no-repeat; background-position: center; background-size: cover;">

			<div class="outer">

				<div class="inner">
					<div class="header-quote"><?php the_field( 'header_text' ); ?></div>
				</div>

			</div>

		</section>

		<?php /* =- =- =- =- =- =- =- = =-

			UCF CARD SECTION

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="white-section">

			<div class="float-container wid-940 wid-1000 card-info-section align-center no-margin-top">

				<div class="center-pad">

					<div class="left-container no-margin-top">
						<!-- <div class="id-card" style="background: url(<?php bloginfo('template_directory'); ?>/library/images/ucf-card-placeholder.png) no-repeat; background-size: cover; background-position: center;"></div> -->

						<div class="img-container">
							<img src="<?php bloginfo('template_directory'); ?>/library/images/ucf-card-placeholder.jpg" />
						</div>

					</div>

					<div class="right-container no-margin-top">
						<h1 class="right-title"><?php the_field( 'ucf_card_section_title' ); ?></h1>
						<div class="card-desc"><?php the_field( 'card_info_description' ); ?></div>
					</div>

				</div>

				<div class="clear"></div>

			</div>

		</section> <?php /* END UCF Card Section */ ?>

		<?php /* =- =- =- =- =- =- =- = =-

			TERMS & CONDITIONS SECTION

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="white-section dark-grey-section">

			<div class="float-container wid-940 wid-1000 align-center terms-section">

				<div class="left-container">
					<div class="center-pad">
						<h2 class="yellow-title"><?php the_field( 'terms_conditions_title' ); ?></h2>
						<div class="terms-desc"><?php the_field( 'terms_conditions_description' ); ?></div>
					</div>
				</div>

				<div class="right-container">

					<div class="download-form-container">
						<div class="outer">
							<div class="inner">
								<a href="<?php the_field( 'terms_conditions_form_link' ); ?>" target="_blank" class="cta-btn trans-btn yellow">Download Form</a>
							</div>
						</div>
					</div>

				</div>

				<div class="clear"></div>

			</div>

		</section> <?php /* END Terms & Conditions Section */ ?>

		<?php /* =- =- =- =- =- =- =- = =-

			FEES & INFO SECTION

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="fees-info-section" style="background: url(<?php the_field( 'fee_info_background_image' ); ?>) no-repeat; background-size: cover; background-position: center;">
			<div class="overlay"></div>
			<div class="float-container wid-940 wid-1000 align-center">
				<div class="left-container">
					<div class="center-pad">
						<h3 class="yellow-title"><?php the_field( 'fee_info_first_title' ); ?></h3>
						<div class="fees-info white"><?php the_field( 'fee_info_content' ); ?></div>
						<h3 class="yellow-title"><?php the_field( 'fee_info_second_title' ); ?></h3>
						<div class="fees-info white"><?php the_field( 'fee_info_second_content' ); ?></div>
					</div>
				</div>

				<div class="right-container">
					<div class="center-pad">
						<div class="video-placeholder" style="background: url(<?php the_field( 'video_placeholder_image' ); ?>) no-repeat; background-size: cover; background-position: center;"></div>
					</div>
				</div>
				<div class="clear"></div>
			</div>
		</section> <?php /* END Fees & Info Section */ ?>

		<?php /* =- =- =- =- =- =- =- = =-

			FAIRWINDS BANK SECTION

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="fairwinds-section">

			<div class="left-side" style="background: url(<?php bloginfo('template_directory'); ?>/library/images/fairwind-bg.jpg) no-repeat; background-size: cover; background-position: center;">

				<div class="center-pad">
					<img src="<?php bloginfo('template_directory'); ?>/library/images/fairwinds-logo.png" />
				</div>

			</div>

			<div class="right-side">

				<div class="center-pad">
					<h3 class="fairwinds-title"><?php the_field( 'fairwinds_title' ); ?></h3>
					<div class="fairwinds-info-wrap">
						<div class="fairwinds-info"><?php the_field( 'fairwinds_description' ); ?></div>
						<a href="https://www.fairwinds.org/personal/personal-banking-accounts/ucf-banking/" target="_blank" class="get-linked"></a>
						<div class="fairwinds-disclaimer"><?php the_field( 'fairwinds_disclaimer' ); ?></div>
					</div>
				</div>

			</div>

			<div class="clear"></div>

		</section>

		<?php /* =- =- =- =- =- =- =- = =-

			BOTTOM CTAS

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<section class="full-cta">

			<div class="cta-img" style="background: url(<?php the_field( 'first_cta_image' ); ?>) no-repeat; background-position: center; background-size: cover;"></div>

			<div class="overlay"></div>

			<div class="outer">

				<div class="inner">
					<div class="cta-content">
						<div class="inner-cta-title"><?php the_field( 'first_cta_title' ); ?></div>
						<div class="inner-cta-sub-heading"><?php the_field( 'first_cta_sub_heading' ); ?></div>
						<a href="<?php echo get_bloginfo( 'url' ); ?>/contact" class="cta-btn yellow">Learn More</a>
					</div>
				</div>

			</div>

		</section>

		<section class="side-by-side-ctas">

			<div class="left-cta bottom-cta">

				<div class="cta-img" style="background: url(<?php the_field( 'second_cta_image' ); ?>) no-repeat; background-position: center; background-size: cover;"></div>

				<div class="overlay"></div>
				<div class="outer">

					<div class="inner">

						<div class="inner-cta-container">
							<div class="center">
								<div class="inner-cta-title"><?php the_field( 'second_cta_title' ); ?></div>
								<div class="inner-cta-sub-heading"><?php the_field( 'second_cta_sub_heading' ); ?></div>
								<a href="https://knightcash.ucf.edu/"  target="_blank" class="cta-btn yellow">Log In</a>
							</div>
						</div>

					</div>

				</div>
			</div>

			<div class="right-cta bottom-cta">

				<div class="cta-img" style="background: url(<?php the_field( 'third_cta_image' ); ?>) no-repeat; background-position: center; background-size: cover;"></div>

				<div class="overlay"></div>
				<div class="outer">
					<div class="inner">

						<div class="inner-cta-container">
							<div class="center">
								<div class="inner-cta-title"><?php the_field( 'third_cta_title' ); ?></div>
								<div class="inner-cta-sub-heading"><?php the_field( 'third_cta_sub_heading' ); ?></div>
								<a href="<?php echo get_bloginfo( 'url' ); ?>/distance-learning" class="cta-btn yellow">Learn More</a>
							</div>
						</div>

					</div>
				</div>
			</div>
				<div class="clear"></div>
		</section> <?php /* End Bottom CTAs Section */ ?>


	</div>


<?php endwhile; endif; ?>

<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/card-services-menu.js'; ?>"></script>
<?php get_template_part( 'section', 'card-services-footer' ); ?>
