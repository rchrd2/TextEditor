/* Define a collection, but will only use one document. */
var Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
const DATA_ID = 'default_id';

if (Meteor.isClient) {
  Meteor.startup(function () {
    // Asynchronously check permission on startup
    Meteor.call('hasPermission', (value) => Session.set('hasPermission', value));
  });

  Template.texteditor.helpers({
    doc: () => Data.findOne(DATA_ID),
    disabled: () => Session.get('hasPermission') === false,
  });

  Template.texteditor.events({
    "input textarea": function(event, template) {
      Data.update(DATA_ID, {$set: { value: event.target.value }});
    },
  });

  // Register these exported collections
  Meteor.subscribe("thedocument");
}

if (Meteor.isServer) {
  /* Use a closure here to get a scope accessible only in server */
  // NOTE this doesn't work either. _hasPermission is shared accross all connected clients
  (function() {
    var _hasPermission = false;

    WebApp.rawConnectHandlers.use(function(req, res, next) {
      //console.log('WebApp.rawConnectHandlers')
      //console.log(req);
      /* Clean headers, because undefined values break the headers lib */
      for (var key in req.headers) {
        if (req.headers[key] === undefined) {
          delete req.headers[key];
        }
        var p = req.headers['x-sandstorm-permissions'] || "";
        _hasPermission = p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
        //Meteor.call('hasPermission', _hasPermission);
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
      hasPermission: () => _hasPermission,
    });
  })();
}
