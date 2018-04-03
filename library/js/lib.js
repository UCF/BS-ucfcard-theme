jQuery(document).ready(function($) {

	$('a[href^="http://"]').not('a[href*=gusdecool]').attr('target','_blank');
	
	/* - = - = - = - = - = - = - =- = = - =- = = - =- =

		Responsive Stuff

	- = - = - = - = - = - = - = - = - = = - =- = = - =- = */

	// Get window width, declare fresh menu height variable
	var sw = document.body.clientWidth;
	var window_width = $(window).width();
	var menu_height = 0;
	var isTouch = 'ontouchstart' in document.documentElement;

	$(window).on('resize', function(){

		//Window Width
		window_width = $(window).width();
		sw = document.body.clientWidth;

		$('#main-nav').removeClass('slide-down');
		$('.menu-button').removeClass('active');

	});

	/* - = - = - = - = - = - = - =- = = - =- = = - =- =

		SMOOTH SCROLL to Anchor Links

	- = - = - = - = - = - = - = - = - = = - =- = = - =- = */

	$(".smooth-scroll").click(function(event){

        event.preventDefault();

        var dest = 0;

        //calculate destination place
        if($(this.hash).offset().top > $(document).height()-$(window).height()){

		dest = $(document).height() - $(window).height();

        }else{

		dest = $(this.hash).offset().top;

        }

        dest -= menu_height;

        //go to destination
        $('html,body').animate({scrollTop:dest}, 2000,'easeInOutExpo');

    });

	/* - = - = - = - = - = - = - =- = = - =- = = - =- =

		Mobile Menu

	- = - = - = - = - = - = - = - = - = = - =- = = - =- = */
	$('.menu-button').on('click', function(evt) {
		//Prevent Default Action
		evt.preventDefault();

		//Menu Button Selector
		var menu_button = $(this);
		nav = $('#main-nav')

		//Check If Menu Is Opened
		if (!menu_button.hasClass('active')){

			$('#header').css('overflow', 'visible');
			menu_button.addClass('active');
			nav.addClass('slide-down');

		}else{

			menu_button.removeClass('active');
			nav.removeClass('slide-down');

			setTimeout(function() {
				$('#header').css('overflow', 'hidden');
			}, 300);

		}

	});

	$('.direction-row').on('click', function(e){

		e.preventDefault();
		if($(this).hasClass('active')){
			$(this).removeClass('active');
		} else {
			$('.direction-row').removeClass('active');
			$(this).addClass('active');
		}
	});



	$("#contact-forms :input").focus(function() {
	  $("label[for='" + this.id + "']").addClass("labelfocus");
	}).blur(function() {
	  $("label").removeClass("labelfocus");
	});

	$('.a-form .title-bar').on('click', function(e){

		e.preventDefault();

		var 	form_id = $(this).data('form')
			target_form = $('.a-form[data-form="'+form_id+'"]'),
			contact_forms = $('.a-form');

		if(target_form.hasClass('active')){
			target_form.removeClass('overflow');
			setTimeout(function() {
				target_form.removeClass('active');
			}, 300);
		} else {
			contact_forms.removeClass('active');
			contact_forms.removeClass('overflow');
			target_form.addClass('active');
			setTimeout(function() {
				target_form.addClass('overflow');
			}, 300);
		}
	});




	/* - = - = - = - = - = - = - =- = = - =- = = - =- =

		Post Triggers

	- = - = - = - = - = - = - = - = - = = - =- = = - =- = */
	// jQuery.fancybox({
	// 	type: 'ajax',
	// 	openEffect  : 'none',
	// 	'padding'  : 0,
	// 	'width': '100%',
	// 	'height': '100%',
	// 	fitToView: true,
	// 	closeEffect : 'none',
	// 	helpers : {
	// 		media : {},
	// 		overlay: {
	// 		  locked: false
	// 		}
	// 	}
	// });

	// $(document).on('click', function(e){
	// 	e.preventDefault();
	// 	console.log(e.target);
	// });

	
});