<?php

error_reporting(E_ALL);

show_admin_bar(false);

if(!defined('THEME_URL'))
	define('THEME_URL', get_bloginfo('template_directory'));

//	fix db after server move
//require_once( TEMPLATEPATH.'/library/includes/mysql-replace.php' );
//MySQL_Replace::replace('old', 'new');

//	dependencies
require_once( TEMPLATEPATH.'/library/includes/wp-header-remove.php' );
require_once( TEMPLATEPATH.'/library/includes/ajax/loading_functions.php' );

//	menus
register_nav_menus(array(
	'card-services-nav' => 'Card Services Nav',
	'card-services-mobile-nav' => 'Card Services Mobile Nav',
	'card-services-footer-account-nav' => 'Card Services Footer Account Nav',
	'card-services-footer-card-nav' => 'Card Services Footer Card Nav',
	'card-services-footer-help-nav' => 'Card Services Footer Help Nav'
));

//	post thumbnails
add_theme_support( 'post-thumbnails' );

add_image_size('partner-logo', 264, 169, false);

/* Google Analytics Settings Code */
$google_analytics_setting = new google_analytics_setting();
class google_analytics_setting {

    function google_analytics_setting() {
        add_filter( 'admin_init' , array( &$this , 'register_fields' ) );
    }

    function register_fields() {
        register_setting( 'general', 'google_analytics_code', '' );
        add_settings_field( 'fav_color', '<label for="google_analytics_code">' . __( 'Google Analytics Code' , 'google_analytics_code' ).'</label>' , array( &$this, 'fields_html' ) , 'general' );
    }

    function fields_html() {
        $value = get_option( 'google_analytics_code', '' );
        echo '<textarea rows="7" id="google_analytics_code" name="google_analytics_code" style="width: 100%;">' . $value . '</textarea>';
    }

}

/* Print Within WP Head */
add_action( 'wp_head', 'google_head' );
function google_head() {
	/* Google Analytics */ 
	if ( get_option( 'google_analytics_code' ) != FALSE ) { 
		echo get_option( 'google_analytics_code', '' );
	}
}

/**
 * Is login or register page
 * @author umbrovskis
 * @authorlink http://umbrovskis.com 
 */
function smc_is_login_page() {
    return in_array($GLOBALS['pagenow'], array('wp-login.php', 'wp-register.php'));
}

#	Scripts
########################################################
add_action( 'wp_print_scripts', 'spry_print_scripts' );

function spry_print_scripts() {
	
	if( is_admin() )
		return false;
	
	wp_enqueue_script( 'jquery' );
	wp_register_script( 'lib', THEME_URL.'/library/js/lib.js', array( 'jquery' ), '', true );
	wp_enqueue_script( 'lib' );

	wp_enqueue_script( 'jqueryui', THEME_URL.'/library/js/jqueryui/jquery-ui.min.js', array( 'jquery' ), '', true );


	wp_enqueue_script( 'fancy1', THEME_URL.'/library/js/fancybox/source/jquery.fancybox.pack.js', array( 'jquery' ) );
	wp_enqueue_script( 'fancy2', THEME_URL.'/library/js/fancybox/source/helpers/jquery.fancybox-buttons.js', array( 'jquery' ) );
	wp_enqueue_script( 'fancy3', THEME_URL.'/library/js/fancybox/source/helpers/jquery.fancybox-media.js', array( 'jquery' ) );
	wp_enqueue_script( 'fancy4', THEME_URL.'/library/js/fancybox/source/helpers/jquery.fancybox-thumbs.js', array( 'jquery' ) );


	wp_enqueue_script( 'fancyselect', THEME_URL.'/library/js/fancyselect/fancySelect.js', array( 'jquery' ) );

	if(!smc_is_login_page()){
		wp_enqueue_script( 'ucfhb', '//universityheader.ucf.edu/bar/js/university-header.js', array( 'jquery' ) );
	}

}

/* =- =- =- =-  -= - = -= -= -= =- =- 
//
//	Spry WP-Admin Favicon!!!!
//
// =- =- =- =- =- =- =- - = =- -= = - */

