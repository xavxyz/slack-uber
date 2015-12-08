Slack = (function Slack() {
  function postMessage(msg) {
    SlackAPI.chat.postMessage(
      'xoxp-12714960178-12710747189-14122745473-a38eb7d400',
      '#sandbox', //Dans la collection on a l'ID, faire la méthode d'ID à un nom
      msg, Meteor.settings.private.slack.options, function (err, res) {
        console.log("just posted message!", err, res.message.text);
      });
  }

  return {
    postMessage: postMessage
  }
}());


