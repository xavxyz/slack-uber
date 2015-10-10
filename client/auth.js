Template.auth.helpers({
    data: function(){
        Meteor.call('fetchUber', function(error, result) {
            if (result) {
                console.log('uber-data', result);
                return HTTP.get(result);
            }
            if (error) {
                console.log('uber-data-error', error);
                return error;
            }
        });
    }
});


