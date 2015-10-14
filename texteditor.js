/* Define a collection, but will only use one document. */
var Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
const DATA_ID = 'default_id';

if (Meteor.isClient) {

  Template.texteditor.helpers({
    doc: () => Data.findOne(DATA_ID),
    disabled: () => ! hasPermission()
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
  /* Clean headers, because undefined values break the headers lib */
  WebApp.rawConnectHandlers.use(function(req, res, next) {
    for (var key in req.headers) {
      if (req.headers[key] === undefined) {
        delete req.headers[key];
      }
    }
    return next();
  })

  Meteor.startup(function () {
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
    insert: (userId, doc) => hasPermission(),
    update: (userId, doc) => hasPermission(),
    remove: (userId, doc) => false,
  });
}

Meteor.methods({
  hasPermission: function () {
    console.log('isserver');
    console.log(headers);
    var self = this;
    var h = headers.get(self)
    console.log(h);
    var p = h['x-sandstorm-permissions'] || "";
    var result = p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
    return result;
  },

});

/**
 * Check if user has sandstorm permissions to edit the document
 * @param {String} userId
 */
var hasPermission = function () {
  return Meteor.call('hasPermission');
}
