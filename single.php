<?php get_header(); ?>

<section id="content" class="blog single">

	<?php if (get_field('single_bg')): ?>
		<?php /* =- =- =- =- =- =- =- = =- 

			HERO

		=- =- =- =- =- =- =- =- =- =- =- */ ?>

		<?php 	

				$post_hero = get_field('single_bg');
				$post_hero = $post_hero['url'];

		 ?>
		<div id="hero" style="background-image: url('<?php echo $post_hero; ?>'); background-size: cover; background-position: center; background-repeat: no-repeat;">

		<img class="ie-fallback" src="<?php echo $post_hero; ?>" alt="">

		</div>
	<?php endif ?>

	
		<?php if (get_field('single_bg')): ?>
			<div class="center">
		<?php else: ?>
			<div class="center no-hero">
		<?php endif ?>
		<div id="post-wrap">
			<?php if(have_posts()) : while(have_posts()) : the_post(); ?>

				<?php 

					$date = get_the_time('m/d/y');
					$month = get_the_time('M');
					$day = get_the_time('d');


					$categories = get_the_category();
					$post_cat = $categories[0]->name;

					$post_date = get_the_time('m/d/y');

					if(get_field('event_date2')){

						$event_date = get_field('event_date2');

						// var_dump($event_date);

						$date=date_create($event_date);
						$full_event_date = date_format($date,"l, F j");

					}

				?>
			
				<div class="container">
					
					<div id="title-bar">
						
						<?php if (isset($full_event_date)): ?>
							<div class="full-event-date">
								<h5>Event: &nbsp;&nbsp;<?php echo $full_event_date; ?></h5>
							</div>
						<?php endif ?>
						<h2 class="post-title"><?php echo get_the_title(); ?></h2>
						<?php if(get_field('post_sub')){ ?>
							<h3 class="post-sub"><?php echo get_field('post_sub'); ?></h3>
						<?php } ?>
						<div class="divider">
							<h4 class="author">
								<span class="date heading">By:</span><span class="date mr20"><?php the_author(); ?></span>
								<span class="date"><?php echo $post_date; ?></span>
							</h4>
						</div>

					</div>

					<div class="the-content">
						<?php the_content(); ?>
					</div>

					<div class="bottom-divider"></div>


					<?php /* =- =- =- =- =- =- =- =- =-
					//
					//		Related Readings
					//
					// =- =- =- =- =- =-=- =- =- =- =-=- */ ?>
					<?php /* setup */

						if (isset($post_cat) && $post_cat != 'Posts') {
							$args = array(
								'post_type' => 'post',
								'posts_per_page'   => 2,
								'order' => 'ASC',
								'category_name' => $post_cat
							);
							$related_readings = get_posts($args);
						} else {
							$args = array(
								'post_type' => 'post',
								'posts_per_page'   => 2,
								'orderby' => 'rand'
							);
							$related_readings = get_posts($args);

							
						}


					 ?>

					 <div id="related-tiles">
					 <?php $count = 0; ?>
					 	<?php foreach($related_readings as $post){ setup_postdata($post); ?>

					 		<?php 

					 			/* Obtain Thumbnail Information */
					 			$thumb_id = get_post_thumbnail_id();
					 			if($thumb_id){
					 				$thumb_url_array = wp_get_attachment_image_src($thumb_id, null, true);
					 				$thumb_url = $thumb_url_array[0];

					 				$pattern = '/default.png/';
					 				$is_default_img = preg_match($pattern, $thumb_url);
					 			}

					 		 ?>

					 		<a href="<?php echo get_permalink(); ?>" class="a-tile<?php if($count == 0){ echo ' gold'; } ?>" style="background-image:url('<?php echo $thumb_url; ?>'); background-size: cover; background-position: center; background-repeat: no-repeat">
					 			<div class="the-text">
					 				<div class="inner">	
						 				<h4 class="post-title"><?php echo get_the_title(); ?></h4>
						 				<div class="date-row">
						 					<span class="post-cat"><?php echo $post_cat; ?>&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;</span>
						 					<span class="post-date"><?php echo the_time( 'm.d.Y' ); ?></span>
						 				</div>
					 				</div>
					 			</div>
					 		</a>

					 		<?php $count++; ?>

					 	<?php } ?>

					 	<div class="clear"></div>

					 </div>


				</div>

			<?php endwhile; endif; ?>
			
		</div>
	</div>

	

</section>
<?php //end content ?>

<?php get_footer(); ?>