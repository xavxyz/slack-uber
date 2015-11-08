postMessage = function (msg) {
    console.log('Posting message', msg);
    SlackAPI.chat.postMessage(
        'xoxp-12714960178-12710747189-14122745473-a38eb7d400',
        '#sandbox', //Dans la collection on a l'ID, faire la méthode d'ID à un nom
        msg, Meteor.settings.private.slack.options, function (err, res) {
        console.log("just posted message!", err, res);
    });
};

// 'xoxp-12253993478-12262981296-12261625907-0667a2cdba'