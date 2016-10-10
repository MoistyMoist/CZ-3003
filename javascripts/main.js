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
					$(".incident_btn").show();
				});
				$(".incident_btn").click();
			} else if (role === "PR") {
				$(".role_btn:not(.report_btn)").hide(1, function() {
					$(".report_btn").show();
				});
				$(".report_btn").click();
			} else if (role === "HQ") {
				$(".role_btn").show();
				$(".incident_btn").click();
			}
		}
	}
	
	$.backend = {
		
	}
	
	$(document).ready(function(e) {
        $.google.maps.load_library();
		$.page.init();
    });
});