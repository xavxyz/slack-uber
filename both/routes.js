Router.route('/', function () {
  console.log(this.params.query);
  SLACK_QUERY = this.params.query;

  if (SLACK_QUERY.text === 'auth') {
      var link = fetchUber();
      this.response.end('Hey ' + SLACK_QUERY.user_name + ', you have to authorize Uber to interact in Slack: \n' +
          'Please <' + link + '|click here>');

  }else if (SLACK_QUERY.text.indexOf('request') == 0) {

    var separator = SLACK_QUERY.text.indexOf('/');
    if (separator > -1) {
      var allParams = SLACK_QUERY.text.slice(7); // remove request from the text
      var adress = allParams.split('/'); // make an array with the adresses
      var startingPoint = adress[0].trim(), // removal of the spaces
          endingPoint = adress[1].trim();

        console.log('adress', adress);
        console.log('startingPoint', startingPoint);
        console.log('endingPoint', endingPoint);
      var geoLoc = {
        starting: adressToCoords(startingPoint),
        ending: adressToCoords(endingPoint)
      };
        GEOLOC = geoLoc;
        console.log('géolocalisation', GEOLOC);

      if ( SUCCESS_TOKEN != null) {
          var driver = getUberProducts(geoLoc.starting.latitude, geoLoc.starting.longitude, "uberX", SUCCESS_TOKEN);
          console.log('driver: '+ driver);

          if (driver.length == 0) {
              this.response.end('No driver available for your request... :squirrel:');
          } else {
              var infoUber = requestUber(driver, geoLoc.starting.latitude, geoLoc.starting.longitude, geoLoc.ending.latitude, geoLoc.ending.longitude, SUCCESS_TOKEN);

              console.log('infos sur le uber :'+ infoUber);

              if(infoUber.meta && infoUber.meta.surge_confirmation.href){
                  console.log('Have to accept surge pricing');
                this.response.end('You have to accept surge supricing: \n' +
                                  'Please <' + infoUber.href + '|click here>');
              } else {
                  console.log('REQUEST_ID', infoUber.data.request_id);
                REQUEST_ID = infoUber.data.request_id;
                //var map = mapRequest(REQUEST_ID,SUCCESS_TOKEN);
                postMessage(username + ' has requested a Uber from '+ startingPoint +' to '+ endingPoint +':meteor::taco:');
                //postMessage('Map : ' + map.href);
                console.log('infoUber', infoUber);
                var success = getPriceEstimates(geoLoc.starting, geoLoc.ending, SUCCESS_TOKEN);
                postMessage('The average timetravel will be: ' + success.minutes + ' min and the average cost will be: ' + success.estimate );
              }
          }
      } else {
        this.response.end("No token issued.. Type /uber auth to generate one :ok_hand:");
      }

    } else {
      this.response.end("I guess you forgot something! Syntax : `/uber request starting point / end point`");
    }
  } else if (SLACK_QUERY.text == 'cancel') {
    if ( REQUEST_ID != null ) {
      cancelUber(REQUEST_ID, SUCCESS_TOKEN);
      postMessage(username + ' cancelled his ride! :suspect:');
    } else {
      this.response.end('Sorry mate, you cannot cancel a ride which does not exist :wink:');
    }
  } else if (SLACK_QUERY.text == 'status') {
    if ( REQUEST_ID != null ) {
      var details = detailsRequest(REQUEST_ID, SUCCESS_TOKEN);
      postMessage(username + " want to know what's up with Uber :" + details.status);
    } else {
      this.response.end('Hey dude, a ride need to be requested to be aware of its status :squirrel:');
    }

  } else if (SLACK_QUERY.text == 'force') {
    changeStatusRequest(REQUEST_ID, 'accepted', SUCCESS_TOKEN);
    postMessage('Chgt de statut forcé 1');
    
    changeStatusRequest(REQUEST_ID, 'arriving', SUCCESS_TOKEN);
    postMessage('Chgt de statut forcé 2');
    
    changeStatusRequest(REQUEST_ID, 'driver_canceled', SUCCESS_TOKEN);
    postMessage('Chgt de statut forcé 3');
    
  } else {
    this.response.end('Not a valid option! Try `auth`, `request`, `cancel` or `status`');
  }
}, {where: 'server'});

Router.route('/login', function() {
    var code = this.params.query.code;
    navigator.geolocation.getCurrentPosition(setPosition, setDefaultPosition);
    function setPosition(position){
        var coords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        };
        Meteor.call('authUber', code, coords, function(error, success){
            console.log(error);
            console.log(success);
            window.close();
        });
    }
    function setDefaultPosition(){
        var coords = {
            longitude: 0,
            latitude: 0
        };
        Meteor.call('authUber', code, coords, function(error, success){
            console.log(error);
            console.log(success);
            window.close();
        });
    }
}, {where: 'client'});

Router.route('/price', function() {
    Meteor.call('priceUber', this.params.query.surge_confirmation_id, function(error, success){
        console.log(error);
        console.log(success);
        window.close();
    });
}, {where: 'client'});

/*
 Router.route('/status', function () {
 var data = this.params.query.data;

 if(data.event_type == "requests.status_changed") {
 var identity = fetchIdentity(SUCCESS_TOKEN);
 postMessage(identity.first_name +', votre Uber a changé de statut : '+ data.meta.status +' :bowtie:');
 }

 }, {where: 'server'});
 */