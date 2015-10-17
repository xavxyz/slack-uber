adressToCoords = function(adress) {
	var geo = new GeoCoder();
	console.log('adressGeoCoder', adress);
	var result = geo.geocode(adress);
	console.log('resultat Geocode', result);
	return {
		latitude: result[0].latitude,
		longitude: result[0].longitude
	};
};