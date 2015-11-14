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
        var separator = SLACK_QUERY.text.indexOf('/'), allParams, adress, startingPoint, endingPoint, driver, infoUber, success, geo;
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

            //function to search uber and to response on slack
            processRequest(currentUser);

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
            
            //function to search uber and to response on slack
            processRequest(currentUser);
        }
    } else if (SLACK_QUERY.text.indexOf('uber') == 0 || SLACK_QUERY.text.indexOf('Uber') == 0) {
            if(TYPE_UBER_LIST.indexOf(SLACK_QUERY.text) != -1 && TYPE_UBER_NULL.indexOf(SLACK_QUERY.text) == -1){
                currentUser.mainProduct = SLACK_QUERY.text;
                Users.update({_id: currentUser._id},{
                    $set: {
                        'mainProduct': SLACK_QUERY.text;
                    }
                }, function(error, result){
                    console.log('update mainProduct error:');
                    console.log(error);
                    console.log('update mainProduct result:');
                    console.log(result);
                });

                //function to search uber and to response on slack
                processRequest(currentUser);

            } else {
                this.response.end(SLACK_QUERY.text + 'is not a uber type or is not in your choices list :squirrel: \n');
                postMessage('Choice a uber type (ex: /uber UberXL) in this list : ')
                for(i in TYPE_UBER_LIST){
                    if(TYPE_UBER_LIST[i] != TYPE_UBER_DEFAULT && TYPE_UBER_NULL.indexOf(TYPE_UBER_LIST[i]) == -1){
                        var price = getPriceEstimates(geoLoc.starting, geoLoc.ending, SUCCESS_TOKEN, TYPE_UBER_LIST[i]);
                        postMessage(' - '+TYPE_UBER_LIST[i]+' '+price.estimate+ '\n');
                    }
                }
            }
           

    } else if (SLACK_QUERY.text == 'cancel') {
        if ( currentUser.uber.requestId != null ) {
            cancelUber(currentUser._id, currentUser.uber.requestId, currentUser.uber.successToken);
            postMessage(SLACK_QUERY.user_name + ' cancelled his ride! :suspect:');
        } else {
            this.response.end('Sorry mate, you cannot cancel a ride which does not exist :wink:');
        }
    } else if (SLACK_QUERY.text == 'status') {
        if ( currentUser.uber.requestId != null ) {
            var details = detailsRequest(currentUser.uber.requestId, currentUser.uber.successToken);
            postMessage(SLACK_QUERY.user_name + " want to know what's up with Uber :" + details.status);
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

Router.route('/status', function () {
    var data = this.params.query.data;
    var currentUser = Users.findOne({
        'slack.userId' : SLACK_QUERY.user_id
    });
    if(data.event_type == "requests.status_changed") {
        var identity = fetchIdentity(currentUser.uber.successToken);
        postMessage(identity.first_name +', votre Uber a changé de statut : '+ data.meta.status +' :bowtie:');
    }

}, {where: 'server'});
