Router.route('/uber', function() {
    postMessage('You have to login here: '+ Meteor.absoluteUrl() +'auth' );
}, {where: 'server'});

Router.route('/auth', function() {
    Meteor.call('fetchUber', function(error, success) {
        console.log(success);
        console.log(error);
        window.open(success, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=500, height=600");
        window.close();
    });
}, {where: 'client'});

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

      var link = Meteor.absoluteUrl() +'auth';
      this.response.end('Hey '+ username + ', you have to authorize Uber to interact in Slack: \n' + 
                        'Please <'+ link +'|click here>');

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
        postMessage(username + ' has requested a Uber from '+ startingPoint +' to '+ endingPoint +':meteor::taco:');
        //postMessage(driver[0].product_id + 'found for you !');
        var prices = getPriceEstimates(geoLoc.starting, geoLoc.ending, SUCCESS_TOKEN);
        /*if ()
          postMessage('Prices :\n'+ JSON.stringify());
      } else {
        this.response.end("No token issued.. Type /uber auth to generate one :ok_hand:");
      }*/

    } else {
      this.response.end("I guess you forgot something! Syntax : `/uber request starting point / end point`");
    }
  }
  } else if (text == 'cancel') {
    postMessage(username + ' cancelled his ride!');
  } else if (text == 'status') {
    postMessage(username + " want to know what's up with his Uber");
  } else {
    this.response.end('Not a valid option! Try `auth`, `request`, `cancel` or `status`');
  }
}, {where: 'server'});
