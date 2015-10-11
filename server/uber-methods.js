TOKEN_UBER = Meteor.settings.private.uber.server_token;
ID = Meteor.settings.private.uber.client_id;
SECRET = Meteor.settings.private.uber.client_secret;
SUCCESS_TOKEN = null;
REQUEST_ID = null;

var Uber = Meteor.npmRequire('node-uber');
uber = new Uber({
    client_id: ID,
    client_secret: SECRET,
    server_token: TOKEN_UBER,
    redirect_uri: Meteor.absoluteUrl() +'login',
    name: 'Slack-Integration'
});

Meteor.methods({
    authUber: function(AUTHORIZATION_CODE) {
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
            SUCCESS_TOKEN = request.data.access_token;
            var identity = fetchIdentity(SUCCESS_TOKEN);
            postMessage(identity.first_name +' '+ identity.last_name +' logged to Uber with success!');
        } else {
            postMessage('Error during login, please try again.');
        }
        return request;
    }
});

fetchUber = function() {
    return 'https://login.uber.com/oauth/v2/authorize?response_type=code&scope=profile%20request&client_id=' + uber.defaults.client_id;
};

getUberProducts = function(lat, lng, type, access_token){
  var url = "https://sandbox-api.uber.com/v1/products";
  //var access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicHJvZmlsZSIsImhpc3RvcnlfbGl0ZSIsImhpc3RvcnkiXSwic3ViIjoiZjBhNzQ0MTMtM2U3Ni00MWE2LWI2NzQtY2RkMjI3MTcxZWZlIiwiaXNzIjoidWJlci11czEiLCJqdGkiOiI2ZDQwZGU4OC02YjFkLTRkNGUtOGMxYy1kNDcyMDI3OTc0OTMiLCJleHAiOjE0NDcxMTI1MDIsImlhdCI6MTQ0NDUyMDUwMiwidWFjdCI6IkFzb3dkbG9CUko0aExrbWNDVUpxV0xZeURyWlI2USIsIm5iZiI6MTQ0NDUyMDQxMiwiYXVkIjoiNGxsYWxqOU5JSXg5S2NsQk9zYnBwT29JMmh3UmVUczkifQ.O6c_v910FQAUsEeDtJVdFBPyWN0ZlIwE46vlgprmCK0JHe5njvbWl0yz22cylH6irMNocCZQIJwQF9-xsPvAbWzQOGOJ8gWyIE4aalcuRErmxiT6IMw_64t32eDBKcHQT8di1L_7h0iQ8gQjvoLP-OqpmG4CflkBNMD38q-Dres9GQDC79mSZWvt-_VNrs3_UDjVjbDOBpvr7rxJ-Nqew4g37oANhKNPUGv104Up1TSyxRf2xjHIVFDUNLSqcBiK6rR_0QuizpwWWT4SzXJf9AY81XmWCcPGoAPzSB4gk_yLC_yCFEryX8kNeYbAo4ozmNLVvFrLdSA7OPW6OVE-EA";
  var response =  HTTP.get(url, {
        params: {
            access_token: access_token,
            latitude: lat,
            longitude: lng
        }
    });

  var list_uber = new Array();
  for(var i = 0; i < response.data.products.length; i++){
    if(response.data.products[i].display_name = type){
        list_uber.push(response.data.products[i])
    }
  }

  return list_uber;
};

getPriceEstimates = function(starting, ending, access_token) {
  var url = "https://api.uber.com/v1/estimates/price";
  //var access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicHJvZmlsZSIsImhpc3RvcnlfbGl0ZSIsImhpc3RvcnkiXSwic3ViIjoiZjBhNzQ0MTMtM2U3Ni00MWE2LWI2NzQtY2RkMjI3MTcxZWZlIiwiaXNzIjoidWJlci11czEiLCJqdGkiOiI2ZDQwZGU4OC02YjFkLTRkNGUtOGMxYy1kNDcyMDI3OTc0OTMiLCJleHAiOjE0NDcxMTI1MDIsImlhdCI6MTQ0NDUyMDUwMiwidWFjdCI6IkFzb3dkbG9CUko0aExrbWNDVUpxV0xZeURyWlI2USIsIm5iZiI6MTQ0NDUyMDQxMiwiYXVkIjoiNGxsYWxqOU5JSXg5S2NsQk9zYnBwT29JMmh3UmVUczkifQ.O6c_v910FQAUsEeDtJVdFBPyWN0ZlIwE46vlgprmCK0JHe5njvbWl0yz22cylH6irMNocCZQIJwQF9-xsPvAbWzQOGOJ8gWyIE4aalcuRErmxiT6IMw_64t32eDBKcHQT8di1L_7h0iQ8gQjvoLP-OqpmG4CflkBNMD38q-Dres9GQDC79mSZWvt-_VNrs3_UDjVjbDOBpvr7rxJ-Nqew4g37oANhKNPUGv104Up1TSyxRf2xjHIVFDUNLSqcBiK6rR_0QuizpwWWT4SzXJf9AY81XmWCcPGoAPzSB4gk_yLC_yCFEryX8kNeYbAo4ozmNLVvFrLdSA7OPW6OVE-EA";
  var response =  HTTP.get(url, {
        params: {
            access_token: access_token,
            start_latitude: starting.latitude,
            start_longitude: starting.longitude,
            end_latitude: ending.latitude,
            end_longitude: ending.longitude
        }
    });

  var list_uber = new Array();
  for(var i = 0; i < response.data.prices.length; i++){
    if(response.data.prices[i].display_name == 'UberX') {
      list_uber.push(response.data.prices[i]);
    }
  }
  return list_uber;
};

fetchIdentity = function (accessToken) {
  try {
    return HTTP.get("https://api.uber.com/v1/me", {
        headers: { Authorization: 'Bearer ' + accessToken }
    }).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from Uber " + err.message);
  }
};

requestUber = function(driver, latStart, lngStart, latEnd, lngEnd, access_token){

    var params = {
        product_id: driver[0].product_id,
        start_latitude: latStart,
        start_longitude: lngStart,
        end_latitude: latEnd,
        end_longitude: lngEnd
    };
    console.log('parametres', params);

    var response =  HTTP.post('https://sandbox-api.uber.com/v1/requests', {
        data: params,
        headers: {
            Authorization: 'Bearer ' + access_token,
            'Content-Type': 'application/json; charset=utf-8'
        }
    });

    console.log(response);

    REQUEST_ID = response.data.request_id;

    return response;
};

cancelUber = function(requestId, access_token) {
  var response = HTTP.del('https://sandbox-api.uber.com/v1/requests/'+ requestId, {
    headers: { Authorization: 'Bearer ' + access_token }
  });

  return response;
}

