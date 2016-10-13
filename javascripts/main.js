$(function () {
	
	$.google = {
		api_key : "AIzaSyB_tE97WXP7-9Pzr8r1iXiNuhC8NH8AJc0",
		maps : {
			callback : "$.google.maps.init",
			Map : {},
			load_library : function() {
				var googleMaps = $("<script>", {
					type : "text/javascript",
					src : "http://maps.googleapis.com/maps/api/js?key=" + $.google.api_key + "&region=SG&callback=" + $.google.maps.callback
				}).prop("defer", true).prop("async", true);
				
				$("body").append(googleMaps);
			},
			init : function() {
				$.google.maps.Map = new google.maps.Map(document.getElementById("map"), {
					center: {lat: 1.34284, lng: 103.8190145},
					zoom: 11
				});
				
				$.google.maps.add_marker(1.33284, 103.8190145, 1000);
			},
			/**
				radius in meters
			*/
			add_marker : function(lat, lng, radius) {
				var marker = new google.maps.Marker({
					position : {lat:lat, lng:lng},
					map : $.google.maps.Map,
					title : "hello world!"
				});
				var circle = new google.maps.Circle({
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35,
					map: $.google.maps.Map,
					center: {lat:lat, lng:lng},
					radius: radius
				});
			}
		}
	}
	
	$.page = {
		get_cookie : function(c_name) {
			/*var i, x, y, ARRcookies = document.cookie.split(";");
			
			for (i = 0; i < ARRcookies.length; i++) {
				x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
				y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
				x = x.replace(/^\s+|\s+$/g, "");
				if (x == c_name) {
					return unescape(y);
				}
			}*/
			return Cookies.get()[c_name];
		},
		init : function() {
			$(".incident_btn").click(function(e) {
				e.preventDefault();
				
                $(".role_view:not(#incident_view)").slideUp(1, function() {
					$("#incident_view").slideDown();
				});
            });
			
			$(".report_btn").click(function(e) {
				e.preventDefault();
				
                $(".role_view:not(#report_view)").slideUp(1, function() {
					$("#report_view").slideDown();
				});
				
            });
			
			$(".resource_btn").click(function(e) {
				e.preventDefault();
				
                $(".role_view:not(#resource_view)").slideUp(1, function() {
					$("#resource_view").slideDown();
				});
            });
			
			var role = $.page.get_cookie("role");
			
			if (role === "CC") {
				$(".role_btn:not(.incident_btn)").hide(1, function() {
					//$(".incident_btn").show();
					$(".incident_btn").css("display", "");
				});
				$(".incident_btn").click();
			} else if (role === "PR") {
				$(".role_btn:not(.report_btn)").hide(1, function() {
					//$(".report_btn").show();
					$(".report_btn").css("display", "");
				});
				$(".report_btn").click();
			} else if (role === "HQ") {
				//$(".role_btn").show();
				$(".role_btn").css("display", "");
				$(".incident_btn").click();
			}
			
			$.page.incident.init();
		},
		incident : {
			init : function() {
				//setInterval(function() {
					$.page.incident.logs.refresh_list();
				//}, 5000);
			},
			logs : {
				refresh_list : function() {
					var incident_id = $("#incident-log-list").attr("incident-id");
					if (incident_id === undefined) return;
					$.backend.incident_logs.list(incident_id, function(results){
						//alert(JSON.stringify(results));
						$("#incident-log-list").empty();
						for(var i = 0; i < results.length; i++) {
							var id = results[i].id;
							var description = results[i].description;
							var datetimeString = results[i].datetime;
							
							var list_item = $.page.incident.logs.new_list_item(id, description, datetimeString);
							$("#incident-log-list").prepend(list_item);
						}
					});
				},
				new_list_item : function(id, description, datetimeString) {
					var li = $("<li>", {
						class : "list-group-item clearfix log-item",
						id : id
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
				}, // end new_list_item
				create : function(form, e) {
					e.preventDefault();
					
					var incident_id = $("#incident-log-list").attr("incident-id");
					if (incident_id === undefined) return;
					
					var description = $("#log-create-description").val();
					if (description.length <= 0) return;
					
					$.backend.incident_logs.create(incident_id, description, function(data) {
						$.page.incident.logs.refresh_list();
						$("#log-create-description").val("");
					});
				}
			} // end logs
		}, // end incident
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
		}
	} // end $.page
	
	$.backend = {
		root_url : "https://crisismanagement.herokuapp.com/",
		incident_logs : {
			list : function(incident_id, successCallback) {
				$.ajax({
					url : $.backend.root_url + "main/list_logs/" + incident_id + "/",
					method : "GET",
					dataType : "json",
					success : function(data, textStatus, jqXHR) {
						if(successCallback !== undefined) {
							successCallback.call(this, data.results);	
						}
					}
				});
			},
			create : function(incident_id, description, successCallback) {
				var data = {
					"incident_id" : incident_id,
					"description" : description
				};
				
				// stringify json for backend to recognise
				data = JSON.stringify(data);
				
				$.ajax({
					url : $.backend.root_url + "IncidentLog/create/",
					method : "POST",
					data : data,
					dataType : "json",
					success : function(data, textStatus, jqXHR) {
						if(successCallback !== undefined) {
							successCallback.call(this, data);	
						}
					}
				});
			}
		}
	}
	
	$(document).ready(function(e) {
        $.google.maps.load_library();
		$.page.init();
    });
});