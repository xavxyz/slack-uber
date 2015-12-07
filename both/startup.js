Meteor.startup(function(){
    var TOKEN_UBER = Meteor.settings.private.uber.server_token;
    var ID = Meteor.settings.private.uber.client_id;
    var SECRET = Meteor.settings.private.uber.client_secret;
    SLACK_QUERY = null;
    TYPE_UBER_LIST = ['uberX', 'uberXL', 'UberBLACK', 'UberSUV', 'UberTAXI'];
    TYPE_UBER_NULL = [];
    var Uber = Meteor.npmRequire('node-uber');
    uber = new Uber({
        client_id: ID,
        client_secret: SECRET,
        server_token: TOKEN_UBER,
        redirect_uri: Meteor.absoluteUrl() + 'login',
        name: 'Slack-Integration' 
    });
    console.log('Initializing the Slack-Uber integration!');
    postMessage('Initializing the Slack-Uber integration!');
});

