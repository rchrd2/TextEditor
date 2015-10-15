/* Define a collection, but will only use one document. */
Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
DATA_ID = 'default_id';

function initClient () {
  var _hasPermissionCache = false;

  Meteor.startup(function () {
    // Asynchronously check permission on startup
    Meteor.call('hasPermission', (error, result) => {
      _hasPermissionCache = result;
    });
  });

  Template.texteditor.helpers({
    doc: () => Data.findOne(DATA_ID),
    disabled: () => _hasPermissionCache !== true,
  });

  Template.texteditor.events({
    "input textarea": function (event, template) {
      Data.update(DATA_ID, {$set: { value: event.target.value }});
    },
  });

  // Register these exported collections
  Meteor.subscribe("thedocument");
}

function initServer () {
  /* Clean headers, because undefined values break the headers lib */
  WebApp.rawConnectHandlers.use(function (req, res, next) {
    for (var key in req.headers) {
      if (req.headers[key] === undefined) {
        delete req.headers[key];
      }
    }
    return next();
  });

  Meteor.startup(function () {
    var doc = Data.findOne(DATA_ID);
    if ( ! doc) {
      var id = Data.insert({_id: DATA_ID, value: ""});
    }
  });

  /* Publish the document */
  Meteor.publish("thedocument", () => Data.find(DATA_ID));

  /* Permissions */
  Data.allow({
    insert: (userId, doc) => Meteor.call('hasPermission'),
    update: (userId, doc) => Meteor.call('hasPermission'),
    remove: (userId, doc) => false,
  });

  Meteor.methods({
    /**
     * Note it's important to use an old-school function() {}, so `this` gets
     * bound correctly
     */
    hasPermission: function () {
      var h = headers.get(this);
      var p = h['x-sandstorm-permissions'] || "";
      return p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
    },
  });
}


if (Meteor.isClient) {
  initClient();
}

if (Meteor.isServer) {
  initServer();
}