// First, create a function that includes the path to your favicon
function add_favicon() {
  	$favicon_url = get_stylesheet_directory_uri() . '/library/images/admin-favicon.png';
	echo '<link rel="shortcut icon" href="' . $favicon_url . '" />';
}
  
// Now, just make sure that function runs when you're on the login page and admin pages  
add_action('login_head', 'add_favicon');
add_action('admin_head', 'add_favicon');



#	General Functions
########################################################

//custom length excerpt
function my_excerpt($limit) {
  $excerpt = explode(' ', get_the_excerpt(), $limit);
  if (count($excerpt)>=$limit) {
	array_pop($excerpt);
	$excerpt = implode(" ",$excerpt).'...';
  } else {
	$excerpt = implode(" ",$excerpt);
  } 
  $excerpt = preg_replace('`\[[^\]]*\]`','',$excerpt);
  return $excerpt;
}

// =- =- =- =- -= =- =- =- =- =- =-
//
//	print_r with pre tags
//
// =- =- =- =- =- =- =- =- =- =- =- */

function pre_print_r($array){

	echo '<pre style="font-family: monospace; font-size: 14px; text-align:left!important">';
	print_r($array);
	echo '</pre>';

}


// =- =- =- =- -= =- =- =- =- =- =-
//
//	Custom Length Excerpts
//
// =- =- =- =- =- =- =- =- =- =- =- */
function custom_excerpt($content, $limit) {

	$excerpt = explode(' ', $content, $limit);	

	if (count($excerpt)>=$limit) {

		array_pop($excerpt);
		$excerpt = implode(" ",$excerpt).'...';

	} else {

		$excerpt = implode(" ",$excerpt);
		
	} 

	$excerpt = preg_replace('`\[[^\]]*\]`','',$excerpt);
	return $excerpt;
}

// =- =- =- =- -= =- =- =- =- =- =-
//
//	Article Popup
//
// =- =- =- =- =- =- =- =- =- =- =- */


add_action( 'wp_ajax_popupArticle', '_popupArticle' );
add_action( 'wp_ajax_nopriv_popupArticle', '_popupArticle' );

function _popupArticle() {

	$article_ID = filter_var( $_POST['article_ID'], FILTER_SANITIZE_STRING );
	$article = get_post( $article_ID );

	if ( !empty( $article ) && !empty( $article_ID ) ) { ob_start(); ?>
			<div class="outer">

				<div class="inner">
					<div class="article-popup">

						<?php $thumb = wp_get_attachment_image_src(get_post_thumbnail_id( $article->ID ), 'post-thumbnail'); ?>

						<div class="header" style="background: url(<?php echo $thumb['0']; ?>) no-repeat; background-size: cover; background-position: center;">
							<div class="overlay"></div>
							<div class="header-info-container">
								<a href="#" class="popup-close"></a>
							</div>
						</div>

						<article class="post-container">
							<div class="post-inner-container">
								<div class="center-pad">
									<h3><?php echo $article->post_title; ?></h3>
									<div class="post-content"><?php echo wpautop( $article->post_content ); ?></div>
								</div>
							</div>
						</article>

					</div>
				</div>

			</div>
		<?php 

		$article_html = ob_get_clean();

		die( json_encode( array(
			'code' => 1,
			'article_html' => $article_html
		)));
	
	} else {

		die( json_encode( array(
			'code' => 0,
			'message' => 'Invalid Article ID'
		) ) );

	}


}

// =- =- =- =- -= =- =- =- =- =- =-
//
//	Load More Articles
//
// =- =- =- =- =- =- =- =- =- =- =- */

add_action( 'wp_ajax_loadMoreArticles', '_loadMoreArticles' );
add_action( 'wp_ajax_nopriv_loadMoreArticles', '_loadMoreArticles' );

