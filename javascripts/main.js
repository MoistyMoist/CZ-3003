$(function () {
	
	$.google = {
		api_key : "AIzaSyB_tE97WXP7-9Pzr8r1iXiNuhC8NH8AJc0",
		map : {
			load_library : function() {
				var googleMaps = $("<script>", {
					type : "text/javascript",
					src : "http://maps.googleapis.com/maps/api/js?key=" + $.google.api_key + "&callback=$.google.map.init"
				}).prop("defer", true).prop("async", true);
				
				$("body").append(googleMaps);
			},
			init : function() {
				$.google.mapObject = new google.maps.Map(document.getElementById("map"), {
					center: {lat: 1.34284, lng: 103.8190145},
					zoom: 11
				});
			}
		}
	}
	
	$.page = {
		
	}
	
	$.backend = {
		
	}
	
	$(document).ready(function(e) {
        $.google.map.load_library();
    });
});