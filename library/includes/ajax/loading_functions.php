<?php 






// =- =- =- =- -= =- =- =- =- =- =-
//
//	Print Partners
//
// =- =- =- =- =- =- =- =- =- =- =- */

function print_partner($post){

	$cf = get_fields($post->ID);
	$title = get_the_title();

	$thumb_id = get_post_thumbnail_id();
	$thumb_url_array = wp_get_attachment_image_src($thumb_id, 'single-hero', true);
	$thumb_url = $thumb_url_array[0];

	$pattern = '/default.png/';
	$is_default_img = preg_match($pattern, $thumb_url);

	if ($cf['partner_logo']) {
		$logo_sizes = $cf['partner_logo']['sizes'];
		$logo_url = $logo_sizes['partner-logo'];
	}

	?>

		<?php if (get_field('partner_url')): ?>
			<a href="<?php echo get_field('partner_url'); ?>" class="a-partner" style="background-image: url('<?php if(isset($thumb_url)){ echo $thumb_url; } ?>'); background-size: cover; background-repeat: no-repeat; background-position: center;" target="_blank">
		<?php else: ?>
			<a href="https://businessservices.ucf.edu" class="a-partner" style="background-image: url('<?php echo $thumb_url; ?>'); background-size: cover; background-repeat: no-repeat; background-position: center;" target="_blank">
		<?php endif ?>
			<div class="static-overlay"></div>
			<div class="partner-logo">
				<img src="<?php echo $logo_url; ?>" alt="Logo for <?php echo $title; ?>">
			</div>
			<div class="title-bar">
				<div class="title">
					<h3><?php echo $title; ?></h3>
				</div>
				<div class="explore">
					<span>Explore</span>
				</div>
				<div class="clear"></div>
			</div>
		</a>



	<?php


}




// =- =- =- =- -= =- =- =- =- =- =-
//
//	Home Partners Ajax Filter
//
// =- =- =- =- =- =- =- =- =- =- =- */

add_action( 'wp_ajax_filter_partners', '_filter_partners' );
add_action( 'wp_ajax_nopriv_filter_partners', '_filter_partners' );

function _filter_partners() {

	global $post;

	/* Setup Variables */
	$counter = 0;
	$id = $_POST['id'];

	if($id && $id != 'all'){

		$args = array(
			'post_type' => 'jtwc_partners',
			'posts_per_page'   => -1,
			'order' => 'ASC',
			'orderby' => 'title',
			'tax_query' => array(
				array(
					'taxonomy' => 'partner_type',
					'field'    => 'slug',
					'terms'    => $id
				)
			)
		);
		$partners = get_posts($args);

	} else {

		$args = array(
			'post_type' => 'jtwc_partners',
			'posts_per_page'   => -1,
			'order' => 'ASC',
			'orderby' => 'title'
		);
		$partners = get_posts($args);

	}


	foreach($partners as $post){ setup_postdata($post);

		print_partner($post);

	}

	die();

}



// =- =- =- =- -= =- =- =- =- =- =-
//
//	PRINT POSTS
//
// =- =- =- =- =- =- =- =- =- =- =- */
function print_post($post){ ?>

	<?php 

	$categories = get_the_category();
	$post_cat = $categories[0]->name;

	/* Obtain Thumbnail Information */
	$thumb_id = get_post_thumbnail_id();
	if($thumb_id){
		$thumb_url_array = wp_get_attachment_image_src($thumb_id, null, true);
		$thumb_url = $thumb_url_array[0];

		$pattern = '/default.png/';
		$is_default_img = preg_match($pattern, $thumb_url);
	}

	if(get_field('additional_images')){
		$additional_images = get_field('additional_images');

		$has_carousel = count($additional_images) ? true : false;
	}


	 ?>
	
	<div class="a-post" data-carousel="<?php if(isset($has_carousel) && $has_carousel != 0){ echo $has_carousel; } ?>">
	
		<a href="<?php echo get_permalink(); ?>" class="the-img post-trigger" 
			style="background-image:url('<?php if(isset($thumb_url)){ echo $thumb_url; } ?>'); background-size: cover; background-position: center; background-repeat: no-repeat"
			data-post='<?php echo $post->ID; ?>' data-cat="<?php echo $post_cat; ?>">
		</a>
		
		<div class="the-text">
			<h4 class="post-title"><a href="<?php echo get_permalink(); ?>" class="post-trigger" data-post='<?php echo $post->ID; ?>' data-cat="<?php echo $post_cat; ?>"><?php echo get_the_title(); ?></a></h4>
			<span class="post-cat"><?php echo $post_cat; ?>&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;</span>
			<span class="post-date"><?php echo the_time( 'm.d.Y' ); ?></span>
			<div class="the-content">
				<p><?php echo custom_excerpt(get_the_content(), 35); ?></p>
			</div>

			<a href="<?php echo get_permalink(); ?>" class="black-btn post-trigger" data-post='<?php echo $post->ID; ?>' data-cat="<?php echo $post_cat; ?>">
				<span>Read More</span>
			</a>
		</div>
	</div>


<?php }



// =- =- =- =- -= =- =- =- =- =- =-
//
//	Blog Ajax Page Filter
//
// =- =- =- =- =- =- =- =- =- =- =- */

add_action( 'wp_ajax_filter_posts', '_filter_posts' );
add_action( 'wp_ajax_nopriv_filter_posts', '_filter_posts' );

