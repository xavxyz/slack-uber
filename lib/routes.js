Router.route('/login', function() {
    Meteor.call('authUber', this.params.query.code, function(error, success){
        console.log(success);
        console.log(error);
        window.close();
    });
}, {where: 'client'});

Router.route('/message', function () {
  var text = this.params.query.text,
      username = this.params.query.user_name;

  if (text == 'auth') {

      var link = fetchUber();
      this.response.end('Hey '+ username + ', you have to authorize Uber to interact in Slack: \n' + 
                        'Please <'+ link +'|click here>');

  } else if (text.indexOf('request') == 0) {
    
    var separator = text.indexOf('/');
    if (separator > -1) {
      var allParams = text.slice(7); // remove request from the text
      var adress = allParams.split('/'); // make an array with the adresses
      var startingPoint = adress[0].trim(), // removal of the spaces
          endingPoint = adress[1].trim();
      var geoLoc = adressToCoords(startingPoint); 
      var driver = getUberProperty(geoLoc.latitude, geoLoc.longitude, "uberX", uber.defaults.success_token);

      postMessage(username + ' has requested a Uber from '+ startingPoint +' to '+ endingPoint);
      postMessage('transformation starting point :rocket: -> '+ JSON.stringify(adressToCoords(startingPoint)) );
      postMessage('transformation ending point :rocket: -> '+ JSON.stringify(adressToCoords(endingPoint)) );
      postMessage(driver.length + 'Uber around you');
      postMessage(':taco: :meteor:');

    } else {
      this.response.end("I guess you forgot something! Syntax : `/uber request starting point / end point`");
    }

  } else if (text == 'cancel') {
    postMessage(username + ' cancelled his ride!');
  } else if (text == 'status') {
    postMessage(username + " want to know what's up with his Uber");
  } else if (text == 'me') {
    this.response.end(fetchMe(SUCCESS_TOKEN));
  } else {
    this.response.end('Not a valid option! Try `auth`, `request`, `cancel` or `status`');
  }
}, {where: 'server'});
