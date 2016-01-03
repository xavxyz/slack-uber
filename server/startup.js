Meteor.startup(function(){
    var TOKEN_UBER = Meteor.settings.private.uber.server_token;
    var ID = Meteor.settings.private.uber.client_id;
    var SECRET = Meteor.settings.private.uber.client_secret;
    var UberNode = Meteor.npmRequire('node-uber');
    uberSettings = new UberNode({
        client_id: ID,
        client_secret: SECRET,
        server_token: TOKEN_UBER,
        redirect_uri: Meteor.absoluteUrl() + 'login',
        name: 'Slack-Integration'
    });
    console.log('Initializing the Slack-Uber integration!');
    //Slack.postMessage('Initializing the Slack-Uber integration!');
});

