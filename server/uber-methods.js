Meteor.methods({
  fetchUber: function() {
      var Uber = Meteor.npmRequire('node-uber');
      var uber = new Uber({
          client_id: '4llalj9NIIx9KclBOsbppOoI2hwReTs9',
          client_secret: 'fTfqOBqm_v-38q_oAbTnHP70n0fRoT44SSRChtkY',
          server_token: 'YLprrU0WQ_7alLuc88DfnPx4e0gwTx_dZVFiWCgN',
          redirect_uri: 'http://localhost:3000',
          name: 'Slack-Integration'
      });
      return uber.getAuthorizeUrl(['profile']);
  }
});
