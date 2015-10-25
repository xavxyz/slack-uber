///ping to keep alive
Meteor.setInterval(function() {
  Meteor.http.get(Meteor.absoluteUrl());
  console.log('ping site')
}, 300000); // every 5 minutes (300000)