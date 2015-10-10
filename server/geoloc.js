var geo = new GeoCoder();

var adressToCoords = function(adress) {
	var result = geo.geocode(adress);

	console.log(adress +': lat '+ result[0].latitude +'/ long '+ result[0].longitude );
}

if(Meteor.startup) {  
  adressToCoords('9 rue ambroise thomas paris');
}