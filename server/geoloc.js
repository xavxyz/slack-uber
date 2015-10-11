adressToCoords = function(adress) {
	var geo = new GeoCoder();

	var result = geo.geocode(adress);

	var coords = {
		latitude: result[0].latitude,
		longitude: result[0].longitude
	};

	return coords;
};