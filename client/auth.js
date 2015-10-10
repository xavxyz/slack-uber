Template.auth.rendered = function(){
    Meteor.call('fetchUber', function(error, result) {
        if (result) {
            console.log('uber-data', result);
            $('#auth').html(result.content);
        }
        if (error) {
            console.log('uber-data-error', error);
        }
    });
};