var user = {};

Router.route('/uber', function() {
    if(this.params.query.code){
        postMessage('you have to wait !');
        authUber(this.params.query.code);
    }else{
        user.name = this.params.query.user_name;
        var link = fetchUber();
        postMessage(user.name + ', you have to login: ' + link);
    }
}, {where: 'server'});

Router.route('/message', function () {
  var text = this.params.query.text,
      username = this.params.query.user_name;
  if (text == 'auth') {
    postMessage(username + ' auth to Uber');
  } else if (text.indexOf('request') == 0) {
    
    var separator = text.indexOf('/');
    if (separator > -1) {
      var allParams = text.slice(7); // remove request from the text
      var adress = allParams.split('/'); // make an array with the adresses
      var startingPoint = adress[0].trim(), // removal of the spaces
          endingPoint = adress[1].trim();

      postMessage(username + ' has requested a Uber from '+ startingPoint +' to '+ endingPoint);
      postMessage('transformation starting point :rocket: -> '+ JSON.stringify(adressToCoords(startingPoint)) );
      postMessage('transformation ending point :rocket: -> '+ JSON.stringify(adressToCoords(endingPoint)) );
      postMessage(':taco: :meteor:');

    } else {
      this.response.end("I guess you forgot something! Syntax : `/uber request starting point / end point`");
    }

  } else if (text == 'cancel') {
    postMessage(username + ' cancelled his ride!');
  } else if (text == 'status') {
    postMessage(username + " want to know what's up with his Uber");
  } else {
    this.response.end('Not a valid option! Try `auth`, `request`, `cancel` or `status`');
  }
}, {where: 'server'});
