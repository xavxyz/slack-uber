/**
 * Created by thomas on 17/10/15.
 */

postMessage = function (id, msg) {
    console.log('Posting message', msg);
    SlackAPI.chat.postMessage(Users.findOne({'slack.userId': id}).slack.token, CHANNEL, msg, OPTIONS, function (err, res) {
        console.log("just posted message!", err, res);
    });
};