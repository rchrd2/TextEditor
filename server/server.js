var _hasPermission = false;

WebApp.rawConnectHandlers.use(function(req, res, next) {
  //console.log('WebApp.rawConnectHandlers')
  //console.log(req);
  /* Clean headers, because undefined values break the headers lib */
  for (var key in req.headers) {
    if (req.headers[key] === undefined) {
      delete req.headers[key];
    }
  }
  var p = req.headers['x-sandstorm-permissions'] || "";
  //console.log(p);
  _hasPermission = p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
  //Meteor.call('hasPermission', _hasPermission);
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
Meteor.users.allow({
  insert: (userId, doc) => false,
  update: (userId, doc) => false,
  remove: (userId, doc) => false,
});
Data.allow({
  insert: (userId, doc) => Meteor.call('hasPermission'),
  update: (userId, doc) => Meteor.call('hasPermission'),
  remove: (userId, doc) => false,
});

Meteor.methods({
  hasPermission: () => {
    var h = headers(this)
    var p = h['x-sandstorm-permissions'] || "";
    //console.log(p);
    _hasPermission = p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
    return _hasPermission
  },
});
