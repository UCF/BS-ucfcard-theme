<div id="card-services-menu">

	<div id="desktop-menu">

		<div class="logo-container">
			<a href="<?php echo get_bloginfo( 'url' ); ?>" class="card-services-logo"></a>
		</div>

		<div class="right-container">
			
			<div class="outer">

				<div class="inner">
					<?php 
						wp_nav_menu( array(
							'theme_location' => 'card-services-nav', 
							'container' => '',
							'menu_id' => 'card-services-nav'
						) ); 
					?>
				</div>

			</div>

		</div>

		<div class="clear"></div>
	</div>

	<div id="mobile-menu">

		<div class="menu-background"></div>

		<div class="outer">

			<div class="inner">

				<div class="icon-wrap">

					<div class="logo-container">
						<a href="<?php echo get_bloginfo( 'url' ); ?>" class="card-services-logo"></a>
					</div>

					<div class="hamburger-container">

						<div class="outer">

							<div class="inner">

								<a href="#" class="hamburger"></a>

							</div>

						</div>

					</div>

					<div class="clear"></div>

				</div>

			</div>

		</div>

		<div id="actual-mobile-menu">

			<div class="mobile-menu-inner-container">

				<div class="logo-container">
					<a href="<?php echo get_bloginfo( 'url' ); ?>" class="card-services-logo big"></a>
				</div>

				<div class="divider"></div>

				<?php 
					wp_nav_menu( array(
						'theme_location' => 'card-services-mobile-nav', 
						'container' => '',
						'menu_id' => 'card-services-mobile-nav'
					) ); 
				?>

				<div class="divider second"></div>

				<a href="https://knightcash.ucf.edu/" target="_blank" class="log-in-link"><span class="log-in">Log In</span></a>
				<!-- <a href="<?php echo get_permalink( 735 ); ?>" class="lost-card-link">Lost Your Card?</a> -->

			</div>

		</div>

	</div>

</div>