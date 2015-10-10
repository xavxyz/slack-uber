TOKEN = Meteor.settings.private.slack.token;
CHANNEL = Meteor.settings.private.slack.channel;
OPTIONS = Meteor.settings.private.slack.options;

postMessage = function (msg) {
  console.log('Posting message', msg);
  SlackAPI.chat.postMessage(TOKEN, CHANNEL, msg, {}, function (err, res) {
    console.log("just posted message!", err, res);
  });
};

if(Meteor.startup){
  if(Meteor.isServer){
      console.log('initializing the slack-uber integration!');
  }
}