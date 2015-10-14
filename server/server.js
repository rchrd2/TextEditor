WebApp.rawConnectHandlers.use(function(req, res, next) {
  //console.log('WebApp.rawConnectHandlers')
  //console.log(req);

  /* Clean headers, because undefined values break the headers lib */
  for (var key in req.headers) {
    if (req.headers[key] === undefined) {
      delete req.headers[key];
    }
  }
  return next();
})

Meteor.startup(function () {
  console.log('Meteor.startup server');
  console.log(arguments);
  var doc = Data.findOne(DATA_ID);
  if ( ! doc) {
    var id = Data.insert({_id: DATA_ID, value: ""});
  }
});


// Publish the document
Meteor.publish("thedocument", () => Data.find(DATA_ID));

/* Permissions */
// Meteor.users.allow({
//   insert: (userId, doc) => false,
//   update: (userId, doc) => false,
//   remove: (userId, doc) => false,
// });
Data.allow({
  insert: (userId, doc) => Meteor.call('hasPermission'),
  update: (userId, doc) => Meteor.call('hasPermission'),
  remove: (userId, doc) => false,
});

Meteor.methods({
  hasPermission: function() {

    // console.log(Meteor.server);
    //console.log("hasPermission", this.connection, this.connection._lastSessionId, this.default_connection);
    console.log("current connection");
    //console.log(Meteor.server.sessions[this.connection.id]);
    console.log(this.connection.httpHeaders);
    var h = headers.get(this);
    console.log(h);
    // console.log(this.default_connection._lastSessionId);
    // var h = headers(this)
    var p = h['x-sandstorm-permissions'] || "";
    //console.log(p);
    var _hasPermission = p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
    console.log(_hasPermission);
    return _hasPermission;
  },
});
