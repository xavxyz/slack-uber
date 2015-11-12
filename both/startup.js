/**
 * Created by thomas on 17/10/15.
 */

Meteor.startup(function(){
    var TOKEN_UBER = Meteor.settings.private.uber.server_token;
    var ID = Meteor.settings.private.uber.client_id;
    var SECRET = Meteor.settings.private.uber.client_secret;
    SLACK_QUERY = null;
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

