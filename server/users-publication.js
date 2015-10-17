Meteor.publish('usersAll', function() {
    return CURRENT_USER.find({});
});