function _filter_posts() {

	global $post;

	/* Setup Variables */
	$counter = 0;
	$id = $_POST['id'];

	if($id && $id != 'all'){

		$args = array(
			'post_type' => 'post',
			'posts_per_page'   => -1,
			'order' => 'ASC',
			'orderby' => 'title',
			'category_name' => $id
		);
		$posts = get_posts($args);

	} else {

		$args = array(
			'post_type' => 'post',
			'posts_per_page'   => -1,
			'order' => 'ASC',
			'orderby' => 'title'
		);
		$posts = get_posts($args);

	}


	foreach($posts as $post){ setup_postdata($post);

		print_post($post);

	}

	die();

}







// =- =- =- =- -= =- =- =- =- =- =-
//
//	Get Post Info
//
// =- =- =- =- =- =- =- =- =- =- =- */

add_action( 'wp_ajax_load_post_info', 'load_post_info' );
add_action( 'wp_ajax_nopriv_load_post_info', 'load_post_info' );

function load_post_info() {

	$post_id = $_POST['post_id'];


	//options
	$options = array(
		'p'			=> $post_id,
		'post_type' => 'post',
		'post_status' => 'publish',
		'posts_per_page' => 1
	);
	

	//attempt to get posts
	$posts = new WP_Query( $options );

	if( $posts->have_posts() ) {
		while( $posts->have_posts() ) {
			$posts->the_post(); ?>

				<?php

					global $post;

					$category = get_the_category(); 
					$post_cat = $category[0]->cat_name;

					if(get_field('event_date2')){

						$event_date = get_field('event_date2');
						$date = date_create($event_date);
						$full_event_date = date_format($date,"l, F j");
						$event_month = date_format($date,"M");
						$event_day = date_format($date,"d");
					

					}

					$post_date = get_the_time('m/d/y');

					if(get_field('single_bg')){
						$post_hero = get_field('single_bg');
						$post_hero = $post_hero['url'];
					}

					if(get_field('additional_images')){
						$images = get_field('additional_images');
					}

					// pre_print_r($images);

				?>

				<?php if($post_cat == 'Events'){ ?>

					<div class="a-modal event">
						
						<?php if (isset($images) && count($images) > 0){ ?>
							<section class="left">
								<div class="left-arrow" data-cycle-cmd="prev" data-post="<?php echo $post->ID; ?>"></div>
								<div class="right-arrow" data-cycle-cmd="next" data-post="<?php echo $post->ID; ?>"></div>

								<div class="slide-container"
								 	data-cycle-log="false" 
									data-cycle-fx="scrollHorz" 
									data-cycle-slides=".featured-img" 
									data-cycle-swipe="true" 
									data-cycle-swipe-fx="scrollHorz"
									>
									
									<?php foreach($images as $image_array){ ?>

										<?php $img_url = $image_array['image']['url']; ?>

										<?php if ($img_url): ?>
											<div class="featured-img" style="background-image: url('<?php echo $img_url; ?>'); background-size: cover; background-repeat: no-repeat; background-position: center;"></div>
										<?php endif ?>

									<?php } ?>
									
								</div>

							</section>

						<?php } elseif(isset($post_hero)) { ?>

							<section class="left no-slider" style="background-image: url('<?php echo $post_hero; ?>');">
							</section>

						<?php } ?>

								
							
						
						<section class="right">
							<div class="title-bar"><h2><?php echo get_the_title(); ?></h2></div>
							<div class="info-bar">
								<div class="date-badge">
									<span class="top"><?php echo $event_month; ?></span>
									<span class="bottom"><?php echo $event_day; ?></span>
								</div>
								<div class="info-row row-1"><span class="date heading">Date:</span><span class="date mr20"><?php echo $post_date; ?></span><span class="date heading">Author:</span><span class="date"><?php the_author(); ?></span></div>
								<div class="info-row row-2"><h5><?php if(isset($full_event_date)){ echo $full_event_date; } ?></h5></div>
							</div>
							<div class="the-content">
								<div class="inner">
									<?php if(get_field('post_sub')){ ?>
										<h3 class="post-sub"><?php echo get_field('post_sub'); ?></h3>
									<?php } ?>
									<?php the_content(); ?>
								</div>
							</div>
						</section>

						<div class="clear"></div>

					</div>

				<?php } elseif($post_cat == 'Posts' || $post_cat == 'Deals'){ ?>


					<div class="a-modal other">
						
						<?php if (isset($images) && count($images) > 0): ?>
							<section class="left">

								<div class="left-arrow" data-cycle-cmd="prev" data-post="<?php echo $post->ID; ?>"></div>
								<div class="right-arrow" data-cycle-cmd="next" data-post="<?php echo $post->ID; ?>"></div>

								<div class="slide-container"
								 	data-cycle-log="false" 
									data-cycle-fx="scrollHorz" 
									data-cycle-slides=".featured-img" 
									data-cycle-swipe="true" 
									data-cycle-swipe-fx="scrollHorz"
									>
									
									<?php foreach($images as $image_array){ ?>

										<?php $img_url = $image_array['image']['url']; ?>

										<div class="featured-img" style="background-image: url('<?php echo $img_url; ?>'); background-size: cover; background-repeat: no-repeat; background-position: center;"></div>

									<?php } ?>
									
								</div>
							
							</section>
						<?php endif ?>
						<section class="right">
							<div class="title-bar"><h2><?php echo get_the_title(); ?></h2></div>
							<div class="info-bar"><span class="date heading">Date:</span><span class="date mr20"><?php echo $post_date; ?></span><span class="date heading">Author:</span><span class="date"><?php the_author(); ?></span></div>
							<div class="the-content">
								<div class="inner">
									<?php if(get_field('post_sub')){ ?>
										<h3 class="post-sub"><?php echo get_field('post_sub'); ?></h3>
									<?php } ?>
									<?php the_content(); ?>
								</div>
							</div>
						</section>

						<div class="clear"></div>

					</div>

				<?php } ?>
		
			
		<?php }
	} else {
		//no posts
		echo 0;
	}

	die();

}
