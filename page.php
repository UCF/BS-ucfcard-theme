<?php get_header(); ?>

<?php get_template_part( 'section', 'card-services-menu' ); ?>

<section id="content" class="main-page-template">

	<div class="center">

		<div class="formatted">

			<?php if(have_posts()) : while(have_posts()) : the_post(); ?>

				<div id="card-service-wrap">


				<?php the_content(); ?>

			<?php endwhile; endif; ?>

		</div>

	</div>

</section>

<?php //end content ?>

<?php get_template_part( 'section', 'card-services-footer' ); ?>