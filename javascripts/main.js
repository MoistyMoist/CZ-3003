$(function () {
	
	$.google = {
		api_key : "AIzaSyAfx3vltb6DmiG9O72T1dni1KweHxVQbNc",
		maps : {
			callback : "$.google.maps.init",
			map : {},
			geocoder : {},
			markers : [],
			load_library : function() {
				var googleMaps = $("<script>", {
					type : "text/javascript",
					src : "https://maps.googleapis.com/maps/api/js?key=" + $.google.api_key + "&libraries=geometry&region=SG&callback=" + $.google.maps.callback
				}).prop("defer", true).prop("async", true);
				
				$("body").append(googleMaps);
			}, // end $.google.maps.load_library
			init : function() {
				$.google.maps.map = new google.maps.Map(document.getElementById("map"), {
					streetViewControl: false,
					fullscreenControl: false,
					center: {lat: 1.34284, lng: 103.8190145},
					zoom: 11
				});
				$.google.maps.geocoder = new google.maps.Geocoder();
				$.page.update();
			}, // end $.google.maps.init
			marker : {
				icons : {
					Terrorist : {
						icon : function() {
							return {
								url : "../images/terrorist.svg",
								origin : new google.maps.Point(0, 0),
								anchor : new google.maps.Point(12, 12)	
							}
						},
						color : "#FF0000",
						stroke : "#666666"
					}, // end $.google.maps.marker.icons.Terrorist
					Flooding : {
						icon : function() {
							return {
								url : "../images/flooding.svg",
								origin : new google.maps.Point(0, 0),
								anchor : new google.maps.Point(12, 12)
							}
						},
						color : "#006DF0",
						stroke : "#666666"
					}, // end $.google.maps.marker.icons.Flooding
					Others : {
						icon : function() {
							return {
								url : "../images/others.svg",
								origin : new google.maps.Point(0, 0),
								anchor : new google.maps.Point(12, 12)
							}
						},
						color : "#DDDDDD",
						stroke : "#666666"
					} // end $.google.maps.marker.icons.Others
				}, // end $.google.maps.marker.icons
				/**
				*	Adds a marker with radius(meters) on Basemap
				*/
				add : function(incident_id, lat, lng, radius, title, type, activatedDateTime) {
					var marker = new google.maps.Marker({
						position : {lat:lat, lng:lng},
						map : $.google.maps.map,
						animation: google.maps.Animation.DROP,
						title : title,
						icon : $.google.maps.marker.icons[type].icon()
					});
					
					if (radius > 0) {
						marker.circle = new google.maps.Circle({
							strokeColor: $.google.maps.marker.icons[type].stroke,
							strokeOpacity: 0.8,
							strokeWeight: 2,
							fillColor: $.google.maps.marker.icons[type].color,
							fillOpacity: 0.35,
							map: $.google.maps.map,
							center: {lat:lat, lng:lng},
							radius: radius
						});
					}
					
					marker.infowindow = {
						incident : $.google.maps.infowindow.incident(incident_id, type, title),
						resource : $.google.maps.infowindow.resource(incident_id, type, title),
						social_media : $.google.maps.infowindow.social_media(incident_id, type, title)
					};
					
					marker.addListener('click', function() {
						$.page.scrollTo("#map");
						
						$.google.maps.markers.forEach(function(marker, index) {
							marker.infowindow.resource.close();
							marker.infowindow.social_media.close();
							marker.infowindow.incident.close();
						});
						
						
						if($('#resource_view').is(":visible")){
							marker.infowindow.resource.open($.google.maps.map, marker);
						} else if($('#media_view').is(":visible")){
							marker.infowindow.social_media.open($.google.maps.map, marker);
						} else if($("#incident_view").is(":visible")) {
							marker.infowindow.incident.open($.google.maps.map, marker);
						}
					});
					
					marker.circle.addListener('click', function() {
						google.maps.event.trigger(marker, 'click');
					});
					
					google.maps.event.addListener(marker.infowindow.incident, 'domready', function() {
						$(".infowindow .incident-view-log").click(function(e) {
							var incident_id = $(this).attr("data-id");
                            $("#incident-table tr[data-id=" + incident_id + "]").click();
							$.page.scrollTo("#incident_view");
                        });
						
						$(".infowindow .incident-close").click(function(e) {
                            var incident_id = $(this).attr("data-id");
                            $("#incident-table tr[data-id=" + incident_id + "] span.label").click();
                        });
					});
					
					google.maps.event.addListener(marker.infowindow.resource, 'domready', function() {
						$(".infowindow .panel-stat3").click(function(e) {
							var id = $(this).attr("data-id");
							$("#resource-selector .panel-stat3[data-id=" + id + "]").click();
							$.page.scrollTo("#resource_view");
							
							var incident_id = $(this).parent(".infowindow.body").attr("data-incident-id");
							var selected_val = $("#resource-incidents option[data-id=" + incident_id + "]").val();
							$("#resource-incidents").val(selected_val);
                        });
					});
					
					google.maps.event.addListener(marker.infowindow.social_media, 'domready', function() {
						$(".infowindow .social-media-view-log").click(function(e) {
							//console.log("test");
							var incident_id = $(this).attr("data-id");
                            $(".timeline_main .entry[data-id=" + incident_id + "]").click();
							$.page.scrollTo("#media_view");
                        });
					});
					
					$.google.maps.markers.push(marker);
				}, // end $.google.maps.marker.add
				clear_all : function() {
					$.google.maps.markers.forEach(function(marker, index) {
						marker.setMap(null);
						if(marker.circle !== undefined) {
							marker.circle.setMap(null);	
						}
					});
					$.google.maps.markers = [];
				} // end $.google.maps.marker.clear_all
			}, // end $.google.maps.marker
			infowindow : {
				incident : function(incident_id, type, description) {
					var content = $("<div>", {
						class : "infowindow content"	
					});
					
					var content_heading = $("<div>", {
						class : "infowindow heading text-center"
					}).appendTo(content);
					
					var type = $("<b>").append($("<u>").text(type)).appendTo(content_heading);
					var title = $("<h4>").text(description).appendTo(content_heading);
					
					var content_body = $("<div>", {
						class : "infowindow body"	
					}).appendTo(content);
					
					var btn1 = $("<button>", {
						class : "btn btn-success incident-view-log",
						type : "button",
						"data-id" : incident_id
					}).appendTo(content_body);
					
					$("<i>", {
						class : "fa fa-comment"
					}).appendTo(btn1);
					
					$("<span>").text(" View Logs").appendTo(btn1);
					
					var role = $.page.get_cookie("groups");
					if (role === "HQ_Commander") {
						var btn2 = $("<button>", {
							class : "btn btn-danger incident-close pull-right",
							type : "button",
							"data-id" : incident_id
						}).appendTo(content_body);
						
						$("<i>", {
							class : "fa fa-exclamation-triangle"
						}).appendTo(btn2);
						
						$("<span>").text(" Close Incident").appendTo(btn2);
					}
					
					return new google.maps.InfoWindow({
						content: content.html()
					});
				}, // end $.google.maps.infowindow.incident
				resource : function(incident_id, type, description) {
					var content = $("<div>", {
						class : "infowindow content"	
					});
					
					var content_heading = $("<div>", {
						class : "infowindow heading text-center"
					}).appendTo(content);
					
					var type = $("<b>").append($("<u>").text(type)).appendTo(content_heading);
					var title = $("<h4>").text(description).appendTo(content_heading);

					var content_body = $("<div>", {
						class : "infowindow body",
						"data-incident-id" : incident_id
					});
					
					content_body.appendTo(content);
					
					console.log($("#resource-selector").children());
					$("#resource-selector").children().each(function(index, element) {
						var element_html = $(element).html();
						//console.log(element_html);
						content_body.append($(element_html));
						
                    });
					
					return new google.maps.InfoWindow({
						content: content.html()
					});
				}, // end $.google.maps.infowindow.resource
				social_media : function(incident_id, type, description) {
					var content = $("<div>", {
						class : "infowindow content"	
					});
					
					var content_heading = $("<div>", {
						class : "infowindow heading text-center"
					}).appendTo(content);
					
					var type = $("<b>").append($("<u>").text(type)).appendTo(content_heading);
					var title = $("<h4>").text(description).appendTo(content_heading);
					
					var content_body = $("<div>", {
						class : "infowindow body"	
					}).appendTo(content);
					
					var btn1 = $("<button>", {
						class : "btn btn-success social-media-view-log",
						type : "button",
						"data-id" : incident_id
					}).appendTo(content_body);
					
					$("<i>", {
						class : "fa fa-comment"
					}).appendTo(btn1);
					
					$("<span>").text(" View Logs").appendTo(btn1);
					
					return new google.maps.InfoWindow({
						content: content.html()
					});
				} // end $.google.maps.infowindow.social_media
			}, // end $.google.maps.infowindow
			geocode_address : function(address) {
				var promise = new Promise(function(resolve, reject) {
					$.google.maps.geocoder.geocode({
						address : address + ", Singapore",
						region : "SG"
					}, function(results, status) {
						if (status == 'OK') {
							//console.log('Geocoded Result: ', results[0].geometry.location);
							resolve(results);
						} else {
							console.log('Geocode was not successful for the following reason: ^', status);
							reject(status);
						}
					});
				});
				return promise;
			}, // end $.google.maps.geocode_address
			geocode_latlng : function(location) {
				var promise = new Promise(function(resolve, reject) {
					$.google.maps.geocoder.geocode({
						location : location,
						region : "SG"
					}, function(results, status) {
						if (status == 'OK') {
							//console.log('Geocoded Result: ', results);
							resolve(results);
						} else {
							console.log('Geocode was not successful for the following reason: ^', status);
							reject(status);
						}
					});
				});
				return promise;
			} // end $.google.maps.geocode_latlng
		}, // end $.google.maps
		firebase : {
			config : {
				apiKey: "AIzaSyAfx3vltb6DmiG9O72T1dni1KweHxVQbNc",
				serverKey: "AIzaSyDGkaf5JEu3LZmc5_ObZP-7XGqzEhB0vTA",
				databaseURL: "https://cz3003-cms.firebaseio.com",
				messagingSenderId: "455786633696"
			}, // end $.google.firebase.config
			messaging : { /* Firebase Messaging Object */ },
			database : { /* Firebase DB Object */ },
			init : function() {
				firebase.initializeApp($.google.firebase.config);
				
				if ('serviceWorker' in navigator) {
					console.log('Service Worker is supported');
					navigator.serviceWorker.register("../javascripts/firebase-messaging-sw.js").then(function(registration) {
						console.log('Service Worker is ready : ^) ', registration);
						
						$.google.firebase.messaging = firebase.messaging();
						$.google.firebase.messaging.useServiceWorker(registration);
						$.google.firebase.token.onrefresh();
						$.google.firebase.receive_message();
						$.google.firebase.token.get();
					}).catch(function(error) {
						console.log('Service Worker error :^(', error);
					});
				}
				
				$.google.firebase.database = firebase.database();
				$.google.firebase.token.db_ref = $.google.firebase.database.ref("push_registrations");
				$.google.firebase.token.db_ref.on('value', function(snapshot) {
					var i = 0;
					$.google.firebase.token.registration_ids = [];
					
					snapshot.forEach(function(row) {
						$.google.firebase.token.registration_ids[i] = row.getKey();
						i++;
					});
				});
				
			}, // end $.google.firebase.init
			token : {
				db_ref : { /* push_registrations firebase database reference */ },
				registration_ids : [ /* list of ids for push messaging */ ],
				onrefresh : function() {
					$.google.firebase.messaging.onTokenRefresh(function() {
						$.google.firebase.messaging.getToken().then(function(refreshedToken) {
							console.log('Token refreshed.');
							// Indicate that the new Instance ID token has not yet been sent to the app server.
							$.google.firebase.token.to_server.is_sent(false);
							// Send Instance ID token to app server.
							$.google.firebase.token.to_server.send(refreshedToken);
						}).catch(function(err) {
							console.log('Unable to retrieve refreshed token ', err);
						});
					});
				}, // end $.google.firebase.token.refresh
				/**
				*	Get Instance ID token. Initially this makes a network call, once retrieved
				*	subsequent calls to getToken will return from cache.
				*/
				get : function() {
					$.google.firebase.messaging.getToken().then(function(currentToken) {
						if (currentToken) {
							console.log(currentToken);
							$.google.firebase.token.to_server.send(currentToken);
							//updateUIForPushEnabled(currentToken);
						} else {
							// Show permission request.
							console.log('No Instance ID token available. Request permission to generate one.');
							// Show permission UI.
							$.google.firebase.request_permission();
							//updateUIForPushPermissionRequired();
							$.google.firebase.token.to_server.is_sent(false);
						}
					}).catch(function(err) {
						console.log('An error occurred while retrieving token. ', err);
						//showToken('Error retrieving Instance ID token. ', err);
						$.google.firebase.token.to_server.is_sent(false);
					});
				}, // end $.google.firebase.token.get
				to_server : {
					send : function(currentToken) {
						if (!$.google.firebase.token.to_server.is_sent()) {
							console.log('Sending token to server...');
							
							var ref = $.google.firebase.database.ref("push_registrations/" + currentToken);
							ref.set({
								groups : $.page.get_cookie("groups"),
								datetime : new Date().getTime()
							}).then(function() {
								console.log('Token has been sent...');
								$.google.firebase.token.to_server.is_sent(true)
							});
						} else {
							console.log('Token already sent to server so won\'t send it again unless it changes');	
						}
					}, // end $.google.firebase.token.to_server.send
					is_sent : function(sent) {
						if (sent === undefined) {
							var cookie_val = Cookies.get("sentToServer");
							return cookie_val === "true" ? true : false;
							return false;
						} else {
							Cookies.set("sentToServer", sent);
							return sent;
						}
					} // end $.google.firebase.token.to_server.is_sent
				} // end $.google.firebase.token.to_server
			}, // end $.google.firebase.token
			/**
			*	Handle incoming messages. Called when:
			*	- a message is received while the app has focus
			*	- the user clicks on an app notification created by a sevice worker
			*	`messaging.setBackgroundMessageHandler` handler.
			*/
			receive_message : function() {
				$.google.firebase.messaging.onMessage(function(payload) {
					console.log("Message received. ", payload);
					
					var incident = payload.data.incident;
					if (incident !== undefined && incident) {
						$.page.update();
					}
					
					var incident_logs = payload.data.incident_logs;
					if (incident_logs !== undefined && inident_logs) {
						$.page.incident.logs.refresh_list();
						$.page.social_media.timeline.logs.update();
					}
					
					var cms_status = payload.data.cms_status;
					if (cms_status !== undefined) {
						$('aside').removeClass(Cookies.get('skin_color'));
        				$('#top-nav').removeClass(Cookies.get('skin_color'));
						
						if (cms_status === 'true') {
							Cookies.set("skin_color", "skin-2");
						} else if (cms_status === 'false') {
							Cookies.set("skin_color", "skin-1");
						}
						
						$('aside').addClass(Cookies.get('skin_color'));
        				$('#top-nav').addClass(Cookies.get('skin_color'));
					}
				});
			}, // end $.google.firebase.receive_message
			/**
			*	Callback fired if Instance ID token is updated.
			*/
			request_permission : function() {
				console.log('Requesting permission...');
				$.google.firebase.messaging.requestPermission().then(function() {
					console.log('Notification permission granted.');
					// TODO(developer): Retrieve a Instance ID token for use with FCM.
      				// [START_EXCLUDE]
      				// In many cases once an app has been granted notification permission, it
      				// should update its UI reflecting this.
					$.google.firebase.token.get();
					// [END_EXCLUDE]
				}).catch(function(err) {
					console.log('Unable to get permission to notify. ', err);
				});
			}, // end $.google.firebase.request_permission
			send_broadcast : function(message) {
				var data = {
					"registration_ids" : $.google.firebase.token.registration_ids,
					"data" : message
				};
				
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : "https://fcm.googleapis.com/fcm/send",
						method : "POST",
						headers : {
							"Content-Type" : "application/json",
							"Authorization" : "key=" + $.google.firebase.config.serverKey
						},
						data : data,
						success: function(data, textStatus, jqXHR) {
							console.log("broadcast sent.. ", data);
							resolve(data);
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR);
						}
					});
				});
				return promise;
			} // end $.google.firebase.send_broadcast
		} // end $.google.firebase
	}
	
	$.page = {
		init : function() {
			var role = $.page.get_cookie("groups");
			
			var promises = [];
			
			if (role === "Call_Center") {
				promises.push($.page.incident.init(true));
				$("#theme-setting-icon, #theme-setting").remove();
			} else if (role === "PR_Manager") {
				promises.push($.page.social_media.init(true));
				$("#theme-setting-icon, #theme-setting").remove();
			} else if (role === "HQ_Commander") {
				promises.push($.page.incident.init(true));
				promises.push($.page.resource.init());
				promises.push($.page.social_media.init());
			} else {
				// back to login
				window.location = "login.html";
			}
			
			$("#skin-1").click(function(e) {
                $.backend.CMS_Status.update(false);
				$("#theme-setting-icon").click();
            });
			
			$("#skin-2").click(function(e) {
                $.backend.CMS_Status.update(true);
				$("#theme-setting-icon").click();
            });
			
			return Promise.all(promises);
		}, // end $.page.init
		get_cookie : function(c_name) {
			return Cookies.get()[c_name];
		}, // end $.page.get_cookie
		scrollTo : function(element) {
			var height = 0;
			$(element).prevAll().each(function(index, element) {
				height += $(this).outerHeight();
			});
			$("html, body").animate({ scrollTop: height }, 600);
		}, // end $.page.scrollTo
		logout : function() {
			Cookies.remove("groups");
			Cookies.remove("skin_color");
			$.google.firebase.token.to_server.is_sent(false);
			window.location = "login.html";
		}, // end $.page.logout
		update : function() {
			$.backend.incident.list().then(function(results) {
				$.page.incident.list = results;
				$.page.incident.update(results);
				$.page.resource.update.incidents(results);
				$.page.social_media.update(results);
			});
		}, // end $.page.update
		incident : {
			list : [ /* list of retrieved incidents */ ],
			init : function(showView) {
				//load menus
				$.page.incident.menu.init($.page.incident.menu.click);
				
				//load view
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : "incident_management.html",
						success : function(data) {
							var view = $("<div>", {
								id : "incident_view",
								class : "role_view"
							}).appendTo("#main-container");
							
							view.html(data);
							
							if(!showView) view.hide();
							
							$("#incident_create_form").submit($.page.incident.submit_create_form);
							
							resolve(data);
						}
					});
				});
				
				return promise;
			}, //end $.page.incident.init
			submit_create_form : function(e) {
				e.preventDefault();
							
				var address = $("#incident-location").val();
				var incident_type = $("#incident-type").val();
				$.google.maps.geocode_address(address).then(function(results) {
					var new_location = results[0].geometry.location;
					
					var incident_exists = false;
					var incident_id, description;
					$.page.incident.list.some(function(incident, index) {
						if (incident.location != null) {
							var existing_location = new google.maps.LatLng(incident.location.coord_lat, incident.location.coord_long);
							
							var dist = google.maps.geometry.spherical.computeDistanceBetween(new_location, existing_location);
							var radius = incident.location.radius;
							
							incident_exists = dist <= radius && incident_type === incident.incident_type;
							if (incident_exists) {
								incident_id = incident.id;
								address = incident.description;
							}
							return incident_exists;
						}
					});
					
					return { incident_id : incident_id, location : new_location };
				}).then(function(result) {
					var location = result.location;
					
					if (result.incident_id === undefined) {
						return $.google.maps.geocode_latlng(location);
					}
					
					return result;
				}).then(function(results) {
					if (results.incident_id === undefined) {
						address = results[0].formatted_address;
						var location = results[0].geometry.location;
						var lat = location.lat();
						var lng = location.lng();
						var activation_time = new Date();
						
						return $.backend.incident.create(null, activation_time, address, incident_type, 2000, lat, lng);
					}
					return results.incident_id;
				}).then(function(result) {
					console.log("incident id : ", result);
					var description = $.page.incident.get_type_text(incident_type) + " @ " + address;
					return $.page.incident.call_report.create(result, description);
				}).then(function(result) {
					console.log("created new call report with id : ", result.id);
					$.google.firebase.send_broadcast({incident:true});
					// reset form
					$("#incident_create_form")[0].reset();
				});
			}, //end $.page.incident.submit_create_form
			menu : {
				init : function(onClick) {
					$.page.incident.menu.main_menu(onClick);
					$.page.incident.menu.shortcut(onClick);
				}, // end $.page.incident.menu.init
				main_menu : function(onClick) {
					var li = $("<li>", {
						class : "incident_btn",
						role : "button"
					}).appendTo(".main-menu > ul");
					var a = $("<a>").appendTo(li);
					var icon_wrapper = $("<span>",{
						class : "menu-icon"
					}).appendTo(a);
					var icon = $("<i>", {
						class : "fa fa-exclamation-triangle fa-lg"
					}).appendTo(icon_wrapper);
					var text = $("<span>", {
						class : "text"
					}).text("Incident Management").appendTo(a);
					
					li.click(onClick);
				}, //end $.page.incident.menu.main_menu
				shortcut : function(onClick) {
					var a = $("<a>", {
						class : "shortcut-link incident_btn",
						role : "button"
					}).appendTo(".shortcut-wrapper");
					var icon_wrapper = $("<span>",{
						class : "shortcut-icon"
					}).appendTo(a);
					var icon = $("<i>", {
						class : "fa fa-exclamation-triangle"
					}).appendTo(icon_wrapper);
					var text = $("<span>", {
						class : "text"
					}).text("Incident Management").appendTo(a);
					
					a.click(onClick);
				}, // end $.page.incident.menu.shortcut
				click : function(e) {
					e.preventDefault();
					
					$.google.maps.markers.forEach(function(marker, index) {
						marker.infowindow.resource.close();
						marker.infowindow.social_media.close();
						marker.infowindow.incident.close();
					});
					
					$(".role_view:not(#incident_view)").slideUp("fast");
					$(".role_view").promise().done(function() {
						$("#incident_view").slideDown("fast");
						$.page.scrollTo("#incident_view");
					});
				}
			}, // end $.page.incident.menu
			type : {
				F : "Flooding",
				T : "Terrorist",
				O : "Others"
			}, // end $.page.incident.type
			get_type_text : function(incident_type) {
				return $.page.incident.type[incident_type];
			}, // end $.page.incident.get_type_text
			update : function(results) {
				$.google.maps.marker.clear_all();
				
				// empty incident table (incident-management)
				var table = $("#incident-table");
				var tbody = table.children("tbody");
				tbody.empty();
				
				results.forEach(function(result, index) {
					if (result.deactivation_time !== null) {
						return;
					}
					
					var location = result.location;
					var description = result.description;
					var type = $.page.incident.get_type_text(result.incident_type);
					
					if (location !== null) {
						var lat = location.coord_lat;
						var lng = location.coord_long;
						var radius = location.radius;
						$.google.maps.marker.add(result.id,lat, lng, radius, description, type,result.activation_time);
							
						$.google.maps.map.setZoom(11);
						$.google.maps.map.setCenter({lat:lat,lng:lng});
					}
					
					// [START] incident table refresh/update
					var tr = $("<tr>", {
						"data-id" : result.id
					}).css("cursor", "pointer").click(function(e) {
                       $("#incident-log-list").attr({
						    "data-incident-id" : result.id
					   });
					   
					   tbody.children("tr").removeClass("active");
					   $(this).addClass("active");
					   $.page.incident.logs.refresh_list();
                    });
					tr.appendTo(tbody);
					
					$("<td>").text(result.id).appendTo(tr);
					
					var date = "", time = "";
					var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
					if (result.activation_time != null) {
						var datetime = new Date(result.activation_time);
						date = datetime.getDate() + " " + monthNames[datetime.getMonth()] + " " + datetime.getFullYear();
						time = datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
						time = datetime.toTimeString().substr(0, 8);
					}
					$("<td>").text(date + " " + time).appendTo(tr);
					
					$("<td>").text(result.description).appendTo(tr);
					
					var location = "";
					if (result.location !== null) {
						location = result.location.coord_lat + ", " + result.location.coord_long + "; " + result.location.radius + "m";
					}
					$("<td>").text(location).appendTo(tr);
					
					
					$("<td>").text(type).appendTo(tr);
					
					var status = $("<span>");
					
					var role = $.page.get_cookie("groups");
					if (role === "HQ_Commander") {
						status.click(function() {
							var dialog = confirm("Confirm close this incident?");
							if (dialog == true) {
								var incident_id = tr.attr("data-id");
								
								tr.remove();
								
								var deactivation_time = new Date();
								$.backend.incident.update(incident_id, { deactivation_time : deactivation_time })
								.then(function(result) {
									$.backend.incident_logs.create(incident_id, "Incident Deactivated (" + deactivation_time + ")");
									$.google.firebase.send_broadcast({incident:true});
								});
							}
						});
					}
					
					$("<td>").append(status).appendTo(tr);
					
					if (result.deactivation_time === null) {
						status.attr("class", "label label-success");
						status.text("ACTIVE");
					} else {
						status.attr("class", "label label-error");
						status.text("CLOSED");
					}
					// [END] incident table refresh/update
				});
				
				tbody.children("tr:last").click();
				table.parent(".incident-table-wrapper").animate({ scrollTop: table.height() }, 100);
			}, //end $.page.incident.update
			logs : {
				refresh_list : function() {
					var incident_id = $("#incident-log-list").attr("data-incident-id");
					if (incident_id === undefined) return;
					$.backend.incident_logs.list(incident_id).then(function(results) {
						$("#incident-log-list").empty();
						for(var i = 0; i < results.length; i++) {
							var id = results[i].id;
							var description = results[i].description;
							var datetimeString = results[i].datetime;
							
							var list_item = $.page.incident.logs.new_list_item(id, description, datetimeString);
							$("#incident-log-list").prepend(list_item);
						}
					});
				}, // end $.page.incident.logs.refresh_list
				new_list_item : function(id, description, datetimeString) {
					var li = $("<li>", {
						class : "list-group-item clearfix log-item",
						"data-id" : id
					});
					
					var icon_wrapper = $("<div>", {
						class : "activity-icon bg-info small"
					}).appendTo(li);
					
					var icon = $("<i>", {
						class : "fa fa-comment"
					}).appendTo(icon_wrapper);
					
					var content_wrapper = $("<div>", {
						class : "pull-left m-left-sm"
					}).appendTo(li);
					
					var text = $("<span>").text(description).appendTo(content_wrapper);
					var br = $("<br>").appendTo(content_wrapper);
					
					var datetime_wrapper = $("<small>", {
						class : "text-muted"	
					}).appendTo(content_wrapper);
					
					var time_icon = $("<i>",{
						class : "fa fa-clock-o"	
					}).appendTo(datetime_wrapper);
					
					datetime_wrapper.append($.page.convert_time_display(datetimeString));
					
					return li;
				},  // end $.page.incident.logs.new_list_item
				create : function(form, e) {
					e.preventDefault();
					
					var incident_id = $("#incident-log-list").attr("data-incident-id");
					if (incident_id === undefined) return;
					
					var description = $("#log-create-description").val();
					if (description.length <= 0) return;
					
					$.backend.incident_logs.create(incident_id, description).then(function(data) {
						$.page.incident.logs.refresh_list();
						$.google.firebase.send_broadcast({incident_logs:true});
						$("#log-create-description").val("");
					});
				}  // end $.page.incident.logs.create
			}, // end $.page.incident.logs
			call_report : {
				create : function(incident_id, description) {
					var name = $("#incident_caller_name").val();
					var contact = $("#incident_caller_contact").val();
					return $.backend.call_report.create(incident_id, name, contact, description);
				}	// end $.page.incident.call_report.create
			} // end $.page.incident.call_report
		},  // end $.page.incident
		resource : {
			icons : {
				SPF : "fa fa-taxi fa-3x",
				SCDF : "fa fa-bus fa-3x",
				PUB : "fa fa-tint fa-3x",
				SEAS : "fa fa-ambulance fa-3x"
			}, // end $.page.resource.icons
			inverted : false,
			init : function(showView) {
				//load controls
				$.page.resource.menu.init($.page.resource.menu.click);
				
				//load view
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : "resource_management.html",
						success : function(data) {
							var view = $("<div>", {
								id : "resource_view",
								class : "role_view"
							}).appendTo("#main-container");
							
							view.html(data);
							resolve(data);
							
							if (!showView) view.hide();
						}
					}).done(function() {
						$.page.resource.update.agencies();
						
						$("#resource-contact").on("focusin", function() {
							$(this).prop("readonly", true);
						});
						
						$("#resource-contact").on("focusout", function() {
							$(this).prop("readonly", false);
						});
					});
				});
				return promise;
				
			}, // end $.page.resource.init
			menu : {
				init : function(onClick) {
					$.page.resource.menu.main_menu(onClick);
					$.page.resource.menu.shortcut(onClick);
				}, // end $.page.resource.menu.init
				main_menu : function(onClick) {
					var li = $("<li>", {
						class : "resource_btn",
						role : "button"
					}).appendTo(".main-menu > ul");
					var a = $("<a>").appendTo(li);
					var icon_wrapper = $("<span>",{
						class : "menu-icon"
					}).appendTo(a);
					var icon = $("<i>", {
						class : "fa fa-users fa-lg"
					}).appendTo(icon_wrapper);
					var text = $("<span>", {
						class : "text"
					}).text("Resource Management").appendTo(a);
					
					li.click(onClick);
				}, // end $.page.resource.menu.main_menu
				shortcut : function(onClick) {
					var a = $("<a>", {
						class : "shortcut-link resource_btn",
						role : "button"
					}).appendTo(".shortcut-wrapper");
					var icon_wrapper = $("<span>",{
						class : "shortcut-icon"
					}).appendTo(a);
					var icon = $("<i>", {
						class : "fa fa-user"
					}).appendTo(icon_wrapper);
					var text = $("<span>", {
						class : "text"
					}).text("Resource Management").appendTo(a);
					
					a.click(onClick);
				}, // end $.page.resource.menu.shortcut
				click : function(e) {
					e.preventDefault();
					
					$.google.maps.markers.forEach(function(marker, index) {
						marker.infowindow.resource.close();
						marker.infowindow.social_media.close();
						marker.infowindow.incident.close();
					});
				
					$(".role_view:not(#resource_view)").slideUp("fast");
					$(".role_view").promise().done(function() {
						$("#resource_view").slideDown("fast");
						$.page.scrollTo("#resource_view");
					});
				}
			}, // end $.page.resource.menu
			update : {
				agencies : function() {
					var selector = $("#resource_view #resource-selector");
					selector.empty();
					$.page.resource.inverted = false;
					
					return $.backend.resource.list().then(function(results) {
						results.forEach(function(result, index) {
							var col = $("<div>", {
								class : "col-md-3"
							}).appendTo(selector);
							
							var panel = $("<div>", {
								class : "panel-stat3",
								title : result.description,
								"data-contact" : result.sms_contact_no,
								"data-id" : result.id
							}).appendTo(col);
							
							if ($.page.resource.inverted) {
								panel.addClass("bg-danger");	
							} else {
								panel.addClass("bg-primary");	
							}
							
							panel.click($.page.resource.agency_onclick);
							
							var header = $("<h2>", {
								class : "m-top-none"
							}).text(result.name).appendTo(panel);
							
							$("<small>").text(result.description).appendTo(panel);
							
							var icon_wrapper = $("<div>", {
								class : "stat-icon"
							}).appendTo(panel);
							
							$("<i>", {
								class : $.page.resource.icons[result.name]
							}).appendTo(icon_wrapper);
							
							$.page.resource.inverted = !$.page.resource.inverted;
						});
					});
				}, // end $.page.resource.update.agencies
				incidents : function(incidents) {
					var select = $("#resource-incidents");
					select.empty();
					
					var option = $("<option>", {
						value : "",
						default : ""
					}).text("").appendTo(select);
					
					incidents.forEach(function(incident, index) {
						var deactivation_time = incident.deactivation_time;
						
						if (deactivation_time !== undefined && deactivation_time !== null) {
							return;
						}
						
						var title = $.page.incident.get_type_text(incident.incident_type);
						title += " @ " + incident.description;
						
						var opt_text = incident.id + ": ";
						opt_text += title;
						opt_text += " [" + new Date(incident.activation_time) + "]";
						
						var option = $("<option>", {
							value : title,
							"data-id" : incident.id
						}).text(opt_text).appendTo(select);
					});
				} // end $.page.resource.update.incidents
			}, // end $.page.resource.update
			agency_onclick : function(e) {
				var target = $(e.currentTarget);
				var contact = target.attr("data-contact");
				var description = target.attr("title");
				
				$("#resource-contact").val(description + " (" + contact + ")");
				$("#resource-contact").attr("data-contact", contact);
			}, // end $.page.resource.agency_onclick
			form_submit : function(form, e) {
				e.preventDefault();
				
				var contact = $("#resource-contact").attr("data-contact");
				var title = $("#resource-incidents").val();
				var message = $("#resource-message").val();
				
				var contact_text = $("#resource-contact").val();
				
				var incident_id = $("#resource-incidents option:selected").attr("data-id");
				
				$.backend.resource.assign(contact, title, message).then(function(data) {
					form.reset();
				}).then(function() {
					var logs_desc = contact_text + " assigned, message: " + message;
					return $.backend.incident_logs.create(incident_id, logs_desc);
				}).then(function() {
					$.google.firebase.send_broadcast({incident_logs:true});
				});
			} // end $.page.resource.form_submit
		}, // end $.page.resource
		social_media : {
			init : function(showView) {
				//load controls
				$.page.social_media.menu.init($.page.social_media.menu.click);
				
				//load view
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : "media_management.html",
						success : function(data) {
							var view = $("<div>", {
								id : "media_view",
								class : "role_view"
							}).appendTo("#main-container");
							
							view.html(data);
							
							if (!showView) view.hide();
							
							resolve(data);
						}
					});
				});
				return promise;
				
			}, // end $.page.social_media.init
			update : function(results) {
				
				// empty timeline
				var timeline = $(".timeline_main");
				timeline.empty();
				
				results.forEach(function(result, index) {
					var incident_id = result.id;
					var activation_time = result.activation_time;
					var deactivation_time = result.deactivation_time;
					var incident_type = $.page.incident.get_type_text(result.incident_type);
					var description = result.description;
					$.page.social_media.timeline.incidents.add_entry(incident_id, activation_time, deactivation_time, incident_type, description);
				});
				
				timeline.children(".entry:last").click();
			}, // end $.page.social_media.update
			timeline : {
				incidents : {
					add_entry : function(incident_id, activation_time, deactivation_time, incident_type, description) {
						var timeline = $("#media_view .timeline_main");
					
						var entry = $("<div>", {
							class : "entry",
							"data-id" : incident_id
						}).appendTo(timeline);
						
						entry.click($.page.social_media.timeline.incidents.entry_onClick);
						
						var datetime = new Date();
						if (deactivation_time === null || deactivation_time === undefined) {
							if (activation_time != null) {
								datetime = new Date(activation_time);
							}
							entry.addClass("active");
							
							$("<span>", {
								class : "label label-success"	
							}).text("ACTIVE").appendTo(entry);
						} else {
							if (deactivation_time != null) {
								datetime = new Date(deactivation_time);
							}
							
							$("<span>", {
								class : "label label-error"	
							}).text("CLOSED").appendTo(entry);
						}
						
						var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
						var date = datetime.getDate() + " " + monthNames[datetime.getMonth()] + " " + datetime.getFullYear();
						var time = datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
						time = datetime.toTimeString().substr(0, 8);
						
						$("<br>").appendTo(entry);
						$("<small>").text(date).appendTo(entry);
						$("<h1>").text(time).appendTo(entry);
						$("<h2>").text(incident_type).appendTo(entry);
						$("<div>", {
							style : "overflow:hidden"
						}).text(description).appendTo(entry);
					}, // end $.page.social_media.timeline.incidents.add_entry
					entry_onClick : function(e) {
						var incident_id = $(this).attr("data-id");
						var log_timeline = $("#media_view .timeline");
						log_timeline.attr("data-incident-id", incident_id);
						$.page.social_media.timeline.logs.update();
					} // end $.page.social_media.timeline.incidents.entry_onClick
				}, // end $.page.social_media.timeline.incidents
				logs : {
					inverted : false,
					update : function() {
						var incident_id = $("#media_view .timeline").attr("data-incident-id");
						if (incident_id === undefined) return;
						
						$.page.social_media.timeline.logs.inverted = false;
						$.backend.incident_logs.list(incident_id).then(function(results) {
							$("#media_view .timeline").empty();
							for(var i = 0; i < results.length; i++) {
								var id = results[i].id;
								var description = results[i].description;
								var datetimeString = results[i].datetime;
								
								$.page.social_media.timeline.logs.add_entry(id, description, datetimeString);
							}
						});
					}, // end $.page.social_media.timeline.logs.update
					add_entry : function(id, description, datetimeString) {
						var timeline = $("#media_view .timeline");
						
						var entry = $("<li>").prependTo(timeline);
						if ($.page.social_media.timeline.logs.inverted) {
							entry.addClass("timeline-inverted");
						}
						$.page.social_media.timeline.logs.inverted = !$.page.social_media.timeline.logs.inverted;
						
						var badge = $("<div>", {
							class : "timeline-badge"	
						}).appendTo(entry);
						
						var icon = $("<i>", {
							class : "fa fa-comment"
						}).appendTo(badge);
						
						var panel = $("<div>", {
							class : "timeline-panel"
						}).appendTo(entry);
						
						var timeline_heading = $("<div>", {
							class : "timeline-heading"
						}).appendTo(panel);
						
						var heading_wrapper = $("<p>").appendTo(timeline_heading);
						var small_text = $("<small>", {
							class : "text-muted"
						}).appendTo(heading_wrapper);
						$("<i>", {
							class : "fa fa-clock-o"
						}).appendTo(small_text);
						
						small_text.append($.page.convert_time_display(datetimeString));
						
						var timeline_body = $("<div>", {
							class : "timeline-body"
						}).appendTo(panel);
						
						$("<p>").text(description).appendTo(timeline_body);
					} // end $.page.social_media.timeline.logs.add_entry
				} // end $.page.social_media.timeline.logs
			}, // end $.page.social_media.timeline
			menu : {
				init : function(onClick) {
					$.page.social_media.menu.main_menu(onClick);
					$.page.social_media.menu.shortcut(onClick);
				}, // end $.page.social_media.menu.init
				main_menu : function(onClick) {
					var li = $("<li>", {
						class : "media_btn",
						role : "button"	
					}).appendTo(".main-menu > ul");
					var a = $("<a>").appendTo(li);
					var icon_wrapper = $("<span>",{
						class : "menu-icon"
					}).appendTo(a);
					var icon = $("<i>", {
						class : "fa fa-envelope-o fa-lg"
					}).appendTo(icon_wrapper);
					var text = $("<span>", {
						class : "text"
					}).text("Media Management").appendTo(a);
					
					li.click(onClick);
				}, //end $.page.resource.menu.main_menu
				shortcut : function(onClick) {
					var a = $("<a>", {
						class : "shortcut-link media_btn",
						role : "button"
					}).appendTo(".shortcut-wrapper");
					var icon_wrapper = $("<span>",{
						class : "shortcut-icon"
					}).appendTo(a);
					var icon = $("<i>", {
						class : "fa fa-envelope-o"
					}).appendTo(icon_wrapper);
					var text = $("<span>", {
						class : "text"
					}).text("Media Management").appendTo(a);
					
					a.click(onClick);
				}, //end $.page.resource.menu.shortcut
				click : function(e) {
					e.preventDefault();
					
					$.google.maps.markers.forEach(function(marker, index) {
						marker.infowindow.resource.close();
						marker.infowindow.social_media.close();
						marker.infowindow.incident.close();
					});
				
					$(".role_view:not(#media_view)").slideUp("fast");
					$(".role_view").promise().done(function() {
						$("#media_view").slideDown("fast");
						$.page.scrollTo("#media_view");
					});
					
					var timeline = $(".timeline_main");
					$(".timeline_main").scrollLeft(timeline.width());
				}
			}, // end $.page.social_media.menu
			post_to : function(form, e) {
				e.preventDefault();
				
				var content = $("#social_media_content").val();
				$.backend.social_media.publish(content).then(function(result) {
					console.log("test: ", result);
					$("#social-media-form")[0].reset();
				});
			} // end $.page.social_media.post_to
		}, // end $.page.social_media
		convert_time_display : function(datetimeString) {
			var datetime = new Date(datetimeString);
			var now = new Date();
			
			var diffMillis = now.getTime() - datetime.getTime();
			
			if (diffMillis < 0) diffMillis = 0;
			
			var diffSecs = diffMillis / 1000;
			
			if (diffSecs < 60) {
				var c = Math.ceil(diffSecs);
				if (c > 1) return " " + c + " secs ago";
				else return " " + c + " sec ago";
			}
			
			var diffMins = diffSecs / 60;
			if (diffMins < 60) {
				var c = Math.ceil(diffMins);
				if (c > 1) return " " + c + " mins ago";
				else return " " + c + " min ago";
			}
			
			var diffHrs = diffMins / 60;
			if (diffHrs < 24) {
				var c = Math.ceil(diffHrs);
				if (c > 1) return " " + c + " hrs ago";
				else return " " + c + " hr ago";
			}
			
			var diffDays = diffHrs / 24;
			var c = Math.ceil(diffDays);
			if (c > 1) return " " + c + " days ago";
			else return " " + c + " day ago";
		}  // end $.page.convert_time_display
	} // end $.page
	
	$.backend = {
		get_root_url : function() {
			if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
				return "https://crisismanagement.herokuapp.com/";	
			}
			
			return "/";
		},
		incident_logs : {
			list : function(incident_id) {
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Incident/" + incident_id + "/logs/list/",
						method : "GET",
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if(data.success) {
								resolve(data.results);
							} else {
								reject("Failed to retrieve logs for {" + incident_id + "}.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.incident_logs.list
			create : function(incident_id, description) {
				var data = {
					"description" : description
				};
				
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Incident/" + incident_id + "/logs/create/",
						method : "POST",
						data : data,
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if(data.success) {
								resolve(data);
							} else {
								reject("Failed to create logs for {" + incident_id + "}.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			} // end $.backend.incident_logs.create
		}, // end $.backend.incident_logs
		incident : {
			list : function() {
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Incident/list/",
						method : "GET",
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data.results);	
							} else {
								reject("Failed to list incidents.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.incident.list
			create : function(deactivation_time, activation_time, description, incident_type, radius, coord_lat, coord_long) {
				var data = {
					"deactivation_time" : deactivation_time,
					"activation_time" : activation_time,
					"description" : description,
					"incident_type" : incident_type,
					"location" : {
						"radius" : radius,
						"coord_lat" : coord_lat,
						"coord_long" : coord_long
					}
				};
				
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Incident/create/",
						method : "POST",
						data : data,
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data.id);
								
								// log new incident creation
								$.backend.incident_logs.create(data.id, "Incident Activation (" + activation_time + ")");
							} else {
								reject("Failed to create incident.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.incident.create
			update : function(incident_id, data) {
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Incident/update/" + incident_id + "/",
						method : "POST",
						data : data,
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data);
							} else {
								reject("Failed to update incident for {" + incident_id + "}.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.incident.update
		}, // end $.backend.incident
		call_report : {
			create : function(incident_id, name, contact, description) {
				var data = {
					caller_name : name,
					contact_no : contact,
					description : description,
					dateTime : new Date()
				}
				
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Incident/" + incident_id + "/callreports/create/",
						method : "POST",
						data : data,
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data);
								
								var log_desc = "Call report made by " + name + " (contact no.: " + contact + ")";
								$.backend.incident_logs.create(incident_id, log_desc);
							} else {
								reject("Failed to create call report for {" + incident_id + "}.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.call_report.create
		}, // end $.backend.call_report
		CMS_Status : {
			retrieve : function() {
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "CMSStatus/read/1/",
						method : "GET",
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data.active);
							} else {
								reject("Failed to retrieve CMS Status.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.CMS_Status.retrieve
			update : function(active) {
				var data = {
					"active" : active
				};
				
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "CMSStatus/update/1/",
						method : "POST",
						data : data,
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data);
								$.google.firebase.send_broadcast({cms_status:active});
							} else {
								reject("Failed to update CMS Status.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.CMS_Status.update
		}, // end $.backend.CMS_Status
		resource : {
			list : function() {
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "Agency/list/",
						method : "GET",
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data.results);	
							} else {
								reject("Failed to retrieve resources.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.resource.list
			assign : function(to, title, message) {
				var data = {
					"to" : to,
					"title" : title,
					"message" : message
				};
				
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				var promise = new Promise(function(resolve, reject) {
					$.ajax({
						url : $.backend.get_root_url() + "SMS/create/",
						method : "POST",
						data : data,
						dataType : "json",
						success : function(data, textStatus, jqXHR) {
							if (data.success) {
								resolve(data.id);	
							} else {
								reject("Failed to send SMS.");	
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							reject(jqXHR.responseText);
						}
					});
				});
				return promise;
			}, // end $.backend.resource.assign
		}, // end $.backend.resource
		social_media : {
		  publish : function(status) {
			  var data = {
				  status : status
			  };
			  
			  // stringify json for backend to recognise
			  data = JSON.stringify(data);
			  
			  var promise = new Promise(function(resolve, reject) {
				  $.ajax({
					  url : $.backend.get_root_url() + "CMSSocial/update/",
					  method : "POST",
					  data : data,
					  dataType : "json",
					  success : function(data, textStatus, jqXHR) {
						  if (data.success) {
							  //console.log(data);
							  resolve(data);
						  } else {
							  reject("Failed to create incident.");	
						  }
					  },
					  error : function(jqXHR, textStatus, errorThrown) {
						  reject(jqXHR.responseText);
					  }
				  });
			  });
			  return promise;
			} // end $.backend.social_media.publish
		} // end $.backend.social_media
	} // end $.backend
	
	$(document).ready(function(e) {
		$.page.init().then(function() {
			//console.log("test");
			$.google.maps.load_library();
			$.google.firebase.init();
		});
		
        
    });
});