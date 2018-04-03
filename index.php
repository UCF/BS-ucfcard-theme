<?php /*
Template Name: Blog
*/ ?>

<?php get_header(); ?>

<section id="content" class="blog">

	<div class="center wide">
		
		<?php /* =- =- =- =- =- =- =- =- =- =-

			HEADING

		=- =- =- =- =- =- =- =- =- =- =- =- =-*/ ?>
		<?php if (get_field('main_heading')){ ?>
			<h2 class="section-title"><?php echo get_field('main_heading'); ?></h2>
		<?php }else{ ?>
			<h2 class="section-title">What's Happening</h2>
		<?php } ?>

		<?php /* =- =- =- =- =- =- =- =- =- =-

			#posts-filter

		=- =- =- =- =- =- =- =- =- =- =- =- =-*/ ?>
		<div id="posts-filter">
			<?php 

			$categories = array('partner_type');

			$args = array(
				'type'			=> 'post',
			    'orderby'           => 'name', 
			    'order'             => 'ASC',
			    'hide_empty'        => false,
			); 

			$categories = get_categories($args);

			// pre_print_r($partner_types);

			?>

			<a href="#" class="a-filter active" data-category="all">
				<span>ALL</span>
			</a>

			<?php foreach($categories as $term){ ?>

				<a href="#" class="a-filter" data-category="<?php echo $term->slug; ?>">
					<span><?php echo $term->name; ?></span>
				</a>

			<?php } 

			wp_reset_postdata();

			?>
		</div>


		<div id="posts">
				<?php if(have_posts()) : while(have_posts()) : the_post(); ?>

					<?php global $post;

						print_post($post);

					 ?>

				<?php endwhile; endif; ?>
		</div>

	</div>
	




	<?php /* =- =- =- =- =- =- =- =- =- =-

		FIND US CTA

	=- =- =- =- =- =- =- =- =- =- =- =- =-*/ ?>
	<div id="find-us-cta" class="a-cta">
		
		<a href="<?php echo get_bloginfo('url'); ?>/contact" class="left">

			<div class="background"></div>

			
			<div class="inner">
				<h5>Find Us</h5>
				<p>Located on campus for your convenience</p>
			</div>

		</a>

		<a href="<?php echo get_bloginfo('url'); ?>/contact" class="right">

			<div class="background"></div>

			<div class="inner">
				<h3>FAQ</h3>
				<p>Do you have questions?</p>
				<p>We Have answers.</p>
			</div>
		</a>

		<div class="clear"></div>

	</div><?php /* end .a-cta */ ?>



</section>
<?php //end content ?>


<script type="text/javascript">

	jQuery(document).ready(function($){

		var sw = document.body.clientWidth;

		/* - = - = - = - = - = - = - =- = = - =- = = - =- =

			Post Filter

		- = - = - = - = - = - = - = - = - = = - =- = = - =- = */
		$('.a-filter').on('click', function(e) {

			e.preventDefault();

			var 	filter = $(this).data('category'),
				container = $('#posts'),
				loader = $('.loading-indicator');

			//Remove Active Class From Other Filter
			$('#posts-filter .a-filter.active').removeClass('active');

			//Add Active Class to clicked filter
			$(this).addClass('active');

	
			var dataObj = {
				action: 'filter_posts',
				id: filter
			}

			$.ajax({
			    type: "POST",
			    url: '<?php echo admin_url('admin-ajax.php'); ?>',
			    data: dataObj,
			    beforeSend: function(arg) {


				    	//Show Ajax Loader
				    	loader.show();

				    	// console.log(arg);

			    },
			    error: function(xhr, status, error){

			    		console.log(xhr);

			    },
			    success: function(result, status, jqxhr) {

			    		//Add New Slides

	    			    	//Remove Current Slides
	    		    		container.fadeOut(200, function(){
	    		    			container.html('');
	    		    			container.html(result).fadeIn(200);
	    		    		});

			    }/* end success */

			}); /* end $.ajax */


		});/* end .partner-filter click event */



		/* - = - = - = - = - = - = - =- = = - =- = = - =- =

			Load Post Info

		- = - = - = - = - = - = - = - = - = = - =- = = - =- = */
		$('.a-post[data-carousel="1"]').on('click', '.post-trigger', function(e){

			if(sw >= 1080 && !$('html').hasClass('lt-ie9')){
				e.preventDefault();

				var post_data = $(this).data(),
					container = $('#fancybox-content');

				var dataObj = {
					action: 'load_post_info',
					post_id: post_data.post,
					post_cat: post_data.cat
				}

				$.ajax({
				    type: "POST",
				    url: '<?php echo admin_url('admin-ajax.php'); ?>',
				    data: dataObj,
				    dataType: "html",
				    beforeSend: function(arg) {

				    },
				    responseText: function(result){

				    },
				    success: function(result) {

				    	container.html(result);

						$.fancybox.open([{ href : '#fancybox-content' }], {
							wrapCSS	  : 'modal-wrap',
							openEffect  : 'none',
							'padding'   : 0,
							fitToView   : false,
							autoSize    : false,
							closeEffect : 'none',
							scrolling	  : 'no',
							helpers     : {
								media  	: {},
								overlay	: {
									locked: false
								}
					    		}
						});

						$( '.slide-container' ).cycle();

				    }/* end success */

				}); /* end $.ajax */


				return false;
			}

		});






	});
</script>

<?php 


wp_enqueue_script( 'cycle2_lib', THEME_URL.'/library/js/cycle2/cycle2.js', array( 'jquery' ) );
wp_enqueue_script( 'cycle2_swipe', THEME_URL.'/library/js/cycle2/cycle2.swipe.js', array( 'jquery' ) );

 ?>

<?php get_footer(); ?>