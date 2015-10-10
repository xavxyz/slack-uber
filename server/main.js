Meteor.startup(function() {
  return Router.map(function() {
    this.route('uber', {
      where: 'server',
      path: "/uber",
      action: function() {
        var that;
        that = this;
        return Meteor.call('fetchUber', function(error, result) {
          // var summaryGraphic;
          if (result) {
            console.log('uber-data', result);
          }
          if (error) {
            console.log('uber-data-error', error);
          }
          if (error) {
            return;
          }
          // summaryGraphic = function() {
          //   switch (result.currently.icon) {
          //     case 'snow':
          //       return '*.*.*.*.*.*.*';
          //     case 'rain':
          //     case 'sleet':
          //       return '/////////////';
          //     case 'wind':
          //       return '~ ~ ~ ~ ~ ~ ~';
          //     case 'fog':
          //       return 'o O o O o O o';
          //     case 'cloudy':
          //     case 'partly-cloudy-day':
          //     case 'partly-cloudy-night':
          //       return 'o O o O o O o';
          //     default:
          //       return '';
          //   }
          // };
          that.response.writeHead(200, {
            'Content-Type': 'text/html'
          });
          return that.response.end("Uber ready");
        });
      }
    });
  });
});
