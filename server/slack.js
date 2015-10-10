TOKEN = Meteor.settings.slack.token;
CHANNEL = Meteor.settings.slack.channel;
OPTIONS = Meteor.settings.slack.options;

postMessage = function (msg) {
  console.log('Posting message', msg);
  SlackAPI.chat.postMessage(TOKEN, CHANNEL, msg, {}, function (err, res) {
    console.log("just posted message!", err, res);
  });
};

if(Meteor.startup){
  if(Meteor.isServer){
    postMessage('initializing the slack-uber integration!');
  }
}

Router.route('/message', function () {
  console.log(this.params.query.text);
  postMessage(this.params.query.text);
  //this.response.end('just posted the following message:' + this.params.query.text + '\n');
}, {where: 'server'});