Meteor.methods({
    authUber: function(code, coords) {
        var request =  HTTP.post('https://login.uber.com/oauth/v2/token', {
            auth: [uber.defaults.client_id, uber.defaults.client_secret].join(':'),
            params: {
                redirect_uri: uber.defaults.redirect_uri,
                code: code,
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

                    Slack.postMessage(identity.first_name +' '+ identity.last_name +' logged to Uber with success!');

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

                    Slack.postMessage( identity.first_name +' '+ identity.last_name +' logged to Uber with success!');
                })
            }
        } else {
            Slack.postMessage('Error during login, please try again.');
        }
        return request;
    },
    priceUber: function(surge_confirmation_id) {
        var user = Users.findOne({
            'slack.userId' : SLACK_QUERY.user_id
        });
        console.log('confirmation', surge_confirmation_id);
        var driver = getUberProducts(user.geoLoc.start.latitude, user.geoLoc.start.longitude, "uberX", user.uber.successToken);
        var infoUber = requestUber(driver, user.geoLoc.start.latitude, user.geoLoc.start.longitude, user.geoLoc.end.latitude, user.geoLoc.end.longitude, user.uber.successToken, surge_confirmation_id);
        console.log(infoUber);
        var geo = new GeoCoder();
        var startingPoint = geo.reverse(user.geoLoc.start.latitude, user.geoLoc.start.longitude);
        var endingPoint = geo.reverse(user.geoLoc.end.latitude, user.geoLoc.end.latitude);
        Slack.postMessage(SLACK_QUERY.user_name + ' has requested a Uber from '+ startingPoint.formattedAddress +' to '+ endingPoint.formattedAddress +':meteor::taco:');
        return true;
    }
});