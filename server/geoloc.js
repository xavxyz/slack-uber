Geoloc = {
	addressToCoords: function(address) {
		var geo = new GeoCoder({
			geocoderProvider: "google",
			httpAdapter: "https",
			apiKey: "AIzaSyATN0-PAf_l4rrLm8pDaSWfLrim2xVjTCY"
		});

		var result = geo.geocode(address);

		return {
			latitude: result[0].latitude,
			longitude: result[0].longitude
		};
	},

};