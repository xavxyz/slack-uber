Geoloc = {
	addressToCoords: function(address) {
		var geo = new GeoCoder({
			geocoderProvider: "google",
			httpAdapter: "https",
			apiKey: Meteor.settings.private.google
		});

		var result = geo.geocode(address);

		return {
			latitude: result[0].latitude,
			longitude: result[0].longitude
		};
	},

};