TOKEN = Meteor.settings.private.uber.server_token;
ID = Meteor.settings.private.uber.client_id;
SECRET = Meteor.settings.private.uber.client_secret;

Meteor.methods({
  fetchUber: function() {
      var Uber = Meteor.npmRequire('node-uber');
      var uber = new Uber({
          client_id: ID,
          client_secret: TOKEN,
          server_token: SECRET,
          redirect_uri: 'http://localhost:3000',
          name: 'Slack-Integration'
      });
      return HTTP.get(uber.getAuthorizeUrl(['profile']));
  }
});
