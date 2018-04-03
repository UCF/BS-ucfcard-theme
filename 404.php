<?php /*
Template Name: 404 Page
*/ ?>

<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>
	
	<div id="card-service-wrap">

		<section class="card-services-header" style="background: url(<?php echo get_field( 'header_image_2', 1119 ); ?>) no-repeat; background-position: center; background-size: cover;">

			<div class="outer">

				<div class="inner">

					<div class="header-container">
						<h1 class="header-quote">404 Error</h1>
						<div class="header-sub-heading">Page Not Found</div>
					</div>

				</div>

			</div>

		</section> <?php /* END 404 Header */ ?>

		<section class="white-section not-found">

			<div class="section-container-1 alt">

				<div class="center-pad">
					<div class="section-desc no-margin-top">
						<h1>Did you mean to go to these pages?</h1>
					</div>
				</div>

			</div>

			<div class="center-pad">

				<div class="form-nav grey-container not-found-nav">

					<ul>
						<li>
							<a href="<?php echo get_bloginfo( 'url' ); ?>/knight-cash">Knight Cash</a>
						</li>
						<li>
							<a href="<?php echo get_bloginfo( 'url' ); ?>/about-the-card">About the Card</a>
						</li>
						<li>
							<a href="<?php echo get_bloginfo( 'url' ); ?>/departments">Departments</a>
						</li>
						<li>
							<a href="<?php echo get_bloginfo( 'url' ); ?>/contact">Contact</a>
						</li>
						<li>
							<a href="<?php echo get_bloginfo( 'url' ); ?>/contact">Lost Your Card?</a>
						</li>
						<li>
							<a target="_blank" href="https://knightcash.ucf.edu/">Login</a>
						</li>
					</ul>

				</div>

			</div>

		</section> <?php /* END Whats New Section */ ?>

	</div>

<?php get_template_part( 'section', 'card-services-footer' ); ?>