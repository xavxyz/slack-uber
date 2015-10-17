/**
 * Created by thomas on 17/10/15.
 */

postMessage = function ( msg) {
    console.log('Posting message', msg);
    SlackAPI.chat.postMessage(
        'xoxp-12253993478-12262981296-12261625907-0667a2cdba',
        '#uber', //Dans la collection on a l'ID, faire la méthode d'ID à un nom
        msg, OPTIONS, function (err, res) {
        console.log("just posted message!", err, res);
    });
};

// 'xoxp-12253993478-12262981296-12261625907-0667a2cdba'