function _loadMoreArticles() {

	$offset = filter_var( $_POST['offset'], FILTER_SANITIZE_STRING );

	$post_args = array(
		'post_type' => 'post',
		'posts_per_page' => 4,
		'offset' => $offset,
		'order' => 'DESC',
		'orderby' => 'ID',
		'post_status' => 'publish'
	);

	$posts = get_posts( $post_args );

	$post_count_args = array( 'post_type' => 'post', 'post_status' => 'publish' );
	$post_count = get_posts( $post_count_args );
	$total_posts = count( $post_count );
	$found_posts = count( $posts );
	$check = $found_posts + $offset;

	if ( $total_posts >= $check ) {
		$finished = TRUE;
	} else {
		$finished = FALSE;
	}

	if ( !empty( $posts ) ) {
		$post_counter = $offset + 1;

		ob_start();

		foreach ( $posts as $post ) { ?>
			<li style="display: none;" data-post-id="<?php echo $post->ID; ?>" class="ajax-loaded <?php if ( $post_counter & 1 ) { echo 'first'; }  ?><?php if ( $post_counter == 1 || $post_counter == 2 ) { echo ' top'; } ?>">

				<article class="post-container">

					<?php $thumb = wp_get_attachment_image_src(get_post_thumbnail_id( $post->ID ), 'post-thumbnail'); ?>
					<a href="#" class="post-header" style="background: url(<?php echo $thumb['0']; ?>) no-repeat; background-size: cover; background-position: center;">
						<div class="overlay"></div>
						<div class="post-date"><?php echo get_the_date( 'F j, Y', $post->ID ); ?></div>
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

		$articles_html = ob_get_clean();

		die( json_encode( array(
			'code' => 1,
			'articles_html' => $articles_html,
			'finished' => $finished
		)));

	} else {

		die( json_encode( array(
			'code' => 0,
			'message' => 'No Articles Found'
		)));

	}


}

// =- =- =- =- -= =- =- =- =- =- =-
//
//	Newsletter Sign Up
//
// =- =- =- =- =- =- =- =- =- =- =- */

add_action( 'wp_ajax_newsletterSignUp', '_newsletterSignUp' );
add_action( 'wp_ajax_nopriv_newsletterSignUp', '_newsletterSignUp' );

function _newsletterSignUp() {

	$fields = array(			
		'first_name' 	=>	filter_var( $_POST['first_name'], FILTER_SANITIZE_STRING ),
		'last_name' 		=>	filter_var( $_POST['last_name'], FILTER_SANITIZE_STRING ),
		'email' 		=>	filter_var( $_POST['email'], FILTER_SANITIZE_STRING ),
	);

	$errors = array();

	if ( !array_key_exists( 'agree_terms' , $_POST ) ) {
		$errors[] = 'agree_terms';
	} else {
		$fields['agree_terms'] = 'agree_terms';
	}

	if ( empty( $fields['first_name'] ) ) {
		$errors[] = 'first_name';
	}

	if ( empty( $fields['last_name'] ) ) {
		$errors[] = 'last_name';
	}

	if ( empty( $fields['email'] ) ) {
		$errors[] = 'email';
	}

	if ( !empty( $errors ) ) {

		die( json_encode( array(
			'code' => 0,
			'message' => 'Please correct all errors before submitting.',
			'fields' => $errors
		)));

	} else {

		$to = 'cadron@wearespry.com';

		$subject = "UCF Card Services Newsletter Sign Up";
		$message = "Someone has signed up for the Newsletter!<br /><br />";
		
		//For Each Field add to E-Mail Body
		foreach( $fields as $k => $v ) {

			if ( $k != 'agree_terms' ) {
				//Add Each Field To E-Mail Body
				$message .= ucwords(str_replace('_', ' ', $k) ) . ': ' . stripslashes($v) . '<br /><br />';
			}
		}

		$headers = "From: no-reply@ucf.com\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
		$mail = mail( $to, $subject, $message, $headers );

		die( json_encode( array(
			'code' => 1,
			'message' => 'Thank you for your interest.'
		)));

	}

}

function aasort ( &$array, $key ) {
    $sorter = array();
    $ret = array();
    reset( $array );

    foreach ( $array as $ii => $va ) {
        $sorter[$ii] = $va[$key];
    }

    asort( $sorter );

    foreach ( $sorter as $ii => $va ) {
        $ret[$ii] = $array[$ii];
    }

    $array = $ret;
}

// =- =- =- =- -= =- =- =- =- =- =-
//
//	Department Form Submit
//
// =- =- =- =- =- =- =- =- =- =- =- */

add_action( 'wp_ajax_submit_department_contact', '_submit_department_contact' );
add_action( 'wp_ajax_nopriv_submit_department_contact', '_submit_department_contact' );

function _submit_department_contact() {

	$form_type = filter_var( $_POST['form_type'], FILTER_SANITIZE_STRING );
	$payee_type = filter_var( $_POST['payee_type'], FILTER_SANITIZE_STRING );
	$errors = array();
	$not_required = array( 'additional_comments' );

	switch ( $form_type ) {

		case 'ucf-card-id':

			$fields = array(			
				'name' 	   =>		filter_var( $_POST['name'], FILTER_SANITIZE_STRING ),
				'email'	   =>		filter_var( $_POST['email'], FILTER_SANITIZE_EMAIL ),
				'phone_number' =>   filter_var( $_POST['phone_number'], FILTER_SANITIZE_EMAIL ),
				'university' =>   filter_var( $_POST['university'], FILTER_SANITIZE_STRING ),
				'department_name' =>   filter_var( $_POST['department_name'], FILTER_SANITIZE_STRING ),
				'first_name' =>   filter_var( $_POST['first_name'], FILTER_SANITIZE_STRING ),
				'last_name' =>   filter_var( $_POST['last_name'], FILTER_SANITIZE_STRING ),
				'ucf_id_number' =>   filter_var( $_POST['ucf_id_number'], FILTER_SANITIZE_STRING ),
				'title' =>   filter_var( $_POST['title'], FILTER_SANITIZE_STRING ),
				'additional_comments' =>   filter_var( $_POST['additional_comments'], FILTER_SANITIZE_STRING ),
			);

			if ( $payee_type == 'department' ) {
				$fields['department_number'] = filter_var( $_POST['department_number'], FILTER_SANITIZE_STRING );
			}

		break;
		
		case 'department-badge':

			$fields = array(			
				'name' 	   =>		filter_var( $_POST['name'], FILTER_SANITIZE_STRING ),
				'email'	   =>		filter_var( $_POST['email'], FILTER_SANITIZE_EMAIL ),
				'phone_number' =>   filter_var( $_POST['phone_number'], FILTER_SANITIZE_EMAIL ),
				'department_name' =>   filter_var( $_POST['department_name'], FILTER_SANITIZE_STRING ),
				'first_name' =>   filter_var( $_POST['first_name'], FILTER_SANITIZE_STRING ),
				'last_name' =>   filter_var( $_POST['last_name'], FILTER_SANITIZE_STRING ),
				'ucf_id_number' =>   filter_var( $_POST['ucf_id_number'], FILTER_SANITIZE_STRING ),
				'title' =>   filter_var( $_POST['title'], FILTER_SANITIZE_STRING ),
				'additional_comments' =>   filter_var( $_POST['additional_comments'], FILTER_SANITIZE_STRING ),
			);

		break;

		case 'police-department':

			$fields = array(			
				'name' 	   =>		filter_var( $_POST['name'], FILTER_SANITIZE_STRING ),
				'email'	   =>		filter_var( $_POST['email'], FILTER_SANITIZE_EMAIL ),
				'phone_number' =>   filter_var( $_POST['phone_number'], FILTER_SANITIZE_EMAIL ),
				'police_department' =>   filter_var( $_POST['police_department'], FILTER_SANITIZE_STRING ),
				'department_name' =>   filter_var( $_POST['department_name'], FILTER_SANITIZE_STRING ),
				'first_name' =>   filter_var( $_POST['first_name'], FILTER_SANITIZE_STRING ),
				'last_name' =>   filter_var( $_POST['last_name'], FILTER_SANITIZE_STRING ),
				'ucf_id_number' =>   filter_var( $_POST['ucf_id_number'], FILTER_SANITIZE_STRING ),
				'title' =>   filter_var( $_POST['title'], FILTER_SANITIZE_STRING ),
				'additional_comments' =>   filter_var( $_POST['additional_comments'], FILTER_SANITIZE_STRING ),
			);

			if ( $payee_type == 'department' ) {
				$fields['department_number'] = filter_var( $_POST['department_number'], FILTER_SANITIZE_STRING );
			}

		break;

		case 'nursing':

		break;

	}

	/* Check Each Field */
	foreach ( $fields as $field => $value ) {

		if( !in_array ($field, $not_required ) && empty( $value ) ){
			$errors[] = $field;
		}

	}

	/* Check Email */
	$email_pattern = '/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/';
	if ( !preg_match( $email_pattern, $fields['email'] ) ) {
		$errors[] = 'email';
	}

	if( !empty( $errors ) ) {
		
		die( json_encode( array(
			'code' => 0,
			'message' => 'Please correct all errors before submitting.',
			'fields' => $errors
		)));
		
	} else {
			
		$to = 'cadron@wearespry.com';

		$subject = "UCF Card Services Submission";
		$message = "Someone has contacted you from a form on your site.<br /><br />";
		
		//For Each Field add to E-Mail Body
		foreach($fields as $k => $v){
			//Add Each Field To E-Mail Body
			$message .= ucwords(str_replace('_', ' ', $k) ) . ': ' . stripslashes($v) . '<br /><br />';
		}

		$headers = "From: no-reply@ucf.com\r\n";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
		$mail = mail( $to, $subject, $message, $headers );

		die( json_encode( array(
			'code' => 1,
			'message' => 'Thank you for your interest.'
		)));

	}


}

// =- =- =- =- -= =- =- =- -= =- =- =- -=
//	Locations - Post Type
// =- =- =- =- =- =- =- =- -= =- =- =- -=*/
add_action( 'init', 'register_locations_post_type' );
function register_locations_post_type() {
	$labels = array(
		'name' => __("Locations"),
		'singular_name' => __('Location'),
		'add_new_item' => __('Add New Location'),
		'edit_item' => __('Edit Location')
	);
	$args = array(
		'labels'             	=> $labels,
		'public'             	=> true,
		'publicly_queryable' 	=> true,
		'show_ui'				=> true,
		'show_in_menu'			=> true,
		'menu_icon'			=> 'dashicons-location',
		'query_var'         	=> true,
		'capability_type'   	=> 'post',
		'has_archive'       	=> true,
		'hierarchical'      	=> true,
		'menu_position'     	=> null,
		'supports'         	 	=> array( 'title', 'thumbnail', 'editor')
		// 'taxonomies'			=> array('cs_type')
	);

	register_post_type( 'ucf_locations', $args );
}

// =- =- =- =- -= =- =- =- -= =- =- =- -=
//	Faq - Post Type
// =- =- =- =- =- =- =- =- -= =- =- =- -=*/
add_action( 'init', 'register_faq_post_type' );
function register_faq_post_type() {
	$labels = array(
		'name' => __("FAQs"),
		'singular_name' => __('FAQ'),
		'add_new_item' => __('Add New FAQ'),
		'edit_item' => __('Edit FAQ')
	);
	$args = array(
		'labels'             	=> $labels,
		'public'             	=> true,
		'publicly_queryable' 	=> true,
		'show_ui'				=> true,
		'show_in_menu'			=> true,
		'query_var'         	=> true,
		'capability_type'   	=> 'post',
		'has_archive'       	=> true,
		'hierarchical'      	=> true,
		'menu_position'     	=> null,
		'supports'         	 	=> array( 'title', 'editor')
	);

	register_post_type( 'ucf_faqs', $args );
}

// =- =- =- =- -= =- =- =- -= =- =- =- -=
//	Faq Category - Taxonomy
// =- =- =- =- =- =- =- =- -= =- =- =- -=*/
add_action('init', 'register_faq_category_taxonomy');
function register_faq_category_taxonomy() {

	$taxonomy = 'faq_category';
	$object_type = 'ucf_faqs';

	$labels = array(
		'name'             	=> __('Faq Category'),
		'singular_name'     => __('Faq Category'),
		'edit_item'         => __('Edit Faq Category'),
		'add_new_item'		=> __('Add Faq Category')
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_admin_column' => true,
		'query_var'         => false,
		'rewrite'           => array('slug' => 'faq_category'),
	);

	register_taxonomy($taxonomy, $object_type, $args);
}
