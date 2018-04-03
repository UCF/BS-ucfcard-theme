<!DOCTYPE html>

<!--[if lt IE 7]><html <?php language_attributes(); ?> class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if (IE 7)&!(IEMobile)]><html <?php language_attributes(); ?> class="no-js lt-ie9 lt-ie8"><![endif]-->
<!--[if (IE 8)&!(IEMobile)]><html <?php language_attributes(); ?> class="no-js lt-ie9"><![endif]-->
<!--[if gt IE 8]><!--> <html <?php language_attributes(); ?> class="no-js"><!--<![endif]-->

<head>
	<meta charset="utf-8">
	
	<title><?php wp_title('&laquo;', true, 'right'); ?> <?php bloginfo('name'); ?></title>
	
	<?php //mobile meta (hooray!) ?>
	<meta name="HandheldFriendly" content="True">
	<meta name="MobileOptimized" content="320">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
	
	<?php //hide iOS browser bar ?>
	<meta name="apple-mobile-web-app-capable" content="yes" />

	<!--[if IE]>
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<![endif]-->
	
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/css/reset.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/css/style.css" type="text/css" media="screen" />
	<link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/css/skins/flat/yellow.css" type="text/css" media="screen" />


	<!--[if lt IE 9]>
		<script src="<?php echo THEME_URL.'/library/js/css3-mediaqueries.min.js'; ?>"></script>
		<script src="<?php echo THEME_URL.'/library/js/html5shiv.js'; ?>"></script>
		<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/css/ie.css" type="text/css" media="screen" />
	<![endif]-->
	

	<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

	<?php /* Favicon */ ?>
	<link rel="shortcut icon" href="<?php bloginfo('stylesheet_directory'); ?>/library/images/favicon.ico" />
	
	<?php /* jQuery UI */ ?>
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/js/jqueryui/jquery-ui.min.css" type="text/css" media="screen" />	


	<?php /* FancyBox */ ?>
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/js/fancybox/source/jquery.fancybox.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/js/fancybox/source/helpers/jquery.fancybox-buttons.css" type="text/css" media="screen" />
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/js/fancybox/source/helpers/jquery.fancybox-thumbs.css" type="text/css" media="screen" />

	<?php /* FancySelect */ ?>
	<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/library/js/fancyselect/fancySelect.css" type="text/css" media="screen" />

	<?php /* Typekit */ ?>
	<script src="//use.typekit.net/ahs4vma.js"></script>
	<script>try{Typekit.load();}catch(e){}</script>
	<?php gravity_form_enqueue_scripts( 4, TRUE ); ?>
	
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

<article id="the-modal" style="display: none">

	<div id="fancybox-content"></div>
	
</article>


<div class="popup-overlay" style="display: none;"></div>

<div id="Popup" style="display: none;">
	<div class="center-pad"></div>
</div>

<article id="wrap">


<?php get_template_part( 'section', 'card-services-header' ); ?>

