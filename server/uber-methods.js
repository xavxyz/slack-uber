TOKEN_UBER = Meteor.settings.private.uber.server_token;
ID = Meteor.settings.private.uber.client_id;
SECRET = Meteor.settings.private.uber.client_secret;
SUCCESS_TOKEN = null;

var Uber = Meteor.npmRequire('node-uber');
var uber = new Uber({
    client_id: ID,
    client_secret: SECRET,
    server_token: TOKEN_UBER,
    redirect_uri: Meteor.absoluteUrl() + '/login',
    name: 'Slack-Integration'
});

fetchUber = function() {
    return 'https://login.uber.com/oauth/v2/authorize?response_type=code&client_id=' + uber.defaults.client_id;
};


Meteor.methods({
    authUber: function(AUTHORIZATION_CODE){
        HTTP.post('https://login.uber.com/oauth/v2/token', {
            auth: [uber.defaults.client_id, uber.defaults.client_secret].join(':'),
            params: {
                redirect_uri: uber.defaults.redirect_uri,
                code: AUTHORIZATION_CODE,
                grant_type: 'authorization_code'
            }
        }, function(error, success){
            if(success){
                postMessage('Logged in with success!');
                console.log(success);
                uber.defaults.success_token = success.access_token;
                return success;
            }
            if(error){
                postMessage('Error during login, please try again.');
                console.log(error);
                return error;
            }
        })
    }
});

fetchMe = function (accessToken) {
  try {
    return Meteor.http.get("https://api.uber.com/v1/me", {
        headers: { Authorization: 'Bearer ' + accessToken 
        }
    }).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from Uber. " + err.message);
  }
};

getUberProducts = function(lat, lng, type, access_token){
  var url = "https://sandbox-api.uber.com/v1/products";
  //var access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicHJvZmlsZSIsImhpc3RvcnlfbGl0ZSIsImhpc3RvcnkiXSwic3ViIjoiZjBhNzQ0MTMtM2U3Ni00MWE2LWI2NzQtY2RkMjI3MTcxZWZlIiwiaXNzIjoidWJlci11czEiLCJqdGkiOiI2ZDQwZGU4OC02YjFkLTRkNGUtOGMxYy1kNDcyMDI3OTc0OTMiLCJleHAiOjE0NDcxMTI1MDIsImlhdCI6MTQ0NDUyMDUwMiwidWFjdCI6IkFzb3dkbG9CUko0aExrbWNDVUpxV0xZeURyWlI2USIsIm5iZiI6MTQ0NDUyMDQxMiwiYXVkIjoiNGxsYWxqOU5JSXg5S2NsQk9zYnBwT29JMmh3UmVUczkifQ.O6c_v910FQAUsEeDtJVdFBPyWN0ZlIwE46vlgprmCK0JHe5njvbWl0yz22cylH6irMNocCZQIJwQF9-xsPvAbWzQOGOJ8gWyIE4aalcuRErmxiT6IMw_64t32eDBKcHQT8di1L_7h0iQ8gQjvoLP-OqpmG4CflkBNMD38q-Dres9GQDC79mSZWvt-_VNrs3_UDjVjbDOBpvr7rxJ-Nqew4g37oANhKNPUGv104Up1TSyxRf2xjHIVFDUNLSqcBiK6rR_0QuizpwWWT4SzXJf9AY81XmWCcPGoAPzSB4gk_yLC_yCFEryX8kNeYbAo4ozmNLVvFrLdSA7OPW6OVE-EA";
  var response =  HTTP.get('https://sandbox-api.uber.com/v1/products', {
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
}
