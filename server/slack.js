TOKEN_SLACK = Meteor.settings.private.slack.token;
CHANNEL = Meteor.settings.private.slack.channel;
OPTIONS = Meteor.settings.private.slack.options;

postMessage = function (msg) {
  console.log('Posting message', msg);
  SlackAPI.chat.postMessage(TOKEN_SLACK, CHANNEL, msg, OPTIONS, function (err, res) {
    console.log("just posted message!", err, res);
  });
};

if(Meteor.startup) {
  console.log('initializing the slack-uber integration!');
}