Router.route('/login', function() {
    Meteor.call('authUber', this.params.query.code, function(error, success){
        console.log(error);
        console.log(success);
        window.close();
    });
}, {where: 'client'});

Router.route('/message', function () {
  var text = this.params.query.text,
      username = this.params.query.user_name;

  if (text == 'auth') {
      var link = fetchUber();
      this.response.end('Hey ' + username + ', you have to authorize Uber to interact in Slack: \n' +
          'Please <' + link + '|click here>');

  } else if (text.indexOf('request') == 0) {

    var separator = text.indexOf('/');
    if (separator > -1) {
      var allParams = text.slice(7); // remove request from the text
      var adress = allParams.split('/'); // make an array with the adresses
      var startingPoint = adress[0].trim(), // removal of the spaces
          endingPoint = adress[1].trim();

      var geoLoc = {
        starting: adressToCoords(startingPoint),
        ending: adressToCoords(endingPoint)
      };

      if ( SUCCESS_TOKEN != null) {
          var driver = getUberProducts(geoLoc.starting.latitude, geoLoc.starting.longitude, "uberX", SUCCESS_TOKEN);
          var infoUber = requestUber(driver, geoLoc.starting.latitude, geoLoc.starting.longitude, geoLoc.ending.latitude, geoLoc.ending.longitude, SUCCESS_TOKEN);
          var map = mapRequest(REQUEST_ID,SUCCESS_TOKEN);
          postMessage(username + ' has requested a Uber from '+ startingPoint +' to '+ endingPoint +':meteor::taco:');
          postMessage('Map : ' + map.href);
          console.log(infoUber);
          var success = getPriceEstimates(geoLoc.starting, geoLoc.ending, SUCCESS_TOKEN);
          postMessage('The average timetravel will be: ' + success.minutes + ' min and the average cost will be: ' + success.estimate );
      } else {
        this.response.end("No token issued.. Type /uber auth to generate one :ok_hand:");
      }

    } else {
      this.response.end("I guess you forgot something! Syntax : `/uber request starting point / end point`");
    }
  } else if (text == 'cancel') {
    if ( REQUEST_ID != null ) {
      cancelUber(REQUEST_ID, SUCCESS_TOKEN);
      postMessage(username + ' cancelled his ride! :wink:');
    } else {
      this.response.end('Sorry mate, you cannot cancel a ride which does not exist :wink:');
    }
  } else if (text == 'status') {
    postMessage(username + " want to know what's up with his Uber");
  } else {
    this.response.end('Not a valid option! Try `auth`, `request`, `cancel` or `status`');
  }
}, {where: 'server'});
