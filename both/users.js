/**
 * Created by thomas on 17/10/15.
 */

Users = new Mongo.Collection('users');

slackSchema = new SimpleSchema({
    userId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

uberSchema = new SimpleSchema({
    userId: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    successToken: {
        type: String,
        required: false
    },
    tokenCreatedAt: {
        type: Date,
        required: false
    },
    mainProduct: {
        type: String,
        defaultValue: 'uberX',
        required: true
    },
    requestId: {
        type: String,
        required: false
    },
    requestStatus: {
        type: String,
        required: false
    }
});

coordSchema = new SimpleSchema({
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    }
});

geoLocSchema = new SimpleSchema({
    start: {
        type: coordSchema,
        required: true
    },
    end: {
        type: coordSchema,
        required: false
    }
});

userSchema = new SimpleSchema({
    slack: {
        type: [slackSchema],
        required: true
    },
    uber: {
        type: uberSchema,
        required: true
    },
    geoLoc: {
        type: geoLocSchema,
        required: true
    }
});

Meteor.startup(function () {
    Users.attachSchema(userSchema);
});