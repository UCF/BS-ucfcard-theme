var CampusMap = function(options) {
	var that = this,
		default_options = {
			'simple'              : false,
			'canvas_id'           : 'map-canvas',
			'pan_control'         : true,
			'zoom_control'        : true,
			'street_view_control' : true,
			'map_type_control'    : true,
			'infobox_location_id' : null,
			'illustrated'         : false
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

	// Load the Google Maps JS
	if(typeof google === 'undefined') {
		log('Unable to load google code');
		return;
	}

	// Find out which layers are activated by default based on the URL
	(function() {
		var url   = window.location + "",
			parts = url.split('/');
		if(parts.length > 3) {
			parts = parts.splice(3);
			$.each(parts, function(index, part) {
				if(part != 'map' && part != '') {
					if(part == 'illustrated') {
						options.illustrated = true;
					} else {
						ACTIVATED_LAYERS.push(part);
					}
				}
			});
		}
	})();


	//
	// Define the map layer options and types
	//

	// Regular Google Map

	GMAP_OPTIONS = {
		zoom: 16,
		center: new google.maps.LatLng(28.6018,-81.1995),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: options.pan_control,
		panControlOptions: {
			position: google.maps.ControlPosition.LEFT_TOP
		},
		zoomControl: options.zoom_control,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.LEFT_TOP
		},
		streetViewControl: options.street_view_control,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.LEFT_TOP
		},
		mapTypeControl: options.map_type_control,
		mapTypeControlOptions: {
			mapTypeIds: [
				google.maps.MapTypeId.ROADMAP,
				google.maps.MapTypeId.SATELLITE,
				google.maps.MapTypeId.HYBRID,
				google.maps.MapTypeId.TERRAIN,
				'illustrated'
			]
		}
	}

	// Illustrated Map
	IMAP_OPTIONS = {
		zoom              : 14,
		center            : new google.maps.LatLng(85.04591,-179.94189), // world's corner
		mapTypeId         : 'illustrated',
		panControl        : options.pan_control,
		zoomControl       : options.zoom_control,
		streetViewControl : options.street_view_control,
		mapTypeControl    : options.map_type_control
	}
	IMAP_TYPE = {
		tileSize : new google.maps.Size(256,256),
		minZoom: 12,
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
	MAP = new google.maps.Map(document.getElementById(options.canvas_id), options.illustrated ? IMAP_OPTIONS : GMAP_OPTIONS);
	MAP.mapTypes.set('illustrated', IMAP_TYPE); // Register the illustrated map type
	google.maps.event.addListener(MAP, 'maptypeid_changed', function() {
		var type    = MAP.mapTypeId,
			options = (type === 'illustrated') ? IMAP_OPTIONS : GMAP_OPTIONS,
			gpoints = LAYER_MANAGER.get_layer('gpoints'),
			ipoints = LAYER_MANAGER.get_layer('ipoints');
		MAP.setZoom(options.zoom);
		MAP.setCenter(options.center);
		if(type == 'illustrated') {
			gpoints.deactivate();
			ipoints.activate();
		} else {
			ipoints.deactivate();
			gpoints.activate();
		}
		INFO_MANAGER.clear();
		if(CURRENT_LOCATION != null) {
			UTIL.highlight_location(CURRENT_LOCATION);
		}
	})

	if(!options.simple) {
		UTIL.resize_canvas();
		$(window).resize(UTIL.resize_canvas);

		// Setup and configure the search
		SEARCH = new Search();

		// Setup and configure the menu
		MENU = new Menu();
	}

	// Setup and configure the info boxes
	INFO_MANAGER = new InfoManager();

	if(!options.simple) {
		// Setup and configure the layers
		LAYER_MANAGER = new LayerManager();

		// Implementation details for the traffic layer
		LAYER_MANAGER.register_layer(
			(function() {
				var traffic_layer   = new Layer('traffic');
				traffic_layer.layer = new google.maps.TrafficLayer();
				return traffic_layer;
			})()
		);

		// Implementation details for the sidewalks layer
		LAYER_MANAGER.register_layer(
			(function() {
				var sidewalk_layer = new Layer('sidewalks');
				sidewalk_layer.layer = new google.maps.KmlLayer(
						SIDEWALKS_KML_URL,
						{
							preserveViewport : true,
							suppressInfoWindows: true,
							clickable: false
						}
					);
				return sidewalk_layer;
			})()
		);

		// Implementation details for the points layer for the google maps layer
		LAYER_MANAGER.register_layer(
			(function() {
				var points_layer     = new Layer('gpoints');
				points_layer.markers = (function() {
					var markers        = [],
						images         = {
							'Building'   : UTIL.get_google_image('yellow'),
							'ParkingLot' : UTIL.get_google_image('yellow'),
							'Group'      : UTIL.get_google_image('yellow2'),
							'Location'   : UTIL.get_google_image('blue')
						},
						map_point_type = 'gpoint';

					$.each(POINTS, function(index, point) {
						var map_point = point[map_point_type],
							marker    = null;
						if(map_point != null && $.inArray(point.type, BASE_IGNORE_TYPES) == -1) {
							marker = new google.maps.Marker({
								position : new google.maps.LatLng(map_point[0], map_point[1]),
								map      : MAP,
								icon     : images[point.type],
								location : index,
								visible  : false
							})
							markers.push(marker);
							google.maps.event.addListener(marker, 'click', function(event) {
								UTIL.highlight_location(index);
							});
						}
					});
					return markers;
				})();
	 			return points_layer;
			})()
		);

		// Implementation details for the points layer
		LAYER_MANAGER.register_layer(
			(function() {
				var points_layer     = new Layer('ipoints');
				points_layer.markers = (function() {
					var markers        = [],
						images         = {
							'Building'   : UTIL.get_google_image('yellow'),
							'ParkingLot' : UTIL.get_google_image('yellow'),
							'Group'      : UTIL.get_google_image('yellow2'),
							'Location'   : UTIL.get_google_image('blue')
						},
						map_point_type = 'ipoint';

					$.each(POINTS, function(index, point) {
						var map_point = point[map_point_type],
							marker    = null;
						if(map_point != null && $.inArray(point.type, BASE_IGNORE_TYPES) == -1) {
							marker = new google.maps.Marker({
								position : new google.maps.LatLng(map_point[0], map_point[1]),
								map      : MAP,
								icon     : images[point.type],
								location : index,
								visible  : false
							})
							markers.push(marker);
							google.maps.event.addListener(marker, 'click', function(event) {
								UTIL.highlight_location(index);
							});
						}
					});
					return markers;
				})();
	 			return points_layer;
			})()
		);


		// Implementation details for the buildings layer
		LAYER_MANAGER.register_layer(
			(function() {
				var buildings_layer   = new Layer('buildings');
				buildings_layer.layer = new google.maps.KmlLayer(
					BUILDINGS_KML_URL,
					{
						preserveViewport    :true,
						suppressInfoWindows :true,
						clickable           :false
					}
				);
				return buildings_layer;
			})()
		);

		// Implementation details for the bikeracks layer
		LAYER_MANAGER.register_layer(
			(function() {
				var bikeracks_layer  = new Layer('bikeracks');
				bikeracks_layer.markers = (function() {
					var markers = [];
					$.ajax({
						url     :BIKERACKS_URL,
						dataType:'json',
						async   :false,
						success :
							function(data, text_status, jq_xhr) {
								if(typeof data.features != 'undefined') {
									$.each(data.features, function(index, rack) {
										if(rack.geometry && rack.geometry.coordinates) {
											markers.push(
												new google.maps.Marker({
													clickable : false,
													position  : new google.maps.LatLng(
														rack.geometry.coordinates[0],
														rack.geometry.coordinates[1]
													),
													map       : MAP,
													visible   : false
												})
											);
										}
									});
								}
							}
					});
					return markers;
				})();
				return bikeracks_layer;
			})()
		);

		// Implementation details for the emergency phones layer
		LAYER_MANAGER.register_layer(
			(function() {
				var phones_layer = new Layer('emergency-phones');
				phones_layer.markers = (function() {
					var markers = [];
					$.ajax({
						url     :PHONES_URL,
						dataType:'json',
						async   :false,
						success :
							function(data, text_status, jq_xhr) {
								var icon   = new google.maps.MarkerImage(
										STATIC_URL + '/images/markers/marker_phone.png',
										new google.maps.Size(20, 34)
									),
									shadow = new google.maps.MarkerImage(
										STATIC_URL + '/images/markers/marker_phone.png',
										new google.maps.Size(37,34),
										new google.maps.Point(20, 0),
										new google.maps.Point(10, 34)
									);

								if(typeof data.features != 'undefined') {
									$.each(data.features, function(index, rack) {
										if(rack.geometry && rack.geometry.coordinates) {
											markers.push(
												new google.maps.Marker({
													clickable : false,
													position  : new google.maps.LatLng(
														rack.geometry.coordinates[0],
														rack.geometry.coordinates[1]
													),
													map       : MAP,
													visible   : false,
													icon      : icon,
													shadow    : shadow
												})
											);
										}
									});
								}
							}
					});
					return markers;
				})();
				return phones_layer;
			})()
		);

		// Implementation detail for the parking layer
		LAYER_MANAGER.register_layer(
			(function() {
				var parking_layer = new Layer('parking');
				parking_layer.layer = new google.maps.KmlLayer(
						PARKING_KML_URL,
						{
							preserveViewport    : true,
							suppressInfoWindows : true
						}
				);
				parking_layer.markers = (function() {
					var markers = [];
					$.ajax({
						url      : PARKING_JSON_URL,
						dataType : 'json',
						async    : false,
						success: function(data){
							var icon   = new google.maps.MarkerImage(
									STATIC_URL + 'images/markers/disabled.png',
									new google.maps.Size(17, 17), //size
									new google.maps.Point(0, 0),  //origin
									new google.maps.Point(10, 8)   //anchor
								);
							if(typeof data.handicap != 'undefined') {
								$.each(data.handicap, function(index, spot) {
									markers.push(
										new google.maps.Marker({
											icon     : icon,
											position : new google.maps.LatLng(
												spot.googlemap_point[0],
												spot.googlemap_point[1]
											),
											map      : MAP,
											title    : spot.title,
											visible  : false
										})
									);
								});
							}
						}
					});
					return markers;
				})();
				return parking_layer;
			})()
		);

		// Implementation details for the dining layer
		LAYER_MANAGER.register_layer(
			(function() {
				var dining_layer     = new Layer('food');
				dining_layer.markers = (function() {
					var markers         = [],
						ExistingPoint   = function(lat, lon) {
							this.lat      = lat;
							this.lon      = lon;
							this.count    = 1;
							this.odd_flip = true;
						},
						randomInt       = function() {
							return Math.round(Math.random() * 10) + Math.round(Math.random() * 10);
						},
						existing_points = [],
						adjustment      = 150000,
						icon = new google.maps.MarkerImage(
							STATIC_URL + 'images/markers/knife-fork.png',
							new google.maps.Size(28, 28),  // dimensions
							new google.maps.Point(0,0),  // origin
							new google.maps.Point(16,20)), // anchor
						shadow = new google.maps.MarkerImage(
							STATIC_URL + 'images/markers/knife-fork-shadow.png',
							new google.maps.Size(46, 22),
							new google.maps.Point(0,0),
							new google.maps.Point(10,13));;

					$.ajax({
						url      : DINING_URL,
						dataType : 'json',
						async    : false,
						success: function(data){


							if(typeof data.features != 'undefined') {
								$.each(data.features, function(index, feature) {
									var point = feature.geometry.coordinates;

									// Nudge points if they are on top of each other
									var adjusted = false;
									$.each(existing_points, function(_index, existing_point) {
										if(point[0] == existing_point.lat && point[1] == existing_point.lon) {
											var count = existing_point.count;
											if( (count % 2) == 0) {
												point[0] = point[0] + ((count + randomInt()) / adjustment);
												if( (count % 4) == 0) {
													point[1] = point[1] + ((count + randomInt()) / adjustment);
												} else {
													point[1] = point[1] - ((count + randomInt()) / adjustment);
												}
											} else {
												point[0] = point[0] - ((count + randomInt()) / adjustment);
												if(existing_point.odd_flip) {
													point[1] = point[1] + ((count + randomInt()) / adjustment);
													existing_point.odd_flip = false;
												} else {
													point[1] = point[1] - ((count + randomInt()) / adjustment);
													existing_point.odd_flip = true;
												}
											}
											adjusted = true;
											existing_point.count += 1;
											return false;
										}
									});
									if(!adjusted) {
										existing_points.push(new ExistingPoint(point[0],point[1]))
									}
									markers.push(
										new google.maps.Marker({
											icon     : icon,
											shadow   : shadow,
											position : new google.maps.LatLng(point[0], point[1]),
											title    : feature.properties.name,
											map      : MAP,
											visible  : false
										})
									);
								});
							}
						}
					});
					return markers;
				})();
				return dining_layer;
			})()
		);

        (function() {
            $.each(SHUTTLE_STOPS, function(index, stop) {
                $('#shuttle-stop-wrapper select').append($("<option></option>").attr('value', stop.id).text(stop.name));
            });

            var stopMarker = null;
            var stopInfoBox = null;
            $('#shuttle-stop-wrapper select').change(function() {
                var value = $(this).val();
                if (value != '') {
                    for (var key in SHUTTLE_STOPS) {
                        stop = SHUTTLE_STOPS[key];
                        if (stop.id == value) {
                            if (stopMarker != null) {
                                stopMarker.setPosition(new google.maps.LatLng(stop.lat, stop.lon));
                                stopMarker.setVisible(true);
                                var route_names = '';
                                for(var index in stop.routes) {
                                    route_names += '<br><a class="route-link" href="#shuttle-' + stop.routes[index].shortname.replace(/ /g, '-') + '">' + stop.routes[index].shortname + '</a>';
                                }
                                stopInfoBox.setContent('<div><b>Stop:</b> ' + stop.name + '<br><b>Routes:</b>' + route_names +'</div>');
                            } else {
                                stopMarker = new google.maps.Marker({
                                    position : new google.maps.LatLng(
                                        stop.lat,
                                        stop.lon
                                    ),
                                    map      : MAP,
                                    title    : stop.name
                                });

                                var route_names = '';
                                for(var index in stop.routes) {
                                    route_names += '<br><a class="route-link" href="#shuttle-' + stop.routes[index].shortname.replace(/ /g, '-') + '">' + stop.routes[index].shortname + '</a>';
                                }
                                stopInfoBox = new google.maps.InfoWindow({
                                    content: '<div><b>Stop:</b> ' + stop.name + '<br><b>Routes:</b>' + route_names + '</div>'
                                });

                                google.maps.event.addListener(stopMarker, 'click', function() {
                                    stopInfoBox.open(MAP, stopMarker);
                                });
                            }
                            stopInfoBox.open(MAP, stopMarker);
                            MAP.panTo(new google.maps.LatLng(stop.lat, stop.lon));
                            break;
                        }
                    }
                } else {
                    if (stopMarker != null) {
                        stopMarker.setVisible(false);
                        stopInfoBox.close();
                    }
                }
            });

            // actively set click event to Info Windows set above
            $('.route-link').live('click', function(e) {
                e.preventDefault();
                var link = $(this);
                $(link.attr('href')).click();
            });

            $.each(SHUTTLE_ROUTES.routes, function(index, route) {
                // Append a new route label to menu
                var domId = 'shuttle-' + route.shortname.replace(/ /g, '-');
                var categoryDomId = route.category.replace(/ /g, '-').toLowerCase() + '-routes';
                var cateogryDom = $('#' + categoryDomId);
                var label = '<label><input type="checkbox" id="' + domId + '"> ' + route.shortname + '</label>';
                cateogryDom.append(label);

                // Implementation detail for the shuttle route layer
                LAYER_MANAGER.register_layer(
                    (function() {
                        var shuttle_layer = new Layer(domId);
                        shuttle_layer.layer = new google.maps.KmlLayer(
                                BASE_URL + '/shuttles/' + route.id + '/poly/.kml?&_=' + (new Date()).getTime(),
                                {
                                    preserveViewport    : true,
                                    suppressInfoWindows : true
                                }
                        )
                        shuttle_layer.markers = (function(routeId) {
                            var markers = [];
                            $.ajax({
                                url      : '/shuttles/' + routeId + '/stops/.json',
                                dataType : 'json',
                                async    : true,
                                success: function(data){
                                    if(typeof data.stops != 'undefined') {
                                        $.each(data.stops, function(index, spot) {
                                            var stopMarker = new google.maps.Marker({
                                                position : new google.maps.LatLng(
                                                    spot.lat,
                                                    spot.lon
                                                ),
                                                map      : MAP,
                                                title    : spot.name,
                                                visible  : false
                                            });
                                            var infoWindow = new google.maps.InfoWindow({
                                                content: '<div>Stop: ' + spot.name + '</div>'
                                            });

                                            google.maps.event.addListener(stopMarker, 'click', function() {
                                                infoWindow.open(MAP, stopMarker);
                                            });

                                            markers.push(stopMarker);
                                        });
                                    }
                                }
                            });
                            return markers;
                        })(route.id);

                        shuttle_layer.shuttleRouteId = route.id;

                        return shuttle_layer;
                    })()
                );
            });

            var shuttleInterval =
                setInterval(function() {
                    $.each(LAYER_MANAGER.layers, function(index, layer) {
                        if (layer.shuttleRouteId != null && layer.active) {
                            updateShuttleGpsData(layer);
                        }
                    });
                }, 4000);
            $('#refresh-shuttle-gps').click(function() {
                if($(this).is(':checked')) {
                    shuttleInterval = setInterval(function() {
                            $.each(LAYER_MANAGER.layers, function(index, layer) {
                                if (layer.shuttleRouteId != null && layer.active) {
                                    updateShuttleGpsData(layer);
                                }
                            });
                        }, 4000);
                } else {
                    clearInterval(shuttleInterval);
                }
            });
        })();

		(function() {
			var activated_layer = false;
			// Activated layers
			$.each(ACTIVATED_LAYERS, function(index, layer_name) {
				var layer = LAYER_MANAGER.get_layer(layer_name);
				if (layer_name == 'shuttles') {
					MENU.change_tabs({
						'label':'Shuttles',
						'html' :$('#shuttle-routes-content').clone(true, true).show()
					});
				} else if(layer != null) {
					layer.activate();
					activated_layer = true;
					if(layer.name == 'parking') {
						MENU.change_tabs({
								'label':'Parking',
								'html' :$('#parking-key-content').html()
							});
					}
				}
			});
			if(!activated_layer) {
				// Display the google map points layer when the  map loads
				options.illustrated ? (LAYER_MANAGER.get_layer('ipoints')).toggle() : (LAYER_MANAGER.get_layer('gpoints')).toggle();
			}
		})();


		// Attach click handles to layer checkboxes
		(function() {
			$.each(LAYER_MANAGER.layers, function(index, layer) {
				var name     = layer.name,
					checkbox = $('input[type="checkbox"][id="' + layer.name + '"]');

				if(layer.active) {
					checkbox.attr('checked', 'checked');
				}

				checkbox
					.click(function() {
						// For parking, change menu to legend
						if($(this).attr('id') == 'parking' && $(this).is(':checked')) {
							MENU.change_tabs({
								'label':'Parking',
								'html' :$('#parking-key-content').html()
							});
						}
						layer.toggle();
					});
			});

            // Add click event to Shuttle Routes
            var checkbox = $('input[type="checkbox"][id="shuttle-routes"], .shuttle-routes-btn');
            checkbox.click(function() {
                if($(this).is(':checked')) {
                    MENU.change_tabs({
                        'label':'Shuttles',
                        'html' :$('#shuttle-routes-content').clone(true, true).show()
                    });
                }
            });

            // Add click event to Shuttle Route Information
            var shuttleInfoButton = $('#shuttle-info-button');
            shuttleInfoButton.click(function(event) {
                event.preventDefault();
                MENU.change_tabs({
                    'label' : 'Shuttles',
                    'html'  : $('#shuttle-info').clone(true, true).show()
                });
            });

            // Add back button for route info or any other buttons that go to the routes menu
            var checkbox = $('.shuttle-routes-btn');
            checkbox.click(function() {
                MENU.change_tabs({
                    'label':'Shuttles',
                    'html' :$('#shuttle-routes-content').clone(true, true).show()
                });
            });

		})();


		// Search result selection. Tab and infobox population
		// --
		// For some reason I can't get this events list to bind
		// to the #search-form ul element. Bind it to body and
		// pass #search-form ul as an argument
		$('#search > ul > li:not(.more)')
			.live('click', function() {
				var location_id = SEARCH.current_location_id();
				if(location_id) {

					// Change menu tab to a loading indicator
					MENU.change_tabs({
							label:'Location',
							html :'<div class="item load">Loading...</div>'
						});
					UTIL.highlight_location(
						location_id,
						{
							func: function(data) {
								// Populate the menu tab
								MENU.change_tabs({'html':data.info});
							}
						}

					);
				}
				SEARCH.hide_results();
			})
			.find('a').live('click', function(e) {e.preventDefault()});

		$('body').bind('search-result-highlighted', function(event) {
			var location_id = SEARCH.current_location_id();
			if(location_id) {
				MENU.change_tabs({
							label:'Location',
							html :'<div class="item load">Loading...</div>'
						});
				UTIL.highlight_location(
					location_id,
					{
						func: function(data) {
							// Populate the menu tab
							MENU.change_tabs({'html':data.info});
						}
					}
				);
			}
		});
	}

	if(options.infobox_location_id != null) {
		UTIL.highlight_location(options.infobox_location_id, {pan:true});
	}

    function updateShuttleGpsData(layer) {
        var markers = [];
        $.ajax({
            url      : '/shuttles/' + layer.shuttleRouteId + '/gps/.json',
            dataType : 'json',
            async: true,
            success: function(data) {
                if(typeof data.locations != 'undefined') {

                    // Remove old GPS locations
                    if(layer.gpsMarkers != null) {
                        $.each(layer.gpsMarkers, function (index, oldGpsMarker) {
                            oldGpsMarker.setMap(null);
                        });
                    }

                    // Add new GPS locations
                    $.each(data.locations, function(index, spot) {
                        var icon = new google.maps.MarkerImage(
                            STATIC_URL + '/images/markers/map-shuttle.png',
                            new google.maps.Size(36, 36)
                        );
                        var gpsMarker = new google.maps.Marker({
                            position : new google.maps.LatLng(
                                spot.lat,
                                spot.lon
                            ),
                            map     : MAP,
                            title   : spot.name,
                            visible : layer.active,
                            icon    : icon,
                        });
                        var infoWindow = new google.maps.InfoWindow({
                            content: '<div>Shuttle ' + spot.id + '</div>'
                        });

                        google.maps.event.addListener(gpsMarker, 'click', function() {
                            infoWindow.open(MAP, gpsMarker);
                        });

                        markers.push(gpsMarker);
                    });
                }

                layer.gpsMarkers = markers;
            }
        });
    }

	/*********************************
	 *
	 * InfoBox
	 *
	 *********************************/
	 function InfoManager() {
	 	var that = this;

	 	this.infos = [];

	 	this.register = function(info) {
	 		that.infos.push(info);
	 	}

	 	this.clear = function() {
	 		$.each(that.infos, function(index, info) {
	 			info.close();
	 		});
	 		that.infos = [];
	 	}

	 }

	 function Info(position, name, options) {
	 	var that         = this,
	 		lat_lng      = new google.maps.LatLng(position[0], position[1]),
	 		content      =  null
	 		test_content = null,
	 		default_options  = {
	 			link : null,
	 			pan  : false
	 		};
	 	this.box = null;

	 	options = $.extend({}, default_options, options);

	 	// Wrap the text in a link if neccessary
	 	if(options.link != null) {
	 		name = '<a href="' + options.link + '">' + name + '</a>';
	 	}
	 	content = $('<div class="iBox">' + name + '<a class="iclose"></a></div>');

	 	// Create a hidden test box to figure out the correct width
	 	test_content = $('<div id="testBox" class="iBox">' + content + '</div>')[0];
	 	$('body').append(test_content);

		// Close button listener
	 	content.find('.iclose').click(function(e) {
	 		e.preventDefault();
	 		that.box.close();
	 	});
	 	content             = content[0];
	 	content.style.width = test_content.offsetWidth + 'px';

	 	// Create the box and set it's position
	 	this.box = new InfoBox({
	 		content                : content,
			alignBottom            : true,
			pixelOffset            : new google.maps.Size(-18, -3),
			maxWidth               : 0,
			closeBoxURL            : "",
			pane                   : "floatPane",
			infoBoxClearance       : new google.maps.Size(1, 1),
			enableEventPropagation : false
	 	});
	 	this.box.setPosition(lat_lng);
	 	this.box.open(MAP);

	 	if(options.pan) {
	 		MAP.panTo(lat_lng);
	 	}

	 	this.close = function() {
	 		that.box.close();
	 	}
	 }

	/*********************************
	 *
	 * Layers
	 *
	 *********************************/
	function LayerManager() {
		var that = this;

		this.layers = [];

		this.get_layer = function(name) {
			var layer = null;
			$.each(that.layers, function(index, _layer) {
				if(_layer.name == name) {
					layer = _layer;
					return false;
				}
			});
			return layer;
		}

		this.load_all_layers = function() {
			$.each(that.layers, function(index, layer) {
				layer.toggle();
			});
		}

		this.register_layer = function(layer) {
			that.layers.push(layer);
		}
	}

	function Layer(name) {
		/*
			Layers are sets of objects placed on the map (e.g. points, buidlings,
			sidewalks, etc.)

			Layers are made up of two types of Google Maps items: KML and points.
			Most layers have one or the other; some have both.


			This function represents and interface of what the LayerManager
			expects. Implementations for each layer appear below

		*/

		var that    = this;

		this.active     = false;
		this.name       = name;
		this.layer      = null; // the actual Google Maps layer on the map, if applicable
		this.markers    = null; // the actual Google Maps markers on the map, if applicable
        this.shuttleRouteId = null;
        this.gpsMarkers = null; // Google marker for gps data that can be used to refresh on an interval (unlike markers)

		this.toggle = function() {
			that.active ? that.deactivate() : that.activate();
		}

		this.activate = function() {
			if(that.active != true) {
				that.active = true;
				if(that.layer != null) {
					that.layer.setMap(MAP);
				}
				if(that.markers != null) {
					$.each(that.markers, function(index, marker) {
						marker.setVisible(true);
					});
				}

                // Get the latest GPS data
                if(that.shuttleRouteId != null) {
                    updateShuttleGpsData(that);
                }
			}
		}

		this.deactivate = function() {
			if(that.active != false) {
				that.active = false;
				if(that.layer != null) {
					that.layer.setMap(null);
				}
				if(that.markers != null) {
					$.each(that.markers, function(index, marker) {
						marker.setVisible(false);
					});
				}
                if(that.gpsMarkers != null) {
                    $.each(that.gpsMarkers, function(index, marker) {
                        marker.setVisible(false);
                    });
                }
			}
		}
	}

	/*********************************
	 *
	 * Menu
	 *
	 *********************************/
	function Menu() {
		/*
			The menu consists of four different faces. The content of
			the first three faces is constant while the content of the
			fourth face dynamic. The fourth face, referred as the `stage`,
			is where information about locations that are selected is
			displayed.

			In addition to the four faces, there are are two tabs.
		*/
		var that         = this,
			container    = $('#menu-wrap'), // contains all of the menu HTML,
			menu         = $('#menu-window'), // this is the window through which the faces are viewed
			tab_one      = $('#tab-one'),
			tab_two      = $('#tab-two'),
			header_width = $('#menu-header').width() - 10,
			stage        = $('menu_stage');

		// Set all the faces to the same height
		menu.equalHeights();

		// The menu header has a gap the needs to move left and right
		// depending on how many tabs are displayed
		function reset_tab_gap() {
			var width = header_width - tab_one.width();
			if(tab_two.is(':visible')) {
				width -= tab_two.width();
			}
			$('#menu .gap').width(width);
		}
		reset_tab_gap();


		// Next Menu / Previous Menu actions
		$('.nav').click(function(){
			var page_num = $(this).attr('data-nav');
			$.cookie('menu_page', page_num);
			page_num -= 1;
			menu.animate({"margin-left" : '-' + (Number(page_num) * 230) }, 300);
		});

		// Hiding and Showing the menu
		$('#menu-hide,#menu-screen')
			.click(function(e) {
				e.preventDefault();
				var screen = $('#menu-screen');
				if(screen.is(':visible')) {
					menu.slideDown();
					screen.hide();
					container
						.removeClass('closed')
						.animate({'opacity':1}, 300);
				} else {
					menu.slideUp();
					container
						.animate({'opacity':.5}, 300, function() {
							container.addClass('closed');
						});
					screen.show();
				}
			})

		tab_one.click(function() {
			that.change_tabs();
		})
		tab_two.click(function() {
			that.change_tabs({
				label:$(this).text(),
				html :stage.html()
			})
		})

		// There are two button in the upper right hand corner of the menu:
		// email and print. They are updated based on various actions
		// ------
		this.change_buttons = function(options) {
			var defaults = {
				'loc_id'  : false,
				'title'   : false,
				'subject' : "UCF Campus Map",
				'body'    : escape("UCF Campus Map\nhttp://map.ucf.edu/"),
				'print'   : BASE_URL + '/print/?',
				'toggle_illustrated' : false
			}

			// setting
			var s = $.extend({}, defaults, options);

			var illustrated = (MAP.mapTypeId === 'illustrated');

			if(s.toggle_illustrated){
				var href = $('#print').attr('href');
				href = href.replace('&illustrated', '');
				if(illustrated) href = href + '&illustrated';
				$('#print').attr('href', href);
				return;
			}

			if(s.loc_id){
				var title   = escape(s.title);
				var link    = BASE_URL + '/?show=' + s.loc_id;
				link = escape(link);
				s.subject = escape("UCF Campus Map - ") + title;
				s.body    = title + escape("\n") + link;
				s.print   = s.print + '&show=' + s.loc_id;
			}

			// update email button
			var mailto = "mailto:?subject=" + s.subject + "&body=" + s.body;
			$('#email').attr('href', mailto);

			// update print button
			if(illustrated) s.print = s.print + '&illustrated';
			$('#print').attr('href', s.print);
		}
		this.change_buttons();

		this.change_tabs = function(options) {
			var defaults = {
				'label':false,
				'html' :false
			}

			var settings = $.extend({}, defaults, options);

			// If no label or html is set, go back to the `Menu` tab
			if(!settings.label && !settings.html) {
				menu.animate({'margin-left':0}, 300);
				tab_one.removeClass('off');
				tab_two.addClass('off');
			} else {
				tab_two.removeClass('off');
				tab_one.addClass('off');
				if(settings.label) {
					$('#menu-title').html(settings.label); // tab two title

				}
				tab_two.show();

				if(settings.html) {
                    $('#menu-stage').empty();
                    if (settings.html instanceof jQuery) {// tab two content
                        settings.html.appendTo('#menu-stage');
                    } else {
                        $('#menu-stage').html(settings.html);
                    }
				}

				menu.animate({'margin-left':-690}, 300);
				reset_tab_gap();
				menu.equalHeights();
			}
		}

		// Add the menu to the map in the right uppper
		MAP.controls[google.maps.ControlPosition.RIGHT_TOP].push(container[0]);
	}

	/*********************************
	 *
	 * Search
	 *
	 *********************************/
	function Search() {
		var that    = this,
			element = null,
			input   = null,
			results = null,
			timer   = null,
			timeout = 400, // milliseconds
			ajax    = null,

			KEYCODES = {
				ENTER      :13,
				LEFT_ARROW :37,
				RIGHT_ARROW:39,
				SHIFT      :16,
				CONTROL    :17,
				OPTION     :18,
				COMMAND    :224,
				DOWN       :40,
				UP         :38,
				ESCAPE     :27
			};

		// Create and populate the search element
		element = (function() {
			var div    = null,
				form   = null,
				input  = null,
				anchor = null,
				ul     = null;

			div    = document.createElement('div');
			form   = document.createElement('form');
			input  = document.createElement('input');
			anchor = document.createElement('a');
			ul     = document.createElement('ul');

			div.id        = 'search';
			div.style.zIndex = 9999;

			form.method = 'get';
			form.action = SEARCH_URL;
			form.id     = 'search-form';

			input.type         = 'text';
			input.name         = 'q';
			input.autocomplete = 'off';

			anchor.id = 'search-submit';
			anchor.onclick = '$(\'#search-form\').submit()';
			anchor.appendChild(document.createTextNode('search'));

			ul.id = 'search-results';
			ul.style.display = 'none';

			form.appendChild(input);
			form.appendChild(anchor);

			div.appendChild(form)
			div.appendChild(ul);

			return div;
		})();
		MAP.controls[google.maps.ControlPosition.TOP_LEFT].push(element);
		element = $(element);
		input   = element.find('input');
		results = element.find(' > ul');

		// Attach hover events
		// For some realy i can't get this to work with the `results` object.
		// So for now, reference directly
		$('#search > ul > li:not(.more)')
				.live('mouseover', function() {
						$(this).addClass('hover');
				})
				.live('mouseleave', function() {
						$(this).removeClass('hover');
				})

		// Hide the search results when anything else is clicked
		$(document).click(function(e) {
			var target = $(e.target);
			if(target != results || !target.inArray(results.find('*'))) {
				results.hide();
			}
		})

		// Attach the typing events
		input
			.focus(function(event) {
				if($(this).val() != '') {
					$(this).trigger('keyup');
				}
			})
			.keydown(function(event) {
				var keycode = UTIL.parse_keycode(event);
				if(keycode == KEYCODES.ENTER) {

				}
			})
			.keyup(function(event) {
				var keycode      = UTIL.parse_keycode(event),
					search_query = $(this).val();

				// Whatever happens, next we don't want to keep searching
				// if we are right now
				abort_ajax();

				// Ignore left, right, shift, control, option and command
				// These are text navigation commands
				if($.inArray(keycode,
						[
							KEYCODES.LEFT_ARROW,
							KEYCODES.RIGHT_ARROW,
							KEYCODES.SHIFT,
							KEYCODES.CONTROL,
							KEYCODES.OPTION,
							KEYCODES.COMMAND
						]
					) !== -1) {
					return;
				}

				// Search result navigation
				if(keycode === KEYCODES.DOWN) { // Scroll down results
					var current = results.find('.hover'),
						next    = null;
					if(current.length) {
						current.removeClass('hover');
						next = current.next();
					} else {
						next = results.find('li:first');
					}
					next.addClass('hover')
					$('body').trigger('search-result-highlighted', [next]);
				} else if(keycode === KEYCODES.UP) { // Scroll up results
					var current = results.find('.hover'),
						next    = null;
					if(current.length) {
						current.removeClass('hover');
						next = current.prev();
					} else {
						next = results.find('li:last')
					}
					next.addClass('hover')
					$('body').trigger('search-result-highlighted', [next]);
				} else if(keycode === KEYCODES.ESCAPE) { // Empty and hide results
					abort_ajax();
					that.hide_results();
				} else {
					if(search_query === '') {
						results.hide();
					} else {
						results.empty().show();

						// Wait <timeout> duration between keypresses before doing search
						clearTimeout(timer);
						timer = setTimeout(function() {
							results.append('<li><a data-pk="searching">Searching&hellip;</a></li>');

							ajax = $.getJSON(
								[SEARCH_URL, 'json'].join('.'),
								{q:search_query},
								function(data, text_status, jq_xhr) {
									results.empty();

									if(typeof data.results != 'undefined') {
										var locs = data.results.locations,
											orgs = data.results.organizations;

										if(!locs.length) { // There weren't any results
											results.append('<li><a data-pk="null">No results</a></li>');
										} else {

											// Because of the way the search returns results,
											// we need to check to see if the location name
											// actually contains the search term. It could be that
											// an organization under the location contains the search query
											// but the location name itself does not. We want to ignore
											// those results. We also want to prioritize locations
											// with organization matches to those without organization
											// matches. We dont' display just organizations.

											var best_matches   = [], // locations with organizations where the search term is the name
												better_matches = [], // locations with organizations where the search term isn't in the name
												good_matches   = []; // locations without organizations where the search term is in the name

											$.each(locs, function(index, loc) {
												var org_list             = '',
													highlighted_loc_link = UTIL.highlight_term(loc.link, search_query, true);

												// Associate organizations with their locations
												loc.orgs = [];
												$.each(orgs, function(_index, org) {
													if(loc.id == org.bldg_id) {
														// Hightlight the search query in the org name
														org.name = UTIL.highlight_term(org.name, search_query);
														loc.orgs.push(org);
													}
												});

												if(loc.orgs.length && loc.link != highlighted_loc_link) {
													loc.link = highlighted_loc_link;
													best_matches.push(loc);
												} else if(loc.orgs.length) {
													better_matches.push(loc);
												} else if(loc.link != highlighted_loc_link) {
													loc.link = highlighted_loc_link;
													good_matches.push(loc);
												}
											});

											// Keep track of the total amount of locations and organizations
											// we are displaying. We don't want to go over 11 or else the
											// results list will be too long
											var org_loc_count = 0;
											$.each(best_matches.concat(better_matches, good_matches), function(index, loc) {
												var org_html = '';

												org_loc_count += loc.orgs.length;
												$.each(loc.orgs, function(_index, org) {
													org_html += '<li>' + org.name + '</li>';
												});
												if(org_html != '') org_html = '<ul>' + org_html + '</ul>';

												results.append('<li>' + loc.link + org_html + '</ul>');

												if(org_loc_count > 11) {
													results.append('<li class="more"><a href="' + data.response_page_url + '">More Results &hellip;</a></li>');
													return false;
												}
												org_loc_count++;
											});
										}
									}
								}
							);
						}, timeout);
					}
				}
			});

		function abort_ajax() {
			if(ajax != null) ajax.abort();
		}

		this.current_location_id = function() {
			var li          = results.find('li.hover:not(.more)'),
				location_id = null;
			if(li.length && li.find('a').length && typeof li.find('a').attr('data-pk') != 'undefined') {
				location_id = li.find('a').attr('data-pk');
			}
			return location_id;
		}

		this.hide_results = function() {
			results.empty().hide();
		}
	}

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
			return 'url("http://cdn.ucf.edu/map/tiles/' + filename + '?_=' + new Date().getTime() + '")';
		}

		// Wraps a specified term with start and end wraps. Preserves capitalization.
		this.highlight_term = function(string, term, link) {
			if(typeof link != 'undefined' && link) {
				var matches = string.match(/<a([^>]+)>([^<]*)<\/a>/);
				if(matches != null) {
					return '<a' + matches[1] + '>' + UTIL.highlight_term(matches[2], term) + '</a>';
				} else {
					return string;
				}
			} else {
				var low_sub  = string.toLowerCase();
				var term_loc = low_sub.indexOf(term.toLowerCase());
				if(term_loc > - 1) {
					return string.substr(0, term_loc) + '<span class="highlight">' + string.substr(term_loc, term.length) + '</span>' + string.substr(term_loc+ term.length);
				} else {
					return string;
				}
			}
		}

		// Platform generic event keycode parser. Designed to be used with keyup/down
		this.parse_keycode = function(event) {
			return document.layers ? event.which : document.all ? event.keyCode : document.getElementById ? event.keyCode : 0;
		}

		// Returns URL of google icon based on specified color
		this.get_google_image = function(color) {
			return new google.maps.MarkerImage(
				(STATIC_URL + 'images/markers/' + color + '.png'),
				new google.maps.Size(19, 19),
				new google.maps.Point(0,0),
				new google.maps.Point(10,10));
		}

		// Creates an info box for a location and also executes arbitary function
		// Special handling for Group objects to show each individual info box
		// and set an appropriate zoom level
		this.highlight_location = function(location_id, options) {
			var options = $.extend({
				func              : undefined,
				pan               : false,
				reset_zoom_center : true,
				sublocation       : false
			}, options);

			if(!options.sublocation) INFO_MANAGER.clear();

			$.ajax({
				url      :LOCATION_URL.replace('%s', location_id),
				dataType :'json',
				success  : function(data, text_status, jq_xhr) {
					var map_type       = MAP.mapTypeId;
					var point_type     = (map_type === 'illustrated') ? 'illustrated_point' : 'googlemap_point',
						default_zoom   = (map_type === 'illustrated') ? IMAP_OPTIONS.zoom : GMAP_OPTIONS.zoom,
						default_center = (map_type === 'illustrated') ? IMAP_OPTIONS.center : GMAP_OPTIONS.center;

					if(typeof options.func != 'undefined') {
						options.func(data);
					}

					if(data.object_type == 'Group') {
						CURRENT_LOCATION = location_id;
						// Pan to the group center point
						MAP.panTo((new google.maps.LatLng(data[point_type][0], data[point_type][1])));

						$.each(data.locations.ids, function(index, sub_location_id) {
							that.highlight_location(sub_location_id, {sublocation:true});
							if(index == (data.locations.ids.length - 1)) {
								$('body').bind('highlight-location-loaded', function(event, event_location_id) {
									if(event_location_id == sub_location_id) {
										$('body').unbind('highlight-location-loaded');
										if(typeof data[point_type] != 'undefined') {
											var points           = [],
												distance_total   = 0,
												distance_count   = 0,
												average_distance = null,
												zoom             = null,
												interval         = .09,
												increment        = .05;

											if(SIMPLE) {
												zoom = 16;
											} else {
												if(map_type == 'illustrated') {
													zoom = 16;
												} else {
													zoom = 19;
												}
											}

											// Collect the position of each infobox
											$.each(INFO_MANAGER.infos, function(index, info) {
												var pos = info.box.getPosition();
												if(pos != null) points.push(pos);
											});

											// Caculate the average distance between them
											$.each(points, function(index, point) {
												$.each(points, function(_index, cpoint) {
													if(index != _index) {
														var distance = that.calc_distance(point, cpoint);
														if(distance > 0) {
															distance_total += distance;
															distance_count += 1;
														}
													}
												});
											});
											average_distance = distance_total / distance_count;
											// Iterate to figure out the zoom
											while(average_distance > interval) {
												interval += increment;
												zoom     -= 1;
											}

											if(SIMPLE) {
												MAP.setZoom(zoom - 1);
											} else {
												if(map_type == 'illustrated') {
													if(zoom < 12) zoom = 12;
													if(zoom > 16) zoom = 16;
												} else {
													zoom = (zoom < 15) ? 15 : zoom;
												}
												MAP.setZoom(zoom);
											}
										}
									}
								});
							}
						});
						if(MENU != null) {
							MENU.change_buttons({'loc_id':location_id, 'title': data.name});
						}
					} else {
						// Create the info box(es)
						if(typeof data[point_type] != 'undefined' && data[point_type] != null) {
							INFO_MANAGER.register(
								new Info(
									data[point_type],
									data.name,
									{link: data.profile_link}
								)
							);
							if(!options.sublocation) {
								CURRENT_LOCATION = location_id;
								if(MENU != null) {
									MENU.change_buttons({'loc_id':location_id, 'title': data.name});
								}
							}
							$('body').trigger('highlight-location-loaded', [location_id]);
						}
					}
				}
			});
		}

		// Calculate the distance between two Google LatLng objects
		this.calc_distance = function(a, b) {
			var a_lat = a.lat(),
				a_lng = a.lng(),
				b_lat = b.lat(),
				b_lng = b.lng(),
				x     = null,
				y     = null,
				R     = 6371; // radius of the earth
			a_lat = a_lat * (Math.PI/180);
			a_lng = a_lng * (Math.PI/180);
			b_lat = b_lat * (Math.PI/180);
			b_lng = b_lng * (Math.PI/180);
			return Math.acos(Math.sin(a_lat)*Math.sin(b_lat) + Math.cos(a_lat)*Math.cos(b_lat) * Math.cos(b_lng-a_lng)) * R;
		}

		// Resize teh map canvase to be 100% height and width
		this.resize_canvas = function() {
			var height = document.documentElement.clientHeight,
				blackbar = document.getElementById('UCFHBHeader') || document.getElementById('ucfhb');

			height -= blackbar ? blackbar.clientHeight : 0;
			height -= $('#map header')[0].clientHeight;
			height -= $('footer')[0].clientHeight;
			height -= 2 + 17; // borders + margin

			var canvas   = document.getElementById('map-canvas');
			canvas.style.height = height + "px";

			// iphone, hide url bar
			if($.os.name === "iphone"){
				height += 58;
				document.getElementById('map-canvas').style.height = height + "px";
				window.scrollTo(0, 1);
			}
		}
	}

	// Log a message to the console if it's available
	function log() {
		if(typeof console !== 'undefined') {
			console.log(arguments);
		}
	}
}

	// if($("#error-close").length > 0) {
	// 	$("#error-close").click(function() {
	// 		$("#error").hide();
	// 	});
	// }

  // ADD JSON OF ROUTES TO BE USED WITHIN CampusMap Class

	//Campus.scripts.google(); // fire off maps
	var map = new CampusMap({
		"urls": {
			"static"        : "/static/",
			"search"        : "/search/",
			"location"      : "/locations/%s/.json",
			"parking_json"  : "/parking/.json",
			"dining"        : "/food/.json",
			"parking_kml"   : "http://map.ucf.edu/parking.kml?v=1412608463.0",
			"buildings_kml" : "http://map.ucf.edu/locations.kml?v=1412608463.0",
			"sidewalks_kml" : "http://map.ucf.edu/sidewalks.kml?v=1412608463.0",
			"bikeracks"     : "/bikeracks/.json",
			"phones"        : "/emergency-phones/.json",
			"base_url"      : "http://map.ucf.edu"
		},
		"base_ignore_types"   : ["DiningLocation"],
		"infobox_location_id" : null,
		"points"              : {"parkinglot-32": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot 32", "gpoint": ""}, "parkinglot-33": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-36": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-37": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-34": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-35": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-38": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-39": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "h8": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H8", "gpoint": ""}, "133": {"ipoint": [85.047973530801173, -179.92914247617591], "type": "Building", "name": "Tower IV", "gpoint": [28.605542057769998, -81.195761436393724]}, "c3": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot C3", "gpoint": ""}, "131": {"ipoint": [85.049069948007428, -179.9368786807463], "type": "ParkingLot", "name": "Parking Garage G", "gpoint": [28.608688036355829, -81.197510236671434]}, "130": {"ipoint": [85.049607696611545, -179.93660974607337], "type": "Building", "name": "Tower II", "gpoint": [28.609620508913839, -81.197402948310838]}, "137": {"ipoint": [85.048403236671632, -179.9434762011515], "type": "Building", "name": "Knights Plaza I", "gpoint": [28.606908633034642, -81.19846522808075]}, "2320": {"ipoint": [85.046891692727272, -179.94433450803626], "type": "DiningLocation", "name": "Starbucks", "gpoint": [28.602895218387086, -81.198819154670701]}, "135": {"ipoint": [85.048969947015934, -179.91483235411579], "type": "Building", "name": "Bright House Networks Stadium", "gpoint": [28.608199044011172, -81.192639470100403]}, "134": {"ipoint": [85.048158753409837, -179.92477655236144], "type": "ParkingLot", "name": "Parking Garage E", "gpoint": [28.606305013325553, -81.195235723426805]}, "lake-claire": {"ipoint": [85.047154673235127, -179.96823656337909], "type": "Group", "name": "Lake Claire Apartments", "gpoint": [28.604306775791038, -81.203847649104347]}, "center-emerging-media": {"ipoint": null, "type": "Building", "name": "Center for Emerging Media", "gpoint": [28.54671563269163, -81.385073089769378]}, "d2": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot D2", "gpoint": ""}, "93": {"ipoint": [85.045201775398297, -179.96888208494056], "type": "Building", "name": "Teaching Academy", "gpoint": [28.599235688286541, -81.203963631561265]}, "d1": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot D1", "gpoint": null}, "24": {"ipoint": [85.044427037757387, -179.93731999449665], "type": "Building", "name": "Creative School for Children 1", "gpoint": [28.596979621033267, -81.197515601089464]}, "b16": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B16", "gpoint": ""}, "26": {"ipoint": [85.045865210629501, -179.96032261900837], "type": "Building", "name": "John T. Washington Center", "gpoint": [28.600841752581442, -81.202134365013109]}, "27": {"ipoint": [85.045372275594175, -179.94467783079017], "type": "Building", "name": "Counseling and Psychological Services", "gpoint": [28.599341661027086, -81.198811108043657]}, "20": {"ipoint": [85.045772557401591, -179.94277024321491], "type": "Building", "name": "Biological Sciences", "gpoint": [28.600157264682949, -81.198548376560211]}, "21": {"ipoint": [85.045494587346795, -179.96967816405231], "type": "Building", "name": "Education", "gpoint": [28.600055208031776, -81.203877800872789]}, "22": {"ipoint": [85.040818653751259, -179.91043138608802], "type": "Building", "name": "Print Shop", "gpoint": [28.597332870669476, -81.196394437721239]}, "4": {"ipoint": [85.042030146531189, -179.90187192015583], "type": "Building", "name": "Storm Water Research Lab", "gpoint": [28.591666603297384, -81.189334863594041]}, "memorymall": {"ipoint": [85.047440051074446, -179.94527864560951], "type": "Building", "name": "Memory Mall", "gpoint": [28.604755548403833, -81.198765510490404]}, "3251": {"ipoint": [85.040887285694055, -179.94121563460794], "type": "Building", "name": "Bennett Research II", "gpoint": [28.58915130414935, -81.198175424507127]}, "28": {"ipoint": [85.044319528729872, -179.93731999449665], "type": "Building", "name": "Early Childhood Center", "gpoint": [28.596503909647129, -81.197875017097459]}, "29": {"ipoint": [85.045846680122196, -179.95154428586829], "type": "Building", "name": "Technology Commons II", "gpoint": [28.600503821737348, -81.200058335235582]}, "407": {"ipoint": [85.047577131198892, -179.97607255034382], "type": "Building", "name": "Kappa Delta - Sorority", "gpoint": [28.605259480232291, -81.204886311462388]}, "406": {"ipoint": [85.047296298166927, -179.98004007444251], "type": "Building", "name": "Alpha Delta Pi - Sorority", "gpoint": [28.604545497715954, -81.205782169273363]}, "540": {"ipoint": [85.044656876839966, -179.93483090453083], "type": "Building", "name": "Creative School Module 2", "gpoint": [28.597200990944199, -81.197183007171617]}, "404": {"ipoint": [85.047069545313335, -179.98141336545814], "type": "Building", "name": "Alpha Xi Delta - Sorority", "gpoint": [28.603856000533831, -81.205889457633958]}, "403": {"ipoint": [85.047688274467305, -179.98216652922565], "type": "Building", "name": "Delta Delta Delta - Sorority", "gpoint": [28.605344253573424, -81.205905550888048]}, "402": {"ipoint": [85.043311054943914, -179.96693158202106], "type": "Building", "name": "BPW Scholarship House", "gpoint": [28.595223569841732, -81.20369553565979]}, "401": {"ipoint": [85.047414857604025, -179.98518991575111], "type": "Building", "name": "Zeta Tau Alpha - Sorority", "gpoint": [28.604929805477738, -81.206463450363145]}, "153": {"ipoint": [85.044097088872832, -179.9657921801554], "type": "Building", "name": "Visitor and Parking Information Center", "gpoint": [28.596984801921533, -81.203376227786976]}, "b12": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B12", "gpoint": ""}, "8126": {"ipoint": [85.039089558212012, -179.94442033872474], "type": "Building", "name": "Partnership III", "gpoint": [28.58510856556796, -81.199390465190902]}, "b5": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B5", "gpoint": ""}, "327": {"ipoint": [85.041760868985463, -179.93892717466224], "type": "Building", "name": "Recycling Center", "gpoint": [28.591666603297384, -81.197976941040025]}, "residence-halls": {"ipoint": [85.044490332009872, -179.93718109441701], "type": "Group", "name": "Residence Halls", "gpoint": [28.596417492068035, -81.199819418568524]}, "119": {"ipoint": [85.043074610178365, -179.93021056859504], "type": "Building", "name": "Performing Arts Center", "gpoint": [28.602052642776819, -81.20439814942165]}, "food": {"ipoint": [85.047502228235643, -179.94585428778171], "type": "Group", "name": "Restaurants & Eateries", "gpoint": [28.604683857382952, -81.199184574623501]}, "rosen-college": {"ipoint": null, "type": "Location", "name": "Rosen College of Hospitality Management", "gpoint": [28.428237817336971, -81.4417503015747]}, "8112": {"ipoint": [85.041152529971484, -179.94888353452552], "type": "Building", "name": "Innovative Center", "gpoint": [28.589617628432787, -81.199736470153795]}, "b2": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B2", "gpoint": ""}, "121": {"ipoint": [85.045542769937541, -179.94115877256263], "type": "Building", "name": "Physical Sciences Building", "gpoint": [28.599767905860084, -81.197891110351549]}, "122": {"ipoint": [85.044875584802597, -179.97334528074134], "type": "Building", "name": "Morgridge International Reading Center", "gpoint": [28.598445216389226, -81.204543113708496]}, "124": {"ipoint": [85.041885495129719, -179.91066956572467], "type": "Building", "name": "Biological Transgenic Greenhouse", "gpoint": [28.591308624361034, -81.192145818641649]}, "h4": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot H4", "gpoint": null}, "126": {"ipoint": [85.047866098521553, -179.9450018411153], "type": "Building", "name": "Fairwinds Alumni Center", "gpoint": [28.60567392702751, -81.198872798850999]}, "127": {"ipoint": [85.045409340079686, -179.94802522764076], "type": "Building", "name": "Health Center & Pharmacy", "gpoint": [28.599372275354497, -81.199291223457323]}, "128": {"ipoint": [85.048536586103083, -179.92133188352454], "type": "Building", "name": "Nicholson Fieldhouse", "gpoint": [28.607039706031383, -81.194237941673265]}, "2": {"ipoint": [85.045554630241114, -179.95858240232337], "type": "Building", "name": "John C. Hitt Library", "gpoint": [28.600050498166432, -81.20159792321013]}, "towers-knights-plaza": {"ipoint": [85.048234292916661, -179.93103146411158], "type": "Group", "name": "Towers at Knights Plaza", "gpoint": [28.606625255337335, -81.196467527916894]}, "veterans-commemorative-site": {"ipoint": [85.047034716372792, -179.94813466124469], "type": "Building", "name": "Veterans Commemorative Site", "gpoint": [28.603576950777914, -81.19943874495317]}, "greek-park": {"ipoint": [85.047593267832028, -179.98087129120449], "type": "Group", "name": "Greek Park", "gpoint": [28.605658694859155, -81.206043946586789]}, "60": {"ipoint": [85.047165879470967, -179.97034120664466], "type": "Building", "name": "Pegasus Courtyard #60", "gpoint": [28.604037323630024, -81.203958267143236]}, "59": {"ipoint": [85.046980619816594, -179.97264504607301], "type": "Building", "name": "Aquarius Courtyard #59", "gpoint": [28.603921936241342, -81.204564446380601]}, "58": {"ipoint": [85.047158469217493, -179.97566270933021], "type": "Building", "name": "Aquarius Courtyard #58", "gpoint": [28.60394077500737, -81.204977506568895]}, "132": {"ipoint": [85.048326188745861, -179.9328331957804], "type": "Building", "name": "Tower III", "gpoint": [28.606597007195667, -81.196480268409715]}, "55": {"ipoint": [85.047013967064515, -179.97259640746051], "type": "Building", "name": "Aquarius Courtyard #55", "gpoint": [28.603563999045932, -81.204403513839708]}, "54": {"ipoint": [85.046007893219937, -179.95117199447122], "type": "Building", "name": "College of Sciences Building", "gpoint": [28.601023080879116, -81.200313145091997]}, "57": {"ipoint": [85.046977655651176, -179.9764351855265], "type": "Building", "name": "Aquarius Courtyard #57", "gpoint": [28.603634644641637, -81.20509552376555]}, "2315": {"ipoint": [85.04840618845563, -179.94324278086424], "type": "DiningLocation", "name": "Dunkin Donuts", "gpoint": [28.606764034786089, -81.198647618293762]}, "51": {"ipoint": [85.046688636615229, -179.96630716428626], "type": "Building", "name": "Visual Arts Building", "gpoint": [28.602730377429943, -81.203470105102525]}, "50": {"ipoint": [85.048484728416526, -179.93738222226966], "type": "Building", "name": "CFE Arena", "gpoint": [28.607016952813609, -81.197558641433716]}, "53": {"ipoint": [85.046202453782712, -179.93762040190632], "type": "Building", "name": "CREOL", "gpoint": [28.601199699050053, -81.197472685745225]}, "52": {"ipoint": [85.046358096745067, -179.95229744963581], "type": "Building", "name": "Student Union", "gpoint": [28.601669501975557, -81.200527721813231]}, "415": {"ipoint": [85.046721244687745, -179.98632931761676], "type": "Building", "name": "Fraternity and Sorority Life", "gpoint": [28.603437631426797, -81.206549406051636]}, "416": {"ipoint": [85.046906514019426, -179.9874215136515], "type": "Building", "name": "Chi Omega - Sorority", "gpoint": [28.603757891465278, -81.206774711608887]}, "417": {"ipoint": [85.047080660888454, -179.98684430174762], "type": "Building", "name": "Kappa Kappa Gamma - Sorority", "gpoint": [28.604153505459205, -81.206763982772827]}, "410": {"ipoint": [85.048351377591956, -179.97849512204994], "type": "Building", "name": "Alpha Tau Omega - Fraternity", "gpoint": [28.606785389906982, -81.205251091888414]}, "411": {"ipoint": [85.048099482926972, -179.98064088926185], "type": "Building", "name": "Kappa Alpha Theta - Sorority", "gpoint": [28.606361528331519, -81.205776804855333]}, "412": {"ipoint": [85.048329152106277, -179.98341107420856], "type": "Building", "name": "Sigma Chi - Fraternity", "gpoint": [28.607067963340505, -81.206425899436937]}, "apollo-community": {"ipoint": [85.044650664307554, -179.95314583509753], "type": "Group", "name": "Apollo Community", "gpoint": [28.598162560122319, -81.200970453938709]}, "2060": {"ipoint": [85.046399554390007, -179.95093166828156], "type": "DiningLocation", "name": "Nathan's Famous/Arthur Treachers", "gpoint": [28.601669501975557, -81.200527721813231]}, "2061": {"ipoint": [85.04600673509853, -179.95865643024445], "type": "DiningLocation", "name": "Chick- Fil- A", "gpoint": [28.600841752581442, -81.202134365013109]}, "2062": {"ipoint": [85.045902966324164, -179.96071636676788], "type": "DiningLocation", "name": "Barnes & Noble Cafe", "gpoint": [28.600841752581442, -81.202134365013109]}, "2063": {"ipoint": [85.046140148908307, -179.94655430316925], "type": "DiningLocation", "name": "Einstein Bagels - Business Administration Bldg", "gpoint": [28.60101130632378, -81.199216121604906]}, "2064": {"ipoint": [85.045473044017982, -179.97075855731964], "type": "DiningLocation", "name": "Einstein Bagels - Education Bldg", "gpoint": [28.600055208031776, -81.203877800872789]}, "2065": {"ipoint": [85.045591646991923, -179.9573689699173], "type": "DiningLocation", "name": "Java City, Library", "gpoint": [28.600050498166432, -81.20159792321013]}, "2066": {"ipoint": [85.048452085577054, -179.93488132953644], "type": "DiningLocation", "name": "Jimmy John's", "gpoint": [28.60671171445474, -81.197258234024048]}, "2067": {"ipoint": [85.0464069657761, -179.95118916034698], "type": "DiningLocation", "name": "Joffrey's Coffee", "gpoint": [28.601669501975557, -81.200527721813231]}, "319": {"ipoint": [85.04666640368491, -179.92356348142494], "type": "Building", "name": "Engineering Research Pavilion", "gpoint": null}, "56": {"ipoint": [85.0469991460931, -179.97444176726276], "type": "Building", "name": "Aquarius Courtyard #56", "gpoint": [28.603502772824644, -81.204741472175584]}, "147": {"ipoint": [85.045109109793657, -179.97818112547975], "type": "ParkingLot", "name": "Parking Garage A", "gpoint": [28.599628287126819, -81.205337047576904]}, "310": {"ipoint": [85.045275906637357, -179.95780992612708], "type": "Building", "name": "Reflections Kiosk", "gpoint": [28.599311046690772, -81.20136188881682]}, "317": {"ipoint": [85.042032325519926, -179.96555909514427], "type": "Building", "name": "Rec Services Soccer Field Pavilion", "gpoint": [28.591985780336817, -81.203572154045105]}, "50c": {"ipoint": [85.048951428092693, -179.93429231748451], "type": "Building", "name": "The Venue", "gpoint": [28.607915679081046, -81.196963066032396]}, "115": {"ipoint": [85.042949882593405, -179.95045208983356], "type": "Building", "name": "Hercules 115", "gpoint": [28.594091260116773, -81.200487613677979]}, "114": {"ipoint": [85.042769657380489, -179.94923829857726], "type": "Building", "name": "Hercules 114", "gpoint": [28.594125320275829, -81.200519675186143]}, "117": {"ipoint": [85.041869175242823, -179.90622568235267], "type": "Building", "name": "Ara Dr. Research Facility", "gpoint": [28.591346306411744, -81.191201681068407]}, "116": {"ipoint": [85.045994922244745, -179.93849802121986], "type": "Building", "name": "Harris Corporation Engineering Center", "gpoint": [28.600642055485636, -81.197714084556566]}, "111": {"ipoint": [85.042797841197341, -179.94723343901569], "type": "Building", "name": "Hercules 111", "gpoint": [28.593578943806808, -81.199564808776842]}, "110": {"ipoint": [85.043021822488143, -179.94787716917926], "type": "Building", "name": "Hercules 110", "gpoint": [28.594181841976024, -81.199656003883348]}, "113": {"ipoint": [85.043109335645411, -179.95028042845661], "type": "Building", "name": "Hercules 113", "gpoint": [28.594346696342154, -81.200294369628892]}, "112": {"ipoint": [85.042823428954705, -179.94911205794779], "type": "Building", "name": "Hercules 112", "gpoint": [28.593561839919467, -81.200144290924072]}, "82": {"ipoint": [85.049477338629657, -179.9299149523722], "type": "Building", "name": "Jay Bergman Field - Baseball Stadium", "gpoint": [28.609413293217699, -81.196072572639451]}, "83": {"ipoint": [85.046476678585165, -179.93044137780089], "type": "ParkingLot", "name": "Parking Garage C", "gpoint": [28.60190616876525, -81.19560050385283]}, "80": {"ipoint": [85.046891692727272, -179.94433450803626], "type": "Building", "name": "Health & Public Affairs I", "gpoint": [28.602895218387086, -81.198819154670701]}, "81": {"ipoint": [85.04332774091813, -179.96147167708841], "type": "Building", "name": "Barbara Ying Center - CMMS", "gpoint": [28.594987270853316, -81.202450865676866]}, "86": {"ipoint": [85.044920066599687, -179.93952798948158], "type": "Building", "name": "Flagler Hall", "gpoint": [28.598248488314475, -81.197832101753193]}, "87": {"ipoint": [85.047321492238964, -179.96390390500892], "type": "Building", "name": "College of Arts & Humanities", "gpoint": [28.604402323718716, -81.202665442398057]}, "84": {"ipoint": [85.045244771674348, -179.94255566649372], "type": "Building", "name": "Sumter Hall", "gpoint": [28.598811796255383, -81.198339039257036]}, "85": {"ipoint": [85.044957134459665, -179.94195485167438], "type": "Building", "name": "Citrus Hall", "gpoint": [28.59832196333447, -81.198411458900438]}, "2069": {"ipoint": [85.046399554390007, -179.9533349275589], "type": "DiningLocation", "name": "Mrs. Fields/Pretzel Time", "gpoint": [28.601851329032215, -81.200712919235229]}, "51a": {"ipoint": [85.046693453691773, -179.96979725387064], "type": "Building", "name": "Art Gallery", "gpoint": [28.602782184615737, -81.203657859733568]}, "2305": {"ipoint": [85.048462503527858, -179.93288040161133], "type": "DiningLocation", "name": "Burger U", "gpoint": [28.607120562932465, -81.196593046188354]}, "2304": {"ipoint": [85.046377320165377, -179.95153248310089], "type": "DiningLocation", "name": "Asian Chao", "gpoint": [28.601669501975557, -81.200527721813231]}, "525": {"ipoint": [85.046060147399487, -179.93371510558063], "type": "Building", "name": "Arboretum", "gpoint": [28.600591983936596, -81.196810305118561]}, "2078": {"ipoint": [85.046429199867987, -179.95204746723175], "type": "DiningLocation", "name": "Subway, Student Union", "gpoint": [28.602125011322705, -81.200482249259949]}, "129": {"ipoint": [85.048918834665201, -179.94141626462806], "type": "Building", "name": "Tower I", "gpoint": [28.608019288313521, -81.198330992629991]}, "7": {"ipoint": [85.044545908840803, -179.94636797911994], "type": "Group", "name": "Ferrell Commons", "gpoint": [28.597836392773555, -81.199510326406241]}, "301": {"ipoint": [85.044927480193834, -179.93351984128822], "type": "Building", "name": "Water Tower", "gpoint": [28.597836838095287, -81.196887964179979]}, "2072": {"ipoint": [85.046414377151137, -179.95376408100128], "type": "DiningLocation", "name": "Qdoba", "gpoint": [28.602011461590937, -81.200798749923706]}, "2077": {"ipoint": [85.043960607822427, -179.94363605976105], "type": "DiningLocation", "name": "Subway, Recreation & Wellness", "gpoint": [28.596075296554286, -81.199141019752489]}, "529": {"ipoint": [85.044553079861345, -179.93637585692341], "type": "Building", "name": "Creative School 1st Grade", "gpoint": [28.597094545160214, -81.1973600329666]}, "2074": {"ipoint": [85.046280970708267, -179.95118916034698], "type": "DiningLocation", "name": "Smoothie King", "gpoint": [28.6016365920654, -81.20044469833374]}, "2289": {"ipoint": [85.044679813826136, -179.94921505451202], "type": "DiningLocation", "name": "'63 South", "gpoint": [28.597892238848399, -81.199774146080017]}, "25": {"ipoint": [85.042739990056006, -179.95111513242591], "type": "Building", "name": "Recreation Support", "gpoint": [28.593414088236667, -81.200554543903337]}, "8118": {"ipoint": [85.040176806481739, -179.9459030633443], "type": "Building", "name": "University Tower", "gpoint": [28.587914829283093, -81.19909810440825]}, "e4": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot E4", "gpoint": null}, "413": {"ipoint": [85.048192833662256, -179.97231531247962], "type": "Building", "name": "Kappa Sigma - Fraternity", "gpoint": [28.606578168905983, -81.204290861061082]}, "64": {"ipoint": [85.047269621858206, -179.96871042356361], "type": "Building", "name": "Pegasus Courtyard #64", "gpoint": [28.604190388337742, -81.203716868331895]}, "505": {"ipoint": [85.04358173160756, -179.95019459776813], "type": "Building", "name": "Trailer 4", "gpoint": [28.595430813234803, -81.20045006275177]}, "108": {"ipoint": [85.043183127280187, -179.94224560286966], "type": "Building", "name": "Hercules 108", "gpoint": [28.594276044502589, -81.199033731391893]}, "109": {"ipoint": [85.043255434625237, -179.94414353423053], "type": "Building", "name": "Hercules 109", "gpoint": [28.594492709993318, -81.199419969490037]}, "3267": {"ipoint": [85.041122852993226, -179.94141626462806], "type": "Building", "name": "Technology Incubator", "gpoint": [28.589688283403213, -81.197993034294115]}, "102": {"ipoint": [85.04324431048677, -179.9386074548238], "type": "Building", "name": "Nike 102", "gpoint": [28.59447386953363, -81.198282712867723]}, "103": {"ipoint": [85.043340718859326, -179.93626642331947], "type": "Building", "name": "Nike 103", "gpoint": [28.594561006559648, -81.197966212203966]}, "100": {"ipoint": [85.043700379743342, -179.97542882018024], "type": "Building", "name": "Burnett House", "gpoint": [28.596112976896222, -81.205052608421312]}, "101": {"ipoint": [85.043451956964972, -179.93806886777747], "type": "Building", "name": "Nike 101", "gpoint": [28.594907199252912, -81.198314899375902]}, "106": {"ipoint": [85.042870524777939, -179.93344545713626], "type": "Building", "name": "Nike 106", "gpoint": [28.594078219099298, -81.197478050163255]}, "neptune-community": {"ipoint": [85.042801178020312, -179.93824839504668], "type": "Group", "name": "Neptune Community", "gpoint": [28.593711622456834, -81.198277473449707]}, "104": {"ipoint": [85.043600270565548, -179.93532228574622], "type": "Building", "name": "Nike 104", "gpoint": [28.595161544125709, -81.197724813392625]}, "105": {"ipoint": [85.043489035780155, -179.93386316404212], "type": "Building", "name": "Nike 105", "gpoint": [28.594841257889154, -81.197059625556932]}, "39": {"ipoint": [85.04371150286083, -179.95197343931068], "type": "Building", "name": "Wayne Densch Center II", "gpoint": [28.595755013102064, -81.200573319366441]}, "38": {"ipoint": [85.043644763782453, -179.95532083616126], "type": "Building", "name": "Wayne Densch Center I", "gpoint": [28.595799758643007, -81.201576465538011]}, "2271": {"ipoint": [85.0464069657761, -179.95058834552765], "type": "DiningLocation", "name": "Toppers Creamery", "gpoint": [28.602058559355878, -81.200079917907715]}, "33": {"ipoint": [85.045157296123818, -179.9435427194112], "type": "Building", "name": "Libra Community Center", "gpoint": [28.598701907663187, -81.198556423187256]}, "rosen-college-apartments": {"ipoint": null, "type": "Building", "name": "Rosen College Apartments", "gpoint": [28.43, -81.440799999999996]}, "31": {"ipoint": [85.044868171131029, -179.9438860421651], "type": "Building", "name": "Orange Hall", "gpoint": [28.598128855497865, -81.198711866310106]}, "30": {"ipoint": [85.045094283136478, -179.94611764006549], "type": "Building", "name": "Brevard Hall", "gpoint": [28.598858895454399, -81.198840612342821]}, "88": {"ipoint": [85.043896884486159, -179.94648027524818], "type": "Building", "name": "Recreation and Wellness Center", "gpoint": [28.596075296554286, -81.199141019752489]}, "ucf-main-campus": {"ipoint": null, "type": "Location", "name": "UCF Main Campus", "gpoint": [28.60269526019405, -81.200101375579834]}, "160": {"ipoint": [85.043904299607306, -179.93185043334961], "type": "ParkingLot", "name": "Libra Garage", "gpoint": [28.595600375707001, -81.196646690368652]}, "2167": {"ipoint": [85.048355776374223, -179.94303524494171], "type": "DiningLocation", "name": "Domino's Pizza", "gpoint": [28.606889000254181, -81.198422187736497]}, "1002": {"ipoint": null, "type": "Building", "name": "Burnett School of Biomedical Sciences", "gpoint": [28.367699999999999, -81.279499999999999]}, "1001": {"ipoint": null, "type": "Building", "name": "Medical Education Building", "gpoint": [28.36753566646474, -81.280457492065409]}, "623": {"ipoint": null, "type": "Building", "name": "Retirement Planning & Investments / Athletics", "gpoint": null}, "151": {"ipoint": [85.047484509907903, -179.95478152879514], "type": "ParkingLot", "name": "Parking Garage H", "gpoint": [28.604800000000001, -81.200800000000001]}, "b8": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B8", "gpoint": null}, "h9": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H9", "gpoint": ""}, "7f": {"ipoint": [85.044727309268907, -179.9459030633443], "type": "Building", "name": "Student Disability Services", "gpoint": [28.597874517805746, -81.199130290916429]}, "h2": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H2", "gpoint": ""}, "h3": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot H3", "gpoint": null}, "h1": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H1", "gpoint": ""}, "h6": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H6", "gpoint": ""}, "h7": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H7", "gpoint": ""}, "parkinglot-70": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot 70 - Aquarius Courtyard", "gpoint": null}, "h5": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H5", "gpoint": ""}, "2190": {"ipoint": [85.048627885568365, -179.93343746289611], "type": "DiningLocation", "name": "Knightro's", "gpoint": [28.607485993828536, -81.196657419204712]}, "61": {"ipoint": [85.04723257125444, -179.97231531247962], "type": "Building", "name": "Pegasus Courtyard #61", "gpoint": [28.604249259319793, -81.204245263507829]}, "62": {"ipoint": [85.047388181932291, -179.97188615903724], "type": "Building", "name": "Pegasus Courtyard #62", "gpoint": [28.604484742918157, -81.204253310134874]}, "8119": {"ipoint": [85.039398316404217, -179.94708109006751], "type": "Building", "name": "Partnership II", "gpoint": [28.585816321027096, -81.198904985359178]}, "89": {"ipoint": [85.044137870258865, -179.9505436437903], "type": "ParkingLot", "name": "Parking Garage B", "gpoint": [28.596894840943857, -81.199806207588182]}, "65": {"ipoint": [85.047340017243641, -179.96702921416727], "type": "Building", "name": "Lake Claire Community Office and Center", "gpoint": [28.604312839943301, -81.203234070709215]}, "66": {"ipoint": [85.047514148909002, -179.96639299497474], "type": "Building", "name": "Gemini Courtyard #66", "gpoint": [28.604684903561818, -81.203153604438768]}, "67": {"ipoint": [85.047577131198892, -179.96830487303669], "type": "Building", "name": "Gemini Courtyard #67", "gpoint": [28.604943934416998, -81.203427189758287]}, "68": {"ipoint": [85.047684569731771, -179.96768045530189], "type": "Building", "name": "Gemini Courtyard #68", "gpoint": [28.60520296463352, -81.203373545577989]}, "69": {"ipoint": [85.04771420753859, -179.96598744444782], "type": "Building", "name": "Gemini Courtyard #69", "gpoint": [28.605184126093896, -81.203062409332261]}, "7c": {"ipoint": [85.044831102607205, -179.94888353452552], "type": "Building", "name": "Office of Student Rights and Responsibilities", "gpoint": [28.598343158075441, -81.199824983051286]}, "8111": {"ipoint": [85.039571984392808, -179.937983037089], "type": "Building", "name": "Partnership I", "gpoint": [28.586025938212778, -81.197443181446062]}, "8125": {"ipoint": [85.04055895674405, -179.93489313230384], "type": "Building", "name": "Simulation, Training and Technology Center", "gpoint": [28.588567218938277, -81.197306388786302]}, "8114": {"ipoint": [85.04087504335412, -179.91135406598914], "type": "Building", "name": "Biomolecular Research Annex", "gpoint": [28.588727224575969, -81.192183494567871]}, "7b": {"ipoint": [85.044764378567265, -179.95006585173542], "type": "Building", "name": "SDES Information Technology", "gpoint": [28.59821834453934, -81.200079792907673]}, "b9": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B9", "gpoint": ""}, "2076": {"ipoint": [85.048444677243168, -179.94252026081085], "type": "DiningLocation", "name": "Subway, Knight's Plaza", "gpoint": [28.606889000254181, -81.198422187736497]}, "e1": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot E1", "gpoint": ""}, "2057": {"ipoint": [85.046485479468231, -179.95181679725647], "type": "DiningLocation", "name": "Balagan", "gpoint": [28.601983202921836, -81.200283765792847]}, "u4": {"ipoint": [85.042758532154551, -179.97208142332966], "type": "Building", "name": "Challenge Course", "gpoint": [28.593644885962547, -81.204671734741197]}, "u1": {"ipoint": [85.044393673135744, -179.94965601072181], "type": "Building", "name": "Parking & Transportation Services", "gpoint": [28.597233960891039, -81.199811572006212]}, "405": {"ipoint": [85.047892030663988, -179.97823762998451], "type": "Building", "name": "Pi Beta Phi - Sorority", "gpoint": [28.605834053760574, -81.20535301583098]}, "u3": {"ipoint": [85.042339463840804, -179.95102930173744], "type": "Building", "name": "RWC Park", "gpoint": [28.592627488098998, -81.200138801506029]}, "107": {"ipoint": [85.043140483993739, -179.93351984128822], "type": "Building", "name": "Nike 107", "gpoint": [28.594257204004077, -81.197145456245408]}, "college-of-medicine": {"ipoint": null, "type": "Location", "name": "College of Medicine", "gpoint": [28.367624023869666, -81.280564501358015]}, "8121": {"ipoint": [85.041375101661544, -179.93206071958411], "type": "Building", "name": "Orlando Tech Center - Bldg. 600", "gpoint": [28.590083950216538, -81.196533912590013]}, "6": {"ipoint": [85.045731789433745, -179.94873547606403], "type": "Building", "name": "Theatre", "gpoint": [28.600390402526742, -81.199768781661987]}, "classroom-building-ii": {"ipoint": [85.047388181932291, -179.9505615234375], "type": "Building", "name": "Classroom Building II", "gpoint": [28.604228860336786, -81.200069189071655]}, "504": {"ipoint": [85.043400046158922, -179.94759607419837], "type": "Building", "name": "Trailer 3", "gpoint": [28.59497864530492, -81.200063824653625]}, "8120": {"ipoint": [85.041219302524837, -179.92802667722572], "type": "Building", "name": "Orlando Tech Center - Bldg. 500", "gpoint": [28.589697703918631, -81.195841902664171]}, "503": {"ipoint": [85.043444541168739, -179.94553613767494], "type": "Building", "name": "Trailer 2", "gpoint": [28.595095602777725, -81.199747198989854]}, "pl": {"ipoint": null, "type": "Building", "name": "Knight's Circle", "gpoint": [28.610331631412482, -81.208469742706285]}, "546": {"ipoint": [85.047314082217738, -179.95952653989661], "type": "Building", "name": "Orange County School System", "gpoint": [28.604332856057646, -81.202032441070543]}, "630": {"ipoint": [85.042250453631567, -179.95626497373451], "type": "Building", "name": "Band Storage", "gpoint": [28.592401398347558, -81.20135115998076]}, "8102": {"ipoint": [85.039616513680983, -179.92957162961829], "type": "Building", "name": "Research Pavilion", "gpoint": [28.586626524464378, -81.195680970123277]}, "19": {"ipoint": [85.046135748162698, -179.96089983091224], "type": "Building", "name": "Rehearsal Hall", "gpoint": [28.601538805106124, -81.201962703636156]}, "parkinglot-43": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-42": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-41": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "parkinglot-40": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "142": {"ipoint": [85.048681043944683, -179.92603325896198], "type": "Building", "name": "Track & Soccer Field", "gpoint": [28.607680203172599, -81.195224994590745]}, "libra-community": {"ipoint": [85.044889133887722, -179.94059203189863], "type": "Group", "name": "Libra Community", "gpoint": [28.598459551738355, -81.198321604898439]}, "parkinglot-44": {"ipoint": null, "type": "ParkingLot", "name": null, "gpoint": null}, "downtown": {"ipoint": null, "type": "Location", "name": "Downtown", "gpoint": [28.541141, -81.379800000000003]}, "8": {"ipoint": [85.044920066599687, -179.95337033324176], "type": "Building", "name": "Volusia Hall", "gpoint": [28.598449131716031, -81.200728887489305]}, "91": {"ipoint": [85.046421093700175, -179.9444439416402], "type": "Building", "name": "Engineering II", "gpoint": [28.601981525254534, -81.198685044219957]}, "90": {"ipoint": [85.04701026182579, -179.9423604022013], "type": "Building", "name": "Health & Public Affairs II", "gpoint": [28.603158963380594, -81.198218339851365]}, "c1": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot C1", "gpoint": null}, "92": {"ipoint": [85.041901814963055, -179.90624928526813], "type": "Building", "name": "Biology Field Research Center", "gpoint": [28.591440511479448, -81.19112657921599]}, "95": {"ipoint": [85.046432210726948, -179.9620392327779], "type": "Building", "name": "Burnett Honors College", "gpoint": [28.602271970838743, -81.202391982078552]}, "94": {"ipoint": [85.045991216245582, -179.94426262404886], "type": "Building", "name": "Business Administration II", "gpoint": [28.600695747750798, -81.198631400039659]}, "97": {"ipoint": [85.047425231374845, -179.93641376146115], "type": "ParkingLot", "name": "Parking Garage D", "gpoint": [28.605372511338587, -81.197520965507493]}, "96": {"ipoint": [85.044634634812837, -179.96355307128397], "type": "Building", "name": "Duke Energy UCF Welcome Center", "gpoint": [28.597959297104797, -81.202670806816087]}, "11": {"ipoint": [85.044564201069946, -179.95660829648841], "type": "Building", "name": "Polk Hall", "gpoint": [28.597568369767373, -81.201383346488939]}, "10": {"ipoint": [85.044564201069946, -179.95420503721107], "type": "Building", "name": "Osceola Hall", "gpoint": [28.597644906860538, -81.200923347642885]}, "nike-community": {"ipoint": [85.043057117093582, -179.93281737207326], "type": "Group", "name": "Nike Community", "gpoint": [28.594365021175641, -81.197315776517854]}, "12": {"ipoint": [85.045461229894784, -179.95345616393024], "type": "Building", "name": "Mathematical Sciences Building", "gpoint": [28.599607769882496, -81.200739616325365]}, "13": {"ipoint": [85.045748837919987, -179.95143914275104], "type": "Building", "name": "Technology Commons I", "gpoint": [28.60035192912235, -81.200535768440233]}, "14": {"ipoint": [85.045646546237762, -179.96304559812415], "type": "Building", "name": "Howard Phillips Hall", "gpoint": [28.600145490030645, -81.202633380889893]}, "16": {"ipoint": [85.041797960419686, -179.93077325925697], "type": "Building", "name": "Facilities and Safety", "gpoint": [28.591530006215486, -81.196228140762315]}, "h10": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot H10", "gpoint": ""}, "18": {"ipoint": [85.046039394018649, -179.96493387327064], "type": "Building", "name": "Colbourn Hall", "gpoint": [28.601060759447115, -81.202939027717576]}, "50b": {"ipoint": [85.048503249081051, -179.93448758177692], "type": "Building", "name": "Knightro's", "gpoint": [28.607407050457596, -81.196780675819383]}, "b6": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B6", "gpoint": null}, "12423": {"ipoint": [85.040507015714738, -179.93557977781165], "type": "Building", "name": "IST Technology Development Center", "gpoint": null}, "409": {"ipoint": [85.047838684417755, -179.97143769316608], "type": "Building", "name": "Theta Chi - Fraternity", "gpoint": [28.605704539510096, -81.203963631561265]}, "32": {"ipoint": [85.044779206209142, -179.94115877256263], "type": "Building", "name": "Seminole Hall", "gpoint": [28.597940457266489, -81.198137873580919]}, "501": {"ipoint": [85.043570608199573, -179.94690942869056], "type": "Building", "name": "Trailer", "gpoint": [28.595265165934457, -81.19984912293242]}, "2080": {"ipoint": [85.046340262903072, -179.95110332965851], "type": "DiningLocation", "name": "Wackadoo's Grub & Brew", "gpoint": [28.6017411641661, -81.20033472776413]}, "e2": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot E2", "gpoint": null}, "b1": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B1", "gpoint": ""}, "7g": {"ipoint": [85.044758818190147, -179.94773876693216], "type": "Building", "name": "Ferrell Commons - G", "gpoint": [28.598025236512385, -81.199500435760484]}, "150": {"ipoint": [85.042131770872899, -179.92708253965247], "type": "Building", "name": "Public Safety Building (Police)", "gpoint": [28.592060378604483, -81.195930415561634]}, "7e": {"ipoint": [85.044657618284404, -179.94871187314857], "type": "Building", "name": "SRC Auditorium", "gpoint": [28.597640903498192, -81.199430698326097]}, "152": {"ipoint": [85.041905524013771, -179.90865254454548], "type": "Building", "name": "Ampac", "gpoint": [28.59136985768659, -81.191727394035325]}, "601": {"ipoint": [85.045565007898688, -179.94641804747516], "type": "Building", "name": "Bio Molecular Meeting Portable", "gpoint": [28.599904963108703, -81.199202710559803]}, "154": {"ipoint": [85.042294958935443, -179.89661264524329], "type": "Building", "name": "MMAE Facility", "gpoint": [28.591968764408453, -81.188430959156051]}, "157": {"ipoint": [85.04301143951686, -179.93961382017005], "type": "Building", "name": "Neptune 157", "gpoint": [28.593848216970112, -81.198309659957886]}, "156": {"ipoint": [85.042817866405045, -179.93551755003864], "type": "Building", "name": "Neptune 156", "gpoint": [28.593301838916997, -81.197279691696167]}, "158": {"ipoint": [85.043036655331306, -179.94253206357826], "type": "Building", "name": "Neptune 158", "gpoint": [28.593848216970112, -81.198760271072388]}, "b3": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B3", "gpoint": ""}, "parkinglot-59": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot - UCF Police", "gpoint": null}, "7h": {"ipoint": [85.044604978621749, -179.94452977232868], "type": "Building", "name": "All Knight Study", "gpoint": [28.597521269990004, -81.198931807449327]}, "small-business-development-center": {"ipoint": null, "type": "Building", "name": "Small Business Development Center", "gpoint": [28.556699999999999, -81.3399]}, "b7a": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B7a", "gpoint": null}, "408": {"ipoint": null, "type": "Building", "name": "UCF House", "gpoint": null}, "pond": {"ipoint": [85.045312971842009, -179.95969820127357], "type": "Building", "name": "Reflecting Pond", "gpoint": [28.599603059997129, -81.201957339218126]}, "lake-claire-recreational-area": {"ipoint": [85.048410645067378, -179.96768045530189], "type": "Building", "name": "Lake Claire Recreational Area", "gpoint": [28.606595659957893, -81.203386379820813]}, "b4": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B4", "gpoint": ""}, "t119": {"ipoint": [85.046528557249815, -179.97428941831458], "type": "Building", "name": "Performing Arts Center Theatre", "gpoint": [28.602622524091611, -81.204510802200275]}, "318": {"ipoint": [85.041879560600734, -179.96606110827997], "type": "Building", "name": "Recreation Service Pavilion", "gpoint": [28.591873853703348, -81.203765148094163]}, "2341": {"ipoint": [85.045758832995233, -179.95139267295599], "type": "DiningLocation", "name": "Bits & Bytes", "gpoint": [28.600397908850262, -81.200391054153442]}, "49": {"ipoint": [85.04225490422516, -179.9324898730265], "type": "Building", "name": "Emergency Operation Center", "gpoint": [28.592439080006574, -81.196651929786668]}, "63": {"ipoint": [85.047395591842914, -179.96991205320228], "type": "Building", "name": "Pegasus Courtyard #63", "gpoint": [28.604454130080214, -81.203877800872789]}, "hercules-community": {"ipoint": [85.043021382238237, -179.94461190937272], "type": "Group", "name": "Hercules Community", "gpoint": [28.594490280336331, -81.199690034410224]}, "44": {"ipoint": [85.042139188628326, -179.89755678281654], "type": "Building", "name": "Siemens Energy Center", "gpoint": [28.591775733448756, -81.188659071922302]}, "45": {"ipoint": [85.046056070831213, -179.94690191771952], "type": "Building", "name": "Business Administration I", "gpoint": [28.60101130632378, -81.199216121604906]}, "2348": {"ipoint": [85.046369908735031, -179.9507600069046], "type": "DiningLocation", "name": "Domino's Pizza", "gpoint": [28.601890920652639, -81.20020866394043]}, "40": {"ipoint": [85.046272864298473, -179.94246983580524], "type": "Building", "name": "Engineering I", "gpoint": [28.601406930658761, -81.198508018424974]}, "118": {"ipoint": [85.04371891825862, -179.93963742308551], "type": "Building", "name": "Leisure Pool Services", "gpoint": [28.595519509941049, -81.198239797523485]}, "1": {"ipoint": [85.045164709363902, -179.96132898435462], "type": "Building", "name": "Millican Hall", "gpoint": [28.598854185535444, -81.202466958930955]}, "b17": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B17", "gpoint": null}, "320": {"ipoint": [85.042670224790328, -179.96916398406029], "type": "Building", "name": "Recreation Services Field Restroom", "gpoint": [28.59352242192616, -81.204011911323533]}, "b15": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B15", "gpoint": null}, "5": {"ipoint": [85.045539063600984, -179.94950795226032], "type": "Building", "name": "Chemistry", "gpoint": [28.599881737473446, -81.199779510498047]}, "b13": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B13", "gpoint": ""}, "b10": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B10", "gpoint": null}, "b11": {"ipoint": "", "type": "ParkingLot", "name": "Parking Lot B11", "gpoint": ""}, "9": {"ipoint": [85.045040536133257, -179.95535624053446], "type": "Building", "name": "Lake Hall", "gpoint": [28.598722307719161, -81.201158040931688]}, "329": {"ipoint": [85.046673073529206, -179.92384457640583], "type": "Building", "name": "Timothy R. Newman Nature Pavilion", "gpoint": [28.602231143239326, -81.194007271697984]}, "b18": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B18", "gpoint": null}, "dgc": {"ipoint": [85.047469690340989, -179.93025827512611], "type": "Building", "name": "Disc Golf Course", "gpoint": [28.604807354591212, -81.195723885467515]}, "m119": {"ipoint": [85.046291393215654, -179.97420358762611], "type": "Building", "name": "Performing Arts Center Music", "gpoint": [28.601960802110412, -81.204467886856037]}, "140": {"ipoint": [85.047940189997689, -179.94465851836139], "type": "Building", "name": "Career Services and Experiential Learning", "gpoint": [28.605281144422136, -81.199092739990192]}, "141": {"ipoint": [85.04901068840384, -179.93121385399718], "type": "ParkingLot", "name": "Parking Garage F", "gpoint": [28.60883873955223, -81.196448081901536]}, "knights-pantry": {"ipoint": [85.044679118767519, -179.94744801573688], "type": "Building", "name": "Knight's Pantry", "gpoint": [28.597785028507232, -81.199614429643646]}, "8113": {"ipoint": [85.040625737270091, -179.92819833860267], "type": "Building", "name": "Orlando Tech Center", "gpoint": [28.588397645121244, -81.195707792213426]}, "socpracfld": {"ipoint": [85.049618065800658, -179.91890931181842], "type": "Building", "name": "Soccer Practice Field", "gpoint": [28.610082032673144, -81.193658584526048]}, "77": {"ipoint": [85.048314335060496, -179.9215035449015], "type": "Building", "name": "Wayne Densch Sports Center", "gpoint": [28.606163725677742, -81.194259399345384]}, "76": {"ipoint": [85.042090973020066, -179.89715123228962], "type": "Building", "name": "Engine Research Lab", "gpoint": [28.591677907990494, -81.188669675758348]}, "75": {"ipoint": [85.046973517983574, -179.96396613016259], "type": "Building", "name": "Nicholson School of Communication", "gpoint": [28.603748472066311, -81.202762126922607]}, "74": {"ipoint": [85.042082071648466, -179.90457558684284], "type": "Building", "name": "Robinson Observatory", "gpoint": [28.591727836414421, -81.19062768833922]}, "73": {"ipoint": [85.044623513761934, -179.94199776701862], "type": "Building", "name": "Housing Administration", "gpoint": [28.597601339598974, -81.198438280990587]}, "71": {"ipoint": [85.043455664858953, -179.96251130156452], "type": "Building", "name": "Barbara Ying Center", "gpoint": [28.59538371249953, -81.202751398086548]}, "70": {"ipoint": [85.04761047444066, -179.96476221189369], "type": "Building", "name": "Gemini Courtyard #70", "gpoint": [28.604981611579067, -81.202917570045457]}, "12601": {"ipoint": [85.041360263858905, -179.91221451811725], "type": "Building", "name": "IN VIVO Research", "gpoint": [28.590036847229229, -81.192392581871019]}, "321": {"ipoint": [85.04272515632735, -179.97042703733314], "type": "Building", "name": "Recreation Services Field Maintenance", "gpoint": [28.593805030738011, -81.204398149421678]}, "79": {"ipoint": [85.047136238390763, -179.9530034075724], "type": "Building", "name": "Classroom Building I", "gpoint": [28.603490527691029, -81.200420433452592]}, "78": {"ipoint": [85.045750320369706, -179.97430085961241], "type": "ParkingLot", "name": "Parking Garage I", "gpoint": [28.601134467682712, -81.205452257564559]}, "99": {"ipoint": [85.047558607078926, -179.94811105832923], "type": "Building", "name": "Psychology Building", "gpoint": [28.6045860007032, -81.199457520416246]}, "basefield": {"ipoint": [85.049521779220029, -179.92811250791419], "type": "Building", "name": "Baseball Field", "gpoint": [28.609808885628485, -81.195450300147968]}, "2083": {"ipoint": [85.048355776374223, -179.94320690631866], "type": "DiningLocation", "name": "Kyoto Sushi & Grill", "gpoint": [28.606889000254181, -81.198422187736497]}, "8110": {"ipoint": [85.041137691504517, -179.91884279355872], "type": "Building", "name": "University Tech Center", "gpoint": [28.589349139112016, -81.193894618919359]}, "7ab": {"ipoint": [85.044734723150697, -179.95077180967201], "type": "Building", "name": "Live Oak Ballroom/Garden Room", "gpoint": [28.597888647693647, -81.200428480079637]}, "7aa": {"ipoint": [85.044678377382837, -179.94829666640726], "type": "Building", "name": "Marketplace Dining Hall", "gpoint": [28.597898067617891, -81.199677461555467]}, "b7": {"ipoint": null, "type": "ParkingLot", "name": "Parking Lot B7", "gpoint": null}, "351": {"ipoint": [85.050129094073327, -179.90998292021686], "type": "Building", "name": "Fire Station #62", "gpoint": [28.611537232066219, -81.191528910568223]}, "350": {"ipoint": [85.050173528827486, -179.90622568235267], "type": "Building", "name": "Emergency Services Training Building", "gpoint": [28.611651050928735, -81.190756559371948]}, "footpracfld": {"ipoint": [85.048203205807582, -179.91549539670814], "type": "Building", "name": "Football Practice Field", "gpoint": [28.606465139096741, -81.192961210182176]}, "c2": {"ipoint": "", "type": "ParkingLot", "name": "Partking Lot C2", "gpoint": ""}, "125": {"ipoint": [85.047803119897466, -179.90253496274818], "type": "Building", "name": "Softball Stadium", "gpoint": [28.604850536014702, -81.190348863601685]}},
      "shuttle_routes"      : {"routes": [{"color": "#000000", "category": "On-Campus", "shortname": "Black", "id": "186", "description": "Outbound"}, {"color": "#000000", "category": "Other", "shortname": "College Of Med", "id": "185", "description": "College of Medicine/Physical\nSciences"}, {"color": "#000000", "category": "On-Campus", "shortname": "Gold", "id": "187", "description": "Outbound"}, {"color": "#000000", "category": "Other", "shortname": "Park And Ride Spring", "id": "236", "description": "Outbound"}, {"color": "#000000", "category": "Other", "shortname": "Rosen College", "id": "188", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 01", "id": "189", "description": "Knights Circle/Student Union"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 02", "id": "190", "description": "College Station/Boardwalk/Millican Hall"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 03", "id": "191", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 04", "id": "197", "description": "Outbound"}, {"color": "#000000", "category": "Other", "shortname": "Route 04-A The Pointe", "id": "235", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 05", "id": "201", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 06", "id": "194", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 07", "id": "193", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 08", "id": "195", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 09", "id": "200", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 10", "id": "199", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 11", "id": "198", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 12", "id": "196", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 13", "id": "192", "description": "Outbound"}, {"color": "#000000", "category": "Off-Campus", "shortname": "Route 14", "id": "209", "description": "Outbound"}, {"color": "#000000", "category": "Other", "shortname": "Tuesday Grocery Shuttle", "id": "212", "description": "Outbound"}]},
      "shuttle_stops"       : [{"lat": "28.59412027", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}, {"shortname": "Tuesday Grocery Shuttle", "id": "212"}], "lon": "-81.19688131", "id": "533", "name": "Academic Village 1/Nike Community"}, {"lat": "28.58335514", "routes": [{"shortname": "Route 04", "id": "197"}], "lon": "-81.21485424", "id": "564", "name": "Alafaya Club Apt"}, {"lat": "28.60623611", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}], "lon": "-81.19791947", "id": "531", "name": "Arena/Tower Apartments"}, {"lat": "28.5886", "routes": [{"shortname": "Route 09", "id": "200"}, {"shortname": "College Of Med", "id": "185"}], "lon": "-81.1917", "id": "621", "name": "Biomolecular Research Annex"}, {"lat": "28.5862175077438", "routes": [{"shortname": "Route 02", "id": "190"}], "lon": "-81.2064850330353", "id": "546", "name": "Boardwalk Apt Stop 1"}, {"lat": "28.6021", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}], "lon": "-81.2029", "id": "629", "name": "Burnett Honors College"}, {"lat": "28.602429747877", "routes": [{"shortname": "Park And Ride Spring", "id": "236"}], "lon": "-81.1964133381844", "id": "874", "name": "C1"}, {"lat": "28.5827717313076", "routes": [{"shortname": "Route 04", "id": "197"}, {"shortname": "Route 12", "id": "196"}], "lon": "-81.2097170948982", "id": "565", "name": "Campus Crossing Apt"}, {"lat": "28.60300452", "routes": [{"shortname": "Route 08", "id": "195"}, {"shortname": "Route 06", "id": "194"}, {"shortname": "Route 13", "id": "192"}, {"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}], "lon": "-81.19722062", "id": "532", "name": "CoHPA/Engineering"}, {"lat": "28.5792457584353", "routes": [{"shortname": "Route 02", "id": "190"}], "lon": "-81.2072387337685", "id": "545", "name": "College Station Apt Stop 1"}, {"lat": "28.5967048801164", "routes": [{"shortname": "Route 07", "id": "193"}], "lon": "-81.2142835557461", "id": "554", "name": "Collegiate Village Inn"}, {"lat": "28.5991399298572", "routes": [{"shortname": "Route 05", "id": "201"}, {"shortname": "Route 09", "id": "200"}], "lon": "-81.1980870366097", "id": "573", "name": "Health Center"}, {"lat": "28.3677522598369", "routes": [{"shortname": "College Of Med", "id": "185"}], "lon": "-81.280275285244", "id": "526", "name": "Health Sciences Laureate"}, {"lat": "28.3675351286692", "routes": [{"shortname": "College Of Med", "id": "185"}], "lon": "-81.2791085243225", "id": "527", "name": "Health Sciences Sanger"}, {"lat": "28.5898749004098", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.199319511652", "id": "623", "name": "Human Resources"}, {"lat": "28.6062", "routes": [{"shortname": "Tuesday Grocery Shuttle", "id": "212"}], "lon": "-81.1979", "id": "634", "name": "Knight's Plaza"}, {"lat": "28.60878494", "routes": [{"shortname": "Route 01", "id": "189"}], "lon": "-81.21021679", "id": "539", "name": "Knights Cir Apt Stop 1"}, {"lat": "28.61005531", "routes": [{"shortname": "Route 01", "id": "189"}], "lon": "-81.20917962", "id": "540", "name": "Knights Cir Apt Stop 2"}, {"lat": "28.61174982", "routes": [{"shortname": "Route 01", "id": "189"}], "lon": "-81.2095724", "id": "541", "name": "Knights Cir Apt Stop 3"}, {"lat": "28.61135199", "routes": [{"shortname": "Route 01", "id": "189"}], "lon": "-81.2115846", "id": "542", "name": "Knights Cir Apt Stop 4"}, {"lat": "28.60962538", "routes": [{"shortname": "Route 01", "id": "189"}], "lon": "-81.21298748", "id": "543", "name": "Knights Cir Apt Stop 5"}, {"lat": "28.60983574", "routes": [{"shortname": "Route 01", "id": "189"}], "lon": "-81.21435968", "id": "544", "name": "Knights Cir Apt Stop 6"}, {"lat": "28.5825100549361", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.204724162817", "id": "614", "name": "Knights Landing - Ash Street"}, {"lat": "28.5824250276304", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.2049373984337", "id": "615", "name": "Knights Landing - Winter Pine St"}, {"lat": "28.60435216", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}, {"shortname": "Tuesday Grocery Shuttle", "id": "212"}], "lon": "-81.20503929", "id": "530", "name": "Lake Claire Apts"}, {"lat": "28.5908051847743", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1930485069752", "id": "622", "name": "Libra Drive"}, {"lat": "28.6052932422096", "routes": [{"shortname": "Park And Ride Spring", "id": "236"}], "lon": "-81.1911374330521", "id": "879", "name": "Lot E4"}, {"lat": "28.59741303", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}, {"shortname": "Tuesday Grocery Shuttle", "id": "212"}], "lon": "-81.19932965", "id": "534", "name": "Market Place/Student Resource Center"}, {"lat": "28.5987984610994", "routes": [{"shortname": "Route 04", "id": "197"}, {"shortname": "Route 12", "id": "196"}, {"shortname": "Route 02", "id": "190"}], "lon": "-81.2024939060211", "id": "547", "name": "Millican Hall"}, {"lat": "28.61277093", "routes": [{"shortname": "Route 13", "id": "192"}], "lon": "-81.19096348", "id": "552", "name": "NorthView Apt"}, {"lat": "28.61457745", "routes": [{"shortname": "Route 06", "id": "194"}], "lon": "-81.19542282", "id": "556", "name": "Northgate Apt Stop 1"}, {"lat": "28.61361001", "routes": [{"shortname": "Route 06", "id": "194"}], "lon": "-81.19618461", "id": "557", "name": "Northgate Apt Stop 2"}, {"lat": "28.61225567", "routes": [{"shortname": "Route 06", "id": "194"}], "lon": "-81.19622887", "id": "558", "name": "Northgate Apt Stop 3"}, {"lat": "28.5704880212071", "routes": [{"shortname": "Route 10", "id": "199"}], "lon": "-81.1999645829201", "id": "570", "name": "Orion on Orpinington Apt"}, {"lat": "28.589239005095", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1941455304623", "id": "620", "name": "Orlando Tech Center (Florida Inst of Govnt)"}, {"lat": "28.5879311682649", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1955577135086", "id": "619", "name": "Orlando Tech Center (University Marketing)"}, {"lat": "28.5859716200674", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1963731050491", "id": "617", "name": "Partnership 1"}, {"lat": "28.5857078319442", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1994737386704", "id": "616", "name": "Partnership 2 & 3"}, {"lat": "28.5984593462004", "routes": [{"shortname": "Route 07", "id": "193"}], "lon": "-81.2163850665092", "id": "555", "name": "Pegasus Health"}, {"lat": "28.5999803307017", "routes": [{"shortname": "College Of Med", "id": "185"}], "lon": "-81.1976793408394", "id": "627", "name": "Physical Sciences 2"}, {"lat": "28.59943436", "routes": [{"shortname": "College Of Med", "id": "185"}], "lon": "-81.1982831", "id": "524", "name": "Physical Sciences Bldg"}, {"lat": "28.5999803307017", "routes": [{"shortname": "Route 14", "id": "209"}], "lon": "-81.208329", "id": "875", "name": "Plaza On University 1"}, {"lat": "28.5996038545988", "routes": [{"shortname": "Route 14", "id": "209"}], "lon": "-81.2103742361069", "id": "876", "name": "Plaza on University 2"}, {"lat": "28.61313", "routes": [{"shortname": "Tuesday Grocery Shuttle", "id": "212"}], "lon": "-81.2063", "id": "633", "name": "Publix Supermarket"}, {"lat": "28.5865180362174", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1958366632462", "id": "618", "name": "Research Pavilion"}, {"lat": "28.62408775", "routes": [{"shortname": "Route 08", "id": "195"}], "lon": "-81.20636889", "id": "562", "name": "Riverwind of Alafaya Apt"}, {"lat": "28.4288169096226", "routes": [{"shortname": "Rosen College", "id": "188"}], "lon": "-81.4424014091492", "id": "537", "name": "Rosen College"}, {"lat": "28.59371554", "routes": [{"shortname": "Route 11", "id": "198"}], "lon": "-81.20944499", "id": "567", "name": "Sterling University Central"}, {"lat": "28.6028934225937", "routes": [{"shortname": "Rosen College", "id": "188"}, {"shortname": "Route 01", "id": "189"}], "lon": "-81.2010441720486", "id": "538", "name": "Student Union"}, {"lat": "28.59893277", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}], "lon": "-81.20364121", "id": "536", "name": "Teaching Academy/Welcome Center"}, {"lat": "28.58846198", "routes": [{"shortname": "Route 03", "id": "191"}], "lon": "-81.20958074", "id": "548", "name": "The Edge Stop 1"}, {"lat": "28.5873574390013", "routes": [{"shortname": "Route 03", "id": "191"}], "lon": "-81.2090438604355", "id": "878", "name": "The Edge Stop 2"}, {"lat": "28.571745901353", "routes": [{"shortname": "Route 10", "id": "199"}], "lon": "-81.2036311626434", "id": "568", "name": "The Lofts Apt Stop 1"}, {"lat": "28.5700757912958", "routes": [{"shortname": "Route 10", "id": "199"}], "lon": "-81.2054792046547", "id": "569", "name": "The Lofts Apt Stop 2"}, {"lat": "28.58854601", "routes": [{"shortname": "Route 03", "id": "191"}], "lon": "-81.21264413", "id": "549", "name": "The Place Stop 1"}, {"lat": "28.58778863", "routes": [{"shortname": "Route 03", "id": "191"}], "lon": "-81.21428339", "id": "550", "name": "The Place Stop 2"}, {"lat": "28.5790479047514", "routes": [{"shortname": "Route 04-A The Pointe", "id": "235"}, {"shortname": "Route 04", "id": "197"}], "lon": "-81.208598613739", "id": "566", "name": "The Pointe at Central"}, {"lat": "28.61408368", "routes": [{"shortname": "Route 06", "id": "194"}], "lon": "-81.20294798", "id": "559", "name": "Tivoli Apt Stop 1"}, {"lat": "28.61284613", "routes": [{"shortname": "Route 06", "id": "194"}], "lon": "-81.20302137", "id": "560", "name": "Tivoli Apt Stop 2"}, {"lat": "28.61277307", "routes": [{"shortname": "Route 06", "id": "194"}], "lon": "-81.20144146", "id": "561", "name": "Tivoli Apt Stop 3"}, {"lat": "28.60065603", "routes": [{"shortname": "Route 10", "id": "199"}, {"shortname": "Route 11", "id": "198"}, {"shortname": "Route 03", "id": "191"}, {"shortname": "Route 07", "id": "193"}, {"shortname": "Route 14", "id": "209"}, {"shortname": "Black", "id": "186"}], "lon": "-81.20476954", "id": "528", "name": "Transit Center"}, {"lat": "28.58495918", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "-81.2086078", "id": "563", "name": "University House Apt Stop 1"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "887", "name": "University House Apt Stop 10"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "888", "name": "University House Apt Stop 11"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "889", "name": "University House Apt Stop 12"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "890", "name": "University House Apt Stop 13"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "891", "name": "University House Apt Stop 14"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "892", "name": "University House Apt Stop 15"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "893", "name": "University House Apt Stop 16"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "894", "name": "University House Apt Stop 17"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "895", "name": "University House Apt Stop 18"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "896", "name": "University House Apt Stop 19"}, {"lat": "28.58670122", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "-81.20848327", "id": "578", "name": "University House Apt Stop 2"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "897", "name": "University House Apt Stop 20"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "898", "name": "University House Apt Stop 21"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "899", "name": "University House Apt Stop 22"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "900", "name": "University House Apt Stop 23"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "901", "name": "University House Apt Stop 24"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "902", "name": "University House Apt Stop 25"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "903", "name": "University House Apt Stop 26"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "904", "name": "University House Apt Stop 27"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "905", "name": "University House Apt Stop 28"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "906", "name": "University House Apt Stop 29"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "880", "name": "University House Apt Stop 3"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "907", "name": "University House Apt Stop 30"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "908", "name": "University House Apt Stop 31"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "909", "name": "University House Apt Stop 32"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "910", "name": "University House Apt Stop 33"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "911", "name": "University House Apt Stop 34"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "912", "name": "University House Apt Stop 35"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "913", "name": "University House Apt Stop 36"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "914", "name": "University House Apt Stop 37"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "915", "name": "University House Apt Stop 38"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "916", "name": "University House Apt Stop 39"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "881", "name": "University House Apt Stop 4"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "917", "name": "University House Apt Stop 40"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "918", "name": "University House Apt Stop 41"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "919", "name": "University House Apt Stop 42"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "920", "name": "University House Apt Stop 43"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "921", "name": "University House Apt Stop 44"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "922", "name": "University House Apt Stop 45"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "923", "name": "University House Apt Stop 46"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "924", "name": "University House Apt Stop 47"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "925", "name": "University House Apt Stop 48"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "926", "name": "University House Apt Stop 49"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "882", "name": "University House Apt Stop 5"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "927", "name": "University House Apt Stop 50"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "928", "name": "University House Apt Stop 51"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "929", "name": "University House Apt Stop 52"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "883", "name": "University House Apt Stop 6"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "884", "name": "University House Apt Stop 7"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "885", "name": "University House Apt Stop 8"}, {"lat": "0", "routes": [{"shortname": "Route 12", "id": "196"}], "lon": "0", "id": "886", "name": "University House Apt Stop 9"}, {"lat": "28.5876293955714", "routes": [{"shortname": "Route 09", "id": "200"}], "lon": "-81.1991693079472", "id": "624", "name": "University Tower"}, {"lat": "28.5815749864852", "routes": [{"shortname": "Route 05", "id": "201"}], "lon": "-81.202200204134", "id": "574", "name": "Village at Science Dr"}, {"lat": "28.59820008", "routes": [{"shortname": "Black", "id": "186"}, {"shortname": "Gold", "id": "187"}], "lon": "-81.20205836", "id": "535", "name": "Welcome Center/Millican Hall"}],
	});