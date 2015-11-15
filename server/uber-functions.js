Uber.auth.link = function() {
  return 'https://login.uber.com/oauth/v2/authorize?response_type=code&scope=profile%20request&client_id=' + uber.defaults.client_id;
};

Uber.auth.details = function (accessToken) {
  try {
    return HTTP.get("https://api.uber.com/v1/me", {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from Uber " + err.message);
  }
};

Uber.estimatePrice = function(starting, ending, access_token) {
    var url = "https://api.uber.com/v1/estimates/price";
    var response = HTTP.get(url, {
        params: {
            access_token: access_token,
            start_latitude: starting.latitude,
            start_longitude: starting.longitude,
            end_latitude: ending.latitude,
            end_longitude: ending.longitude
        }
    });

    var list_uber = [];
    for (var i = 0; i < response.data.prices.length; i++) {
        if (response.data.prices[i].display_name == 'uberX') {
            list_uber.push(response.data.prices[i]);
        }
    }

    console.log(list_uber);

    var mind = list_uber[0].duration % (60 * 60);

    var estimation = {
        minutes: Math.floor(mind / 60),
        estimate: list_uber[0].estimate
    };

    return estimation;
};

Uber.getProducts = function(lat, lng, type, access_token){
    if (!Meteor.settings.private.uber.sandbox) {
        url = 'https://api.uber.com/v1/products';
    } else {
        url = 'https://sandbox-api.uber.com/v1/products';
    }
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

Uber.isStatus = function(status) {
  var list = ['processing', 'accepted', 'arriving', 'in_progress', 'driver_canceled', 'completed'];

  return list.indexOf(status) > -1;
};

Uber.isProduct =  function(product) {
  var list = ['uberX', 'uberXL', 'UberBLACK', 'UberSUV', 'UberTAXI'];

  return list.indexOf(product) > -1;
};

Uber.request.create = function(driver, latStart, lngStart, latEnd, lngEnd, access_token, surge_confirmation_id){
    var params;
    if(surge_confirmation_id){
        params = {
            product_id: driver[0].product_id,
            start_latitude: latStart,
            start_longitude: lngStart,
            end_latitude: latEnd,
            end_longitude: lngEnd,
            surge_confirmation_id: surge_confirmation_id
        };
    }else{
        params = {
            product_id: driver[0].product_id,
            start_latitude: latStart,
            start_longitude: lngStart,
            end_latitude: latEnd,
            end_longitude: lngEnd
        };
    }

    try {
        if (!Meteor.settings.private.uber.sandbox) {
            url = 'https://api.uber.com/v1/requests';
        } else {
            url = 'https://sandbox-api.uber.com/v1/requests';
        }
        var response = HTTP.post(url, {
            data: params,
            headers: {
                Authorization: 'Bearer ' + access_token,
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        Users.update({
            "uber.successToken": access_token
        },
            {$set: {
                "uber.requestId": response.data.request_id,
                "uber.requestStatus": response.data.status
            }}
        );

        return response;

    } catch (err) {
        console.log('error', err);
        return err;
    }
};

Uber.request.cancel = function(userId, requestId, access_token) {
    var response = HTTP.del('https://api.uber.com/v1/requests/'+ requestId, {
        headers: { Authorization: 'Bearer ' + access_token }
    });
    Users.update({
            "uber.successToken": access_token
        },
        {$set: {
            "uber.requestId": '',
            "uber.requestStatus": ''
        }}, function(error, result){
            console.log(error);
            console.log(result);
        }
    );
    return response;
};

Uber.request.details = function(id_request, access_token){
    var details = HTTP.get('https://sandbox-api.uber.com/v1/requests/'+ id_request, {
        headers: {
            Authorization: 'Bearer ' + access_token,
            'Content-Type': 'application/json; charset=utf-8'
        },
        params: {
            request_id: id_request
        }
    });
    return details.data;
};

Uber.request.map = function(id_request, access_token){
    return  HTTP.get('https://sandbox-api.uber.com/v1/requests/'+ id_request+'/map/', {
        headers: {
            Authorization: 'Bearer ' + access_token,
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
};

Uber.request.status.update = function(id_request, status, access_token) {
  Users.update({
      "uber.successToken": access_token
    },
    {$set: {
      "uber.requestStatus": status
    }}
  );
};

Uber.request.status.force = function(id_request, status, access_token) {
  var body = JSON.stringify({
    status: status
  });

  return HTTP.put('https://sandbox-api.uber.com/v1/sandbox/requests/'+ id_request, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + access_token
    },
    content: body
  });
};