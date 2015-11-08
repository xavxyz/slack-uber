Router.route('/', function () {
    console.log(this.params.query);
    SLACK_QUERY = this.params.query;
    var currentUser = Users.findOne({
        'slack.userId' : SLACK_QUERY.user_id
    });

    if (SLACK_QUERY.text === 'auth') {
        var link = fetchUber();
        this.response.end('Hey ' + SLACK_QUERY.user_name + ', you have to authorize Uber to interact in Slack: \n' +
            'Please <' + link + '|click here>');

    }else if (SLACK_QUERY.text.indexOf('request') == 0) {
        var separator = SLACK_QUERY.text.indexOf('/'), allParams, adress, startingPoint, endingPoint, driver, infoUber, success;
        if (separator > -1) {
            allParams = SLACK_QUERY.text.slice(7); // remove request from the text
            adress = allParams.split('/'); // make an array with the adresses
            startingPoint = adress[0].trim(); // removal of the spacesendingPoint = adress[1].trim();
            endingPoint = adress[1].trim();

            console.log('adress', adress);
            console.log('startingPoint', startingPoint);
            console.log('endingPoint', endingPoint);
            currentUser.geoLoc.start = adressToCoords(startingPoint);
            currentUser.geoLoc.end = adressToCoords(endingPoint);
            Users.update({_id: currentUser._id},{
                $set: {
                    geoLoc: {
                        start: adressToCoords(startingPoint),
                        end: adressToCoords(endingPoint)
                    }
                }
            }, function(error, result){
                console.log('update geoloc error:');
                console.log(error);
                console.log('update geoloc result:');
                console.log(result);
            });

            if ( currentUser.uber.successToken != null) {
                driver = getUberProducts(currentUser.geoLoc.start.latitude, currentUser.geoLoc.start.longitude, "uberX", currentUser.uber.successToken);
                console.log('driver: '+ JSON.stringify(driver));

                if (driver.length == 0) {
                    this.response.end('No driver available for your request... :squirrel:');
                } else {
                    infoUber = requestUber(driver, currentUser.geoLoc.start.latitude, currentUser.geoLoc.start.longitude, currentUser.geoLoc.end.latitude, currentUser.geoLoc.end.longitude, currentUser.uber.successToken);

                    console.log('infos sur le uber :'+ JSON.stringify(infoUber));

                    if(infoUber.meta && infoUber.meta.surge_confirmation.href){
                        console.log('Have to accept surge pricing');
                        this.response.end('You have to accept surge supricing: \n' +
                            'Please <' + infoUber.href + '|click here>');
                    } else {
                        console.log('REQUEST_ID', infoUber.data.request_id);
                        Users.update({_id: currentUser._id},{
                            $set: {
                                'uber.requestId': infoUber.data.request_id
                            }
                        }, function(error, result){
                            console.log('update requestID error:');
                            console.log(error);
                            console.log('update requestID result:');
                            console.log(result);
                        });
                        //var map = mapRequest(REQUEST_ID,SUCCESS_TOKEN);
                        postMessage(currentUser.slack[0].name +' has requested a Uber from '+ startingPoint +' to '+ endingPoint +' :rocket:');
                        //postMessage('Map : ' + map.href);
                        console.log('infoUber', infoUber);
                        success = getPriceEstimates(currentUser.geoLoc.start, currentUser.geoLoc.end, currentUser.uber.successToken);
                        postMessage('The average timetravel will be: ' + success.minutes + ' min and the average cost will be: ' + success.estimate );
                    }
                }
            } else {
                this.response.end("No token issued.. Type /uber auth to generate one :ok_hand:");
            }

        } else {
            adress = SLACK_QUERY.text.slice(7); // remove request from the text
            console.log('adress', adress);
            currentUser.geoLoc.end = adressToCoords(adress);
            Users.update({_id: currentUser._id},{
                $set: {
                    'geoLoc.end': adressToCoords(adress)
                }
            }, function(error, result){
                console.log('update geoloc error:');
                console.log(error);
                console.log('update geoloc result:');
                console.log(result);
            });

            if ( currentUser.uber.successToken != null) {
                driver = getUberProducts(currentUser.geoLoc.start.latitude, currentUser.geoLoc.start.longitude, "uberX", currentUser.uber.successToken);
                console.log('driver: '+ JSON.stringify(driver));

                if (driver.length == 0) {
                    this.response.end('No driver available for your request... :squirrel:');
                } else {
                    infoUber = requestUber(driver, currentUser.geoLoc.start.latitude, currentUser.geoLoc.start.longitude, currentUser.geoLoc.end.latitude, currentUser.geoLoc.end.longitude, currentUser.uber.successToken);

                    console.log('infos sur le uber :'+ JSON.stringify(infoUber));

                    if(infoUber.meta && infoUber.meta.surge_confirmation.href){
                        console.log('Have to accept surge pricing');
                        this.response.end('You have to accept surge supricing: \n' +
                            'Please <' + infoUber.href + '|click here>');
                    } else {
                        console.log('REQUEST_ID', infoUber.data.request_id);
                        currentUser.uber.request_id = infoUber.data.request_id;
                        Users.update({_id: currentUser._id},{
                            $set: {
                                'uber.requestId': infoUber.data.request_id
                            }
                        }, function(error, result){
                            console.log('update requestID error:');
                            console.log(error);
                            console.log('update requestID result:');
                            console.log(result);
                        });
                        //var map = mapRequest(REQUEST_ID,SUCCESS_TOKEN);
                        var geo = new GeoCoder();
                        startingPoint = geo.reverse(currentUser.geoLoc.start.latitude, currentUser.geoLoc.start.longitude);
                        endingPoint = geo.reverse(currentUser.geoLoc.end.latitude, currentUser.geoLoc.end.latitude);
                        postMessage(currentUser.slack[0].name +' has requested a Uber from '+ startingPoint +' to '+ endingPoint +' :rocket:');
                        //postMessage('Map : ' + map.href);
                        console.log('infoUber', infoUber);
                        success = getPriceEstimates(currentUser.geoLoc.start, currentUser.geoLoc.end, currentUser.uber.successToken);
                        postMessage('The average timetravel will be: ' + success.minutes + ' min and the average cost will be: ' + success.estimate );
                    }
                }
            } else {
                this.response.end("No token issued.. Type /uber auth to generate one :ok_hand:");
            }
        }
    } else if (SLACK_QUERY.text == 'cancel') {
        if ( currentUser.uber.requestId != null ) {
            cancelUber(currentUser._id, currentUser.uber.requestId, currentUser.uber.successToken);
            postMessage(currentUser.slack[0].name + ' cancelled his ride! :suspect:');
        } else {
            this.response.end('Sorry mate, you cannot cancel a ride which does not exist :wink:');
        }
    } else if (SLACK_QUERY.text == 'status') {
        if ( currentUser.uber.requestId != null ) {
            var details = detailsRequest(currentUser.uber.requestId, currentUser.uber.successToken);
            postMessage(username + " want to know what's up with Uber :" + details.status);
        } else {
            this.response.end('Hey dude, a ride need to be requested to be aware of its status :squirrel:');
        }

    } else if (SLACK_QUERY.text == 'force') {
        changeStatusRequest(currentUser.uber.requestId, 'accepted', currentUser.uber.successToken);
        postMessage('Chgt de statut forcé 1');

        changeStatusRequest(currentUser.uber.requestId, 'arriving', currentUser.uber.successToken);
        postMessage('Chgt de statut forcé 2');

        changeStatusRequest(currentUser.uber.requestId, 'driver_canceled', currentUser.uber.successToken);
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