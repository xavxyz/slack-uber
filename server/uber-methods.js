Meteor.methods({
  fetchUber: function() {
    var errorJson, result, url;
    // url = 'https://api.forecast.io/forecast/' + process.env.FORECAST_API_KEY + '/' + location;
    url = 'https://login.uber.com/oauth/v2/authorize';
    result = HTTP.get(url);
    if (result.statusCode === 200) {
      return JSON.parse(result.content);
    } else {
      errorJson = JSON.parse(result.content);
      throw new Meteor.Error(result.statusCode, errorJson.error);
    }
  }
});
