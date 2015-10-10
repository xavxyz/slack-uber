Router.route('/uber', {
    name: 'uber',
    path: '/uber',
    action: function() {
        this.render('auth');
    }
});

Router.route('/', {
    action: function(){
        if(Meteor.isClient){
            window.open("/uber", "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=500, height=600");
        }
    }
});

Router.route('/message', function () {
  var text = this.params.query.text,
      username = this.params.query.user_name;
  if (text == 'auth') {
    postMessage(username + ' auth to Uber');
  } else if (text == 'request') {
    postMessage(username + ' has requested a Uber');
  } else if (text == 'cancel') {
    postMessage(username + ' cancelled his ride!');
  } else if (text == 'status') {
    postMessage(username + " want to know what's up with his Uber");
  } else {
    this.response.end('Not a valid option! Try `auth`, `request`, `cancel` or `status`');
  }
}, {where: 'server'});

