jQuery(document).ready( function($) {

	function initializeGoogleMap() {

		//Latitude/Longitude
		//var ll1 = new google.maps.LatLng( 28.589279, -81.195896 );

		//var ll1 = new google.maps.LatLng( 28.588986, -81.196117 );

		var ll1 = new google.maps.LatLng( 28.590252, -81.196524 );

		//Set up Map Style
        var mapstyle = [{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}];
        var SPRY_MAP_STYLE = 'spry_style';

		//Map Settings
        var mapOptions = {
            center: ll1,
            zoom: 15,
            scrollwheel: false,
            streetViewControl: false,
			mapTypeControl: false,
			panControl: false,
			mapTypeId: SPRY_MAP_STYLE,
			zoomControlOptions: {
		        style: google.maps.ZoomControlStyle.LARGE,
		        position: google.maps.ControlPosition.LEFT_CENTER
		    },
        };

        //Activate Map
        var map = new google.maps.Map( document.getElementById( 'map' ), mapOptions );

        //Activate map style
		var mapType = new google.maps.StyledMapType(mapstyle, {name:"Spry"});    
		map.mapTypes.set(SPRY_MAP_STYLE, mapType);

		//Markers
		var markerIcon = new google.maps.MarkerImage(
			SPRY.themeUrl + '/library/images/map-pin_03.png',
			new google.maps.Size( 50, 73 )
		);

		var marker = new google.maps.Marker( {
			position: ll1,
			map: map,
			title: 'UCF Business Services',
			icon: markerIcon
		} );

		// var contentString = '<div class="mapcontent">' +
	 //      	'<div class="map-pop-heading">Address</div>' +
	 //      	'<div id="bodyContent">' +
	 //      		'<p>12479 Research Pkwy Ste 600,</p><p>Orlando, FL 32826</p>' +
	 //      	'</div>' +
	 //      '</div>';

	    // var infowindow = new google.maps.InfoWindow( {
	    // 	content: contentString
	    // } );

	    // marker.addListener( 'click', function() {
	    // 	infowindow.open( map, marker );
	    // } );

	}

	if ( $( '#map' ).length ) {
		google.maps.event.addDomListener( window, 'load', initializeGoogleMap );
	}

} );
