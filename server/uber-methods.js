Meteor.methods({
  authUber: function(AUTHORIZATION_CODE, coords) {
      var request =  HTTP.post('https://login.uber.com/oauth/v2/token', {
          auth: [uber.defaults.client_id, uber.defaults.client_secret].join(':'),
          params: {
              redirect_uri: uber.defaults.redirect_uri,
              code: AUTHORIZATION_CODE,
              grant_type: 'authorization_code'
          }
      });
      console.log(request);
      if (request.data.access_token) {
          var identity = fetchIdentity(request.data.access_token);
          var currentUser = Users.findOne({
              'uber.userId' : identity.uuid
          });
          console.log('currentUser', currentUser);
          if(currentUser !==  undefined ){
              console.log('User exist !');
              var setSlack = currentUser.slack,
                  setUber = currentUser.uber,
                  setGeoLoc = currentUser.geoLoc,
                  exist = false;

              setSlack.forEach(function(element){
                  if(element.userId === SLACK_QUERY.user_id){
                      exist = true;
                  }
              });
              if(!exist){
                  setSlack.push({
                      userId: SLACK_QUERY.user_id,
                      name: SLACK_QUERY.user_name,
                      token: SLACK_QUERY.token,
                      channel: SLACK_QUERY.channel_id
                  });
              }

              setUber.firstName = identity.first_name;
              setUber.lastName = identity.last_name;
              setUber.picture = identity.picture;
              setUber.email = identity.email;
              setUber.successToken = request.data.access_token;
              setUber.tokenCreatedAt = new Date;
              setGeoLoc.start.longitude = coords.longitude;
              setGeoLoc.start.latitude = coords.latitude;

              var set = {
                  slack: setSlack,
                  uber: setUber,
                  geoLoc: setGeoLoc
              };
              Users.update({
                  'uber.userId': identity.uuid
              },{
                  $set: set
              }, function(error, success){
                  console.log('update error', error);
                  console.log('update success', success);

                  postMessage(identity.first_name +' '+ identity.last_name +' logged to Uber with success!');

              });
          }else{
              console.log('User don\'t exist !');
              Users.insert({
                  slack: [
                      {
                          userId: SLACK_QUERY.user_id,
                          name: SLACK_QUERY.user_name,
                          token: SLACK_QUERY.token,
                          channel: SLACK_QUERY.channel_id
                      }
                  ],
                  uber: {
                      userId: identity.uuid,
                      firstName: identity.first_name,
                      lastName: identity.last_name,
                      picture: identity.picture,
                      email: identity.email,
                      successToken: request.data.access_token,
                      tokenCreatedAt: new Date
                  },
                  geoLoc: {
                      start: {
                          longitude: coords.longitude,
                          latitude: coords.latitude
                      }
                  }
              }, function(error, success){
                  console.log('insert error', error);
                  console.log('insert success', success);

                  postMessage( identity.first_name +' '+ identity.last_name +' logged to Uber with success!');
              })
          }
      } else {
          postMessage('Error during login, please try again.');
      }
      return request;
  },
  priceUber: function(surge_confirmation_id) {
      console.log('confirmation', surge_confirmation_id);
      var driver = getUberProducts(GEOLOC.starting.latitude, GEOLOC.starting.longitude, "uberX", SUCCESS_TOKEN);
      var infoUber = requestUber(driver, GEOLOC.starting.latitude, GEOLOC.starting.longitude, GEOLOC.ending.latitude, GEOLOC.ending.longitude, SUCCESS_TOKEN, surge_confirmation_id);
      console.log(infoUber);
      postMessage(username + ' has requested a Uber from '+ startingPoint +' to '+ endingPoint +':meteor::taco:');
      return true;
  }
});