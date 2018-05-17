<?php /*
Template Name: Card Services Home
*/ ?>

<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>

<?php if ( have_posts() ) : while( have_posts() ) : the_post(); ?>

	<div id="card-service-wrap">
		<?php /* =- =- =- =- =- =- =- = =- 

				TOP CTAS

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<?php if ( get_field( 'left_cta_image' ) && get_field( 'right_cta_image' ) ) { ?>
				<section class="side-by-side-ctas">

					<div class="left-cta" style="background: url(<?php echo get_field( 'left_cta_image' ); ?>) no-repeat; background-position: center; background-size: cover;">
						<div class="outer">

							<div class="inner">

								<div class="inner-cta-container">
									<div class="center">
										<div class="inner-cta-title"><?php the_field( 'left_cta_title' ); ?></div>
										<div class="inner-cta-sub-heading"><?php the_field( 'left_cta_sub_heading' ); ?></div>
										<a href="<?php echo get_bloginfo( 'url' ); ?>/about-the-card" class="cta-btn yellow">Learn More</a>
									</div>
								</div>

							</div>

						</div>
					</div>

					<div class="right-cta" style="background: url(<?php echo get_field( 'right_cta_image' ); ?>) no-repeat; background-position: center; background-size: cover;">
						<div class="outer">
							<div class="inner">

								<div class="inner-cta-container">
									<div class="center">
										<div class="inner-cta-title"><?php the_field( 'right_cta_title' ); ?></div>
										<div class="inner-cta-sub-heading"><?php the_field( 'right_cta_sub_heading' ); ?></div>
										<a href="https://knightcash.ucf.edu/" target="_blank" class="cta-btn blue">Add Knight Cash</a>
									</div>
								</div>

							</div>
						</div>
					</div>

				</section> <?php /* End Top CTAs Section */ ?>
				<div class="clear"></div>
			<?php } ?>

		<?php /* =- =- =- =- =- =- =- = =- 

				WELCOME SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<?php if ( get_field( 'welcome_section_title' ) && get_field( 'welcome_section_content' ) ) { ?>
				<section class="white-section">

					<div class="section-container-1">

						<div class="center-pad">
							<h2 class="section-title"><?php the_field( 'welcome_section_title' ); ?></h2>
							<div class="section-desc"><?php the_field( 'welcome_section_content' ); ?></div>
						</div>

					</div>

				</section> <?php /* End Welcome Section */ ?>
			<?php } ?>

			<?php /* =- =- =- =- =- =- =- = =- 

				INFO SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<?php 
				$services = get_field( 'services' ); 

				if ( !empty( $services ) ) { ?>

					<section class="info-section bubs" style="background: url(<?php bloginfo('template_directory'); ?>/library/images/bubs-bg.jpg) no-repeat; background-size: cover; background-position: center;">
						<div class="overlay"></div>

						<div class="section-info-container">	
							<div class="center-pad">

								<h2 class="section-title"><?php the_field( 'our_services_title' ); ?></h2>
								<div class="title-divider"></div>

								<ul class="info-block-list">
									<?php foreach ( $services as $service ) { ?>
										<li>
											<?php if ( is_numeric( $service['link'] ) ) { ?>
												<a href="<?php echo get_permalink( $service['link'] ); ?>" class="info-block-header-img" style="background: url(<?php echo $service['header_image']; ?>) no-repeat; background-size: cover; background-position: center;"></a>
											<?php } else { ?>
												<a href="<?php echo $service['link']; ?>" class="info-block-header-img" style="background: url(<?php echo $service['header_image']; ?>) no-repeat; background-size: cover; background-position: center;"></a>
											<?php } ?>
											<div class="info-block-title"><?php echo $service['title']; ?></div>
											<div class="info-block-desc"><?php echo $service['description']; ?></div>
											<?php if ( is_numeric( $service['link'] ) ) { ?>
												<a href="<?php echo get_permalink( $service['link'] ); ?>" class="cta-btn yellow">Learn More</a>
											<?php } else { ?>
												<a href="<?php echo $service['link']; ?>" target="_blank" class="cta-btn yellow">Learn More</a>
											<?php } ?>
										</li>
									<?php } ?>
								</ul>

								<div class="clear"></div>

							</div>
						</div>

					</section> <?php /* End Info Section */ ?>

				<?php } 
			?>

			<?php /* =- =- =- =- =- =- =- = =- 

				UCF CARD SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<section id="ucf-card-section" class="white-section">

				<div class="section-container-1">

					<div class="center-pad">
						<h2 class="section-title"><?php the_field( 'ucf_card_section_title' ); ?></h2>
						<div class="section-desc"><?php the_field( 'ucf_card_section_description' ); ?></div>
					</div>

				</div>

				<div class="float-container wid-940 card-info-section align-center">

					<div class="center-pad">

						<div class="left-container">

							<!-- <div class="id-card" style="background: url(<?php bloginfo('template_directory'); ?>/library/images/ucfCard.png) no-repeat; background-size: cover; background-position: center;"></div> -->
							
							<div class="img-container">
								<img src="<?php bloginfo('template_directory'); ?>/library/images/ucf-card-placeholder.jpg" />
							</div>

						</div>

						<div class="right-container">
							<div class="card-desc"><?php the_field( 'card_info_description' ); ?></div>
							<a href="<?php echo get_bloginfo( 'url' ); ?>/about-the-card" class="cta-btn yellow">Learn More</a>
						</div>

					</div>

					<div class="clear"></div>

				</div>

			</section> <?php /* UCF Card Section */ ?>

			<?php /* =- =- =- =- =- =- =- = =- 

				WHATS NEW SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<section id="post-list-section" class="white-section grey-section">

				<div class="section-container-1">

					<div class="center-pad">
						<h2 class="section-title"><?php the_field( 'whats_new_title' ); ?></h2>
						<div class="section-desc">
							<?php the_field( 'whats_new_description' ); ?>
						</div>
					</div>

				</div>

				<div class="center-pad">

					<ul class="post-list">

						<?php

							$post_args = array(
								'post_type' => 'post',
								'posts_per_page' => 4,
								'order' => 'DESC',
								'orderby' => 'ID',
								'post_status' => 'publish'
							);

							$posts = get_posts($post_args);

							$post_counter = 1;

							foreach ( $posts as $post ) { ?>
								<li data-post-id="<?php echo $post->ID; ?>" class="<?php if ( $post_counter & 1 ) { echo 'first'; }  ?><?php if ( $post_counter == 1 || $post_counter == 2 ) { echo ' top'; } ?>">

									<article class="post-container" data-post-id="<?php echo $post->ID; ?>">

										<?php $thumb = wp_get_attachment_image_src(get_post_thumbnail_id( $post->ID ), 'post-thumbnail'); ?>
										<a href="#" class="post-header" style="background: url(<?php echo $thumb['0']; ?>) no-repeat; background-size: cover; background-position: center;">
											<div class="overlay"></div>
										</a>

										<div class="post-content-container">

											<a href="#" class="post-title"><?php echo $post->post_title; ?></a>

											<div class="post-content">
												<?php 
													if ( strlen( $post->post_content ) > 150 ) {
														echo substr( $post->post_content, 0, 150 ) . '...';
													} else {
														echo $post->post_content; 
													}
												?>
											</div>

										</div>

									</article>

								</li>
							<?php $post_counter++; }

						?>

						<div class="clear"></div>

					</ul>

					<?php $post_count = wp_count_posts( 'post' ); if ( $post_count->publish > 4 ) { ?>
						<div class="load-more-container">
							<a id="loadMorePosts" href="#" class="cta-btn yellow">Load More</a>
						</div>
					<?php } ?>

				</div>


			</section> <?php /* End Whats New Section */ ?>

			<?php /* =- =- =- =- =- =- =- = =- 

				NEWSLETTER SIGN UP SECTION

			=- =- =- =- =- =- =- =- =- =- =- */ ?>

			<section class="newsletter-sign-up">

				<div class="outer">

					<div class="inner">

						<div id="newsletter-success">
							<div class="success-title">Thank You</div>
							<div class="success-sub-heading">WE WILL KEEP YOU INFORMED</div>
						</div>

						<div id="newsletter-form">

							<div class="center-pad">

								<h3 class="newsletter-heading"><?php the_field( 'newsletter_headline', 21 ); ?></h3>

								<?php gravity_form( 2, false, true, false, null, true, null ); ?>

								<div class="clear"></div>

							</div>

						</div>

						<div class="clear"></div>

					</div>

				</div>


			</section>

	</div>


