jQuery(document).ready(function($){




	var options = {
		"urls": {
			"static"        : "/static/",
			"search"        : "/search/",
			"base_url"      : "//map.ucf.edu"
		},
		"infobox_location_id" : null,
		"points"              : {
		    "147": {
		        "ipoint": [85.045109109793657, -179.97818112547975],
		        "type": "ParkingLot",
		        "name": "Parking Garage A"
		    },
		    "89": {
		        "ipoint": [85.044137870258865, -179.9505436437903],
		        "type": "ParkingLot",
		        "name": "Parking Garage B"
		    },
		    "83": {
		        "ipoint": [85.046476678585165, -179.93044137780089],
		        "type": "ParkingLot",
		        "name": "Parking Garage C"
		    },
		    "97": {
		        "ipoint": [85.047425231374845, -179.93641376146115],
		        "type": "ParkingLot",
		        "name": "Parking Garage D"
		    },
		    "134": {
		        "ipoint": [85.048158753409837, -179.92477655236144],
		        "type": "ParkingLot",
		        "name": "Parking Garage E"
		    },
		    "141": {
		        "ipoint": [85.04901068840384, -179.93121385399718],
		        "type": "ParkingLot",
		        "name": "Parking Garage F"
		    },
		     "131": {
		        "ipoint": [85.049069948007428, -179.9368786807463],
		        "type": "ParkingLot",
		        "name": "Parking Garage G"
		    },
		    "151": {
		        "ipoint": [85.047484509907903, -179.95478152879514],
		        "type": "ParkingLot",
		        "name": "Parking Garage H"
		    },
		    "Me": {
		        "ipoint": [85.045750320369706, -179.97430085961241],
		        "type": "ParkingLot",
		        "name": "Parking Garage I"
		    },
		    "153": {
		        "ipoint": [85.044097088872832, -179.9657921801554],
		        "type": "Building",
		        "name": "Visitor and Parking Information Center"
		    },
		     "u1": {
		        "ipoint": [85.044393673135744, -179.94965601072181],
		        "type": "Building",
		        "name": "Parking & Transportation Services"
		    },
		    "spry1": {
		        "ipoint": [85.04637291962993, -179.96427655394655],
		        "type": "Building",
		        "name": "Metered Parking Near Garage A"
		    },
		    "spry2": {
		        "ipoint": [85.04671012830799, -179.93779778655153],
		        "type": "Building",
		        "name": "Metered Parking Near Garage C"
		    },
		    "spry3": {
		        "ipoint": [85.04513876297523, -179.96496319945436],
		        "type": "Building",
		        "name": "Metered Parking Near Milican (West Side)"
		    }, 
		    "spry4": {
		        "ipoint": [85.04496084123045, -179.95831132109743],
		        "type": "Building",
		        "name": "Metered Parking Near Milican (East Side)"
		    } // end object item
		}, // end points object
	}, // end options
	default_options = {
		'simple'              : true,
		'canvas_id'           : 'map-canvas',
		'pan_control'         : true,
		'zoom_control'        : true,
		'street_view_control' : true,
		'map_type_control'    : true,
		'infobox_location_id' : null,
		'illustrated'         : true
	},

	options = $.extend({}, default_options, options);

	var POINTS            = options.points,

	    // Shuttle Route information
	    SHUTTLE_ROUTES    = options.shuttle_routes,
	    SHUTTLE_STOPS     = options.shuttle_stops,

		// Ignore these point types on the base points layer
		BASE_IGNORE_TYPES = options.base_ignore_types,

		// URLs provided by the template
		STATIC_URL        = options.urls['static'],
		SEARCH_URL        = options.urls['search'],
		LOCATION_URL      = options.urls['location'],
		PARKING_JSON_URL  = options.urls['parking_json'],
		DINING_URL        = options.urls['dining'],
		PARKING_KML_URL   = options.urls['parking_kml'],
		BUILDINGS_KML_URL = options.urls['buildings_kml'],
		SIDEWALKS_KML_URL = options.urls['sidewalks_kml'],
		BIKERACKS_URL     = options.urls['bikeracks'],
		PHONES_URL        = options.urls['phones'],
		BASE_URL          = options.urls['base_url'],

		SIMPLE = options.simple,
		// Simple really means the map on the profile pages.
		// This variable should really be renamed.

		CURRENT_LOCATION = null,

		ACTIVATED_LAYERS = [],

		GMAP_OPTIONS = null,
		IMAP_OPTIONS = null,
		IMAP_TYPE    = null,

		MAP           = null,
		SEARCH        = null,
		MENU          = null,
		LAYER_MANAGER = null,
		INFO_MANAGER  = null,
		UTIL          = new Util();

	// Illustrated Map
	IMAP_OPTIONS = {
		zoom              : 15,
		center            : new google.maps.LatLng(85.04591,-179.94189), // world's corner
		mapTypeId         : 'illustrated',
		panControl        : options.pan_control,
		zoomControl       : options.zoom_control,
		streetViewControl : options.street_view_control,
		mapTypeControl    : options.map_type_control,
		scrollwheel	   : false
	}
	IMAP_TYPE = {
		tileSize : new google.maps.Size(256,256),
		minZoom: 15,
		maxZoom :16, //can go up to 18
		getTile : function(coordinate, zoom, ownerDocument) {
			var div                   = ownerDocument.createElement('div');
			div.style.width           = this.tileSize.width + 'px';
			div.style.height          = this.tileSize.height + 'px';
			div.style.backgroundImage = UTIL.get_illustrated_tile(coordinate,zoom);
			return div;
		},
		name : "Illustrated",
		alt  : "Show illustrated map"
	}

	// Setup and configure the map
	google.maps.visualRefresh = true;

	MAP = new google.maps.Map(document.getElementById(options.canvas_id), IMAP_OPTIONS);

	MAP.mapTypes.set('illustrated', IMAP_TYPE); // Register the illustrated map type


	var IB_defaults = {
		map: MAP,
		shadowstyle: 2,
		padding: 0,
		backgroundColor: 'rgb(255,255,255)',
		borderRadius: 0,
		maxWidth: 224,
		borderWidth: 0,
		hideCloseButton: true,
		animation: null,
		disableAutoPan: true
	};

	var InfoWindow = new InfoBubble(IB_defaults),
		JTWC_bubble = new InfoBubble(IB_defaults),
		METER_bubble = new InfoBubble(IB_defaults);


	// var  sw_bound_lat = 85.04328139085142,
	// 	sw_bound_lng = -179.99096989806276,
	// 	ne_bound_lat = 85.04986247719238,
	// 	ne_bound_lng = -179.90698456938844;

	// var  sw_bound = new google.maps.LatLng(sw_bound_lat, sw_bound_lng),
	// 	ne_bound = new google.maps.LatLng(ne_bound_lat, ne_bound_lng),
	// 	map_bounds = new google.maps.LatLngBounds(sw_bound, ne_bound);

	// 	console.log(map_bounds);

	// 	MAP.fitBounds(map_bounds);


	function make_marker(lat, lng, which_map, type, coords, has_iw, garage_num){

		var image_link = '';

		if(type == 'garage'){
			image_link = '//make.wearespry.com/UCF_0201/wp-content/themes/JTWC/library/images/icon-map-parking-garage.png';
		} else if(type == 'metered'){
			image_link = '//make.wearespry.com/UCF_0201/wp-content/themes/JTWC/library/images/icon-map-metered.png';
		}


		if(coords != null){
			var marker = new google.maps.Marker({
				position: coords,
				map: which_map,
				icon: image_link
			});
		} else {
			var point = new google.maps.LatLng(lat, lng);
			var marker = new google.maps.Marker({
				position: point,
				map: which_map,
				icon: image_link
			});
		}

		if(marker){
			google.maps.event.addListener(marker, 'click', function() {
			   JTWC_bubble.open();
			   InfoWindow.close();
			   METER_bubble.close();
			 });
		}

		if(marker != null && has_iw && garage_num != null){

			var the_html = $('#garage-'+garage_num+'-container').html();

			populate_info_window(MAP, marker, InfoWindow, the_html, 'large');

		} else if(type == 'metered'){

			var the_html = '<div class="home-pin metered">';
					the_html += '<div class="inner">';
						the_html += '<div class="body">';
							the_html += '<h2>Metered Parking</h2>';
						the_html += '</div>'; // end .body
					the_html += '</div>'; // end .inner
				the_html += '</div>'; // end .home-pin

			populate_info_window(MAP, marker, METER_bubble, the_html, 'med');

		} else {


		}


	}


	function make_JTWC_marker(){

		var  JTWC_coords = new google.maps.LatLng(85.04593933196735, -179.95878338988405),
			JTWC_pin_content = $('#home-pin-container').html(),
			image_link = '//make.wearespry.com/UCF_0201/wp-content/themes/JTWC/library/images/icon-map-jtwc.png';

			$('#home-pin-container').remove();

		var JTWC_marker = new google.maps.Marker({
				position: JTWC_coords,
				map: MAP,
				icon: image_link
			});

		var JTWC_data = {
			content: JTWC_pin_content,
			position: JTWC_coords,
			maxHeight: 222
		}

		var JTWC_bubble_opts = $.extend(IB_defaults, JTWC_data);
			
			JTWC_bubble.setOptions(JTWC_bubble_opts);

		google.maps.event.addListener(JTWC_marker, 'click', function() {
		   JTWC_bubble.open();
		   InfoWindow.close();
		   METER_bubble.close();
		 });

		$(JTWC_bubble.bubble_).live("click", function() {
		    JTWC_bubble.close();
		    InfoWindow.close();
		    METER_bubble.close();
		});
	}

	make_JTWC_marker();


	// =- =- =- =- =- =- =- =- =- =- =- =- =- =- =- =- =- =-
	//
	//	Create Info Box
	//
	// =- =- =- =- =- =- =- =- =- =- =- =- =- =- =- =- =- =-
	var populate_info_window = function(map, marker, iw, the_html, height) {

		var iw_content = '<div class="info-box-wrapper">' + the_html + '</div>';

		if(height == 'med'){

			iw.setOptions({
				maxHeight: 50
			});
		} else if(height == 'large'){

			iw.setOptions({
				maxHeight: 122
			});

		}

		google.maps.event.addListener(marker, 'click', function() {
		   iw.close();
		   JTWC_bubble.close();
		   METER_bubble.close();
		   iw.setContent(iw_content)
		   iw.open(map, marker);
		 });

		$(InfoWindow.bubble_).live("click", function() {
		    JTWC_bubble.close();
		    InfoWindow.close();
		    METER_bubble.close();
		});

		$(METER_bubble.bubble_).live("click", function() {
		    JTWC_bubble.close();
		    InfoWindow.close();
		    METER_bubble.close();
		});

	}



	// var the_points = options.points;
	var the_points = options.points;


	var parking_garages = [],
		metered_parking = [];

	$('.a-marker.garage').each(function(index, post){

		var current_data = $('#garage-'+index+'-container').data();

		var location_title = current_data.title,
			point_name = location_title,
			ilat = current_data.ilat,
			ilng = current_data.ilng;

		var point = {
			location: {
			    "ipoint": [ilat, ilng],
			    "type": "Garage",
			    "name": location_title,
			    "gpoint": null,
			    "index": index
			} 
		}

		parking_garages.push(point);

		/* Load all points */
		// if(point_name != null && point.ipoint != null){
		// 	parking_garages.push(point);
		// }

	});

	if(parking_garages.length){
		
		$.each(parking_garages, function(i, el){

			var garage_num = el.location.index;

			if(el.location.ipoint){
				var coords = new google.maps.LatLng(el.location.ipoint[0], el.location.ipoint[1]);

				make_marker(null, null, MAP, 'garage', coords, 1, garage_num);

			}

		});

	}

	$.each(the_points, function(i, el){
		if(el.name.indexOf('Metered') > -1){
			metered_parking.push(el);
		}
	});

	if(metered_parking.length){
		
		$.each(metered_parking, function(i, el){

			if(el.ipoint){
				var coords = el.ipoint,
					lat = coords[0],
					lng = coords[1];

				make_marker(lat, lng, MAP, 'metered');
			}

		});

	}


	 MAP.addListener(MAP, "moveend", function() {
		    map.clearOverlays();
        var center = map.getCenter();
    		var marker = new GMarker(center, {draggable: true});
    		map.addOverlay(marker);


    	 MAP.addListener(marker, "dragend", function() {
            var point = marker.getPoint();
      	    map.panTo(point);

        });
     
    });


	/* =- =- -= =-=- =- =- =- =- =- =-

		Testing


	=- =- =- =- =- =- =- =- =- =- */
	

	var MAP_center = new google.maps.LatLng(85.04659896314209, -179.95620846922975);
	MAP.setCenter(MAP_center);

	// make_marker(test_lat, test_lng, MAP, 2);

	

	

	function create_drag_marker(){

		var test_lat = 85.04659896314209; 
		var test_lng = -179.95620846922975;
		var test_coords = new google.maps.LatLng(test_lat, test_lng);

		var drag_marker = new google.maps.Marker({
		    position: test_coords,
		    map: MAP,
		    title: 'Set lat/lon values for this property',
		    draggable: true
		});
		google.maps.event.addListener(drag_marker, 'dragend', function(a) {
		    console.log(a);
		});
	}

	//create_drag_marker();



	



	/*********************************
	 *
	 * Utility
	 *
	 *********************************/
	function Util() {
		var that = this;

		// Returns the URL of a illustrated map tiles based on the specified
		// coordinate and zoom. If coordinate and/or zoom are outside the illustrated
		// map's viewable area, return a white tile.
		this.get_illustrated_tile = function(coordinate, zoom) {
			var filename = null,
				no_tile  = 'white.png',
				// Smallest map dimensions
				dimensions     = {x:2.5, y:3.5},
				scaling_factor = Math.pow(2, (zoom - 13));

			if( // Outside bounds
				(zoom < 12 || coordinate.y < 0 || coordinate.x < 0)
				||
				// Too small
				(zoom === 12 && (coordinate.y > 1 || coordinate.x > 2))
				||
				// Too big
				(coordinate.x >= (dimensions.x * scaling_factor) || coordinate.y >= (dimensions.y*scaling_factor))
				) {
				filename = no_tile;
			} else {
				filename = 'zoom-' + zoom + '/' + zoom + '-' + coordinate.x + '-' + coordinate.y + '.jpg';
			}
			return 'url("//cdn.ucf.edu/map/tiles/' + filename + '?_=' + new Date().getTime() + '")';
		}

		
	}



});