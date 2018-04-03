<?php get_header(); ?>

<section id="content" class="main-page-template">

	<div class="center">
		<div class="formatted">
			<?php if(have_posts()) : while(have_posts()) : the_post(); ?>
				<?php the_content(); ?>
			<?php endwhile; endif; ?>
		</div>
	</div>

</section>
<?php //end content ?>

<?php get_footer(); ?>