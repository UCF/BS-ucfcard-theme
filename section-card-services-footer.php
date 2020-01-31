<footer id="card-services-footer">

	<div class="inner-footer-container">

		<div class="logo-container">

			<a href="<?php echo get_bloginfo( 'url' ); ?>" class="card-services-logo"></a>

			<div class="center-pad">
				<div class="footer-desc">
					<?php echo get_field( 'footer_description', 589 ); ?>
				</div>
			</div>

		</div>

		<div class="right-container">
			
			<ul class="menu-lists">

				<li>
					<div class="footer-menu-title">Account</div>
					<?php 
						wp_nav_menu( array(
							'theme_location' => 'card-services-footer-account-nav', 
							'container' => '',
							'menu_id' => 'card-services-footer-account-nav'
						) ); 
					?>
				</li>

				<li>
					<div class="footer-menu-title">The Card</div>
					<?php 
						wp_nav_menu( array(
							'theme_location' => 'card-services-footer-card-nav', 
							'container' => '',
							'menu_id' => 'card-services-footer-card-nav'
						) ); 
					?>
				</li>

				<li>
					<div class="footer-menu-title">Help</div>
					<?php 
						wp_nav_menu( array(
							'theme_location' => 'card-services-footer-help-nav', 
							'container' => '',
							'menu_id' => 'card-services-footer-help-nav'
						) ); 
					?>
				</li>

				<li class="social-links">

					<div class="footer-social-icon-container">
						<a target="_blank" href="<?php echo get_field( 'twitter_link', 735 ); ?>" class="footer-social-icon tw"></a>
						<a target="_blank" href="<?php echo get_field( 'facebook_link', 735 ); ?>" class="footer-social-icon fb"></a>
						<div class="clear"></div>
					</div>

				</li>

			</ul>

			<div class="clear"></div>

		</div>

		<div class="clear"></div>

	</div>

</footer>

<?php wp_footer(); ?>

</body>

</html>