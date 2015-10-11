TOKEN_UBER = Meteor.settings.private.uber.server_token;
ID = Meteor.settings.private.uber.client_id;
SECRET = Meteor.settings.private.uber.client_secret;
SUCCESS_TOKEN = null;

var Uber = Meteor.npmRequire('node-uber');
var uber = new Uber({
    client_id: ID,
    client_secret: SECRET,
    server_token: TOKEN_UBER,
    redirect_uri: 'https://ubot.meteor.com/login',
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
                postMessage('you are login !');
                console.log(success);
                return success;
            }
            if(error){
                postMessage('you are not login !');
                console.log(error);
                return error;
            }
        })
    }
});