<?php endwhile; endif; ?>

<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/card-services-menu.js'; ?>"></script>
<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/TweenMax.min.js'; ?>"></script>
<script type="text/javascript" src="<?php echo THEME_URL . '/library/js/jquery.scrollmagic.min.js'; ?>"></script>

<script type="text/javascript">
	var ajax_url = '<?php echo admin_url('admin-ajax.php'); ?>';
</script>

<script type="text/javascript">
	
	jQuery(document).ready(function($) {

		$(document).bind('gform_post_render', function() {
 			$("#newsletter-form .gform_heading").detach().prependTo('.gform_footer').wrap('<div class="disclaimer-msg"></div>');
	    });

	    $("#newsletter-form .gform_heading").detach().prependTo('.gform_footer').wrap('<div class="disclaimer-msg"></div>');

	    $(document).bind('gform_confirmation_loaded', function(event, formId){
		    $('.newsletter-heading').remove();
		    //$('#newsletter-success').fadeIn( 500 );
		});

		$('body').on( 'click', '.post-header, .post-title', function(evt) {

			evt.preventDefault();

			if ( !$('body').hasClass( 'loading-post' ) ) {
				/* Get Post ID */
				$article_ID = $(this).parent().parent().data( 'post-id' );

				/* Send Form */	
				$.ajax({
					url: ajax_url,
					type: 'POST',
					data: { 'action' : 'popupArticle', 'article_ID' : $article_ID },
					beforeSend: function() {
						$('body').addClass( 'loading-post' );
					},
					success: function(result) {
						var popup_data = JSON.parse(result);

						$('.popup-overlay').fadeIn( 500 );
						$('#Popup').find('.center-pad').append( popup_data.article_html )
						$('#Popup').fadeIn( 500 );
						$('body').removeClass( 'loading-post' );

					}
				});
			}

		} );

		//Close Popup
		$('body').on( 'click', '.popup-close', function(evt) {

			evt.preventDefault();

			$('.popup-overlay').fadeOut( 500 );
			$('#Popup').fadeOut( 500, function() {
				$('.article-popup').parent().parent().remove();
			} );

		} );

		$('#loadMorePosts').on( 'click', function(evt) {

			evt.preventDefault();

			/* Get Post Offset */
			$offset = $('.post-list li').length;

			/* Send Form */	
			$.ajax({
				url: ajax_url,
				type: 'POST',
				data: { 'action' : 'loadMoreArticles', 'offset' : $offset },
				success: function(result) {
					var popup_data = JSON.parse(result);

					if ( popup_data.finished ) {
						$('.load-more-container').fadeOut( 500 );
					}

					$('.post-list').append( popup_data.articles_html );

					$('.post-list li.ajax-loaded').fadeIn( 500 );

				}
			});


		} );

	});

</script>


<?php get_template_part( 'section', 'card-services-footer' ); ?>



