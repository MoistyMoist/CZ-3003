var map;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 1.34284, lng: 103.8190145},
		zoom: 11
	});
}