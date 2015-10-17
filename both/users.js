/**
 * Created by thomas on 17/10/15.
 */

Users = new Mongo.Collection('users');

slackSchema = new SimpleSchema({
    userId: {
        type: String,
        optional: false
    },
    name: {
        type: String,
        optional: false
    },
    token: {
        type: String,
        optional: false
    }
});

uberSchema = new SimpleSchema({
    userId: {
        type: String,
        optional: false
    },
    firstName: {
        type: String,
        optional: false
    },
    lastName: {
        type: String,
        optional: false
    },
    picture: {
        type: String,
        optional: false
    },
    email: {
        type: String,
        optional: false
    },
    successToken: {
        type: String,
        optional: false
    },
    tokenCreatedAt: {
        type: Date,
        optional: false
    },
    mainProduct: {
        type: String,
        defaultValue: 'uberX',
        optional: false
    },
    requestId: {
        type: String,
        optional: true
    },
    requestStatus: {
        type: String,
        optional: true
    }
});

coordSchema = new SimpleSchema({
    longitude: {
        type: Number,
        optional: false
    },
    latitude: {
        type: Number,
        optional: false
    }
});

geoLocSchema = new SimpleSchema({
    start: {
        type: coordSchema,
        optional: false
    },
    end: {
        type: coordSchema,
        optional: true
    }
});

userSchema = new SimpleSchema({
    slack: {
        type: [slackSchema],
        optional: false
    },
    uber: {
        type: uberSchema,
        optional: false
    },
    geoLoc: {
        type: geoLocSchema,
        optional: false
    }
});

Meteor.startup(function () {
    Users.attachSchema(userSchema);
});