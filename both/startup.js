/**
 * Created by thomas on 17/10/15.
 */

Meteor.startup(function(){
    CHANNEL = Meteor.settings.private.slack.channel;
    OPTIONS = Meteor.settings.private.slack.options;
    TOKEN_UBER = Meteor.settings.private.uber.server_token;
    ID = Meteor.settings.private.uber.client_id;
    SECRET = Meteor.settings.private.uber.client_secret;
    SANDBOX = Meteor.settings.private.uber.sandbox;
    SLACK_QUERY = {};
    GEOLOC = 0;
    REQUEST_ID = null;
    var Uber = Meteor.npmRequire('node-uber');
    uber = new Uber({
        client_id: ID,
        client_secret: SECRET,
        server_token: TOKEN_UBER,
        redirect_uri: Meteor.absoluteUrl() +'login',
        name: 'Slack-Integration'
    });
    console.log('Initializing the Slack-Uber integration!');
});

