/*
 * Define a collection, but will only use one document.
 */
var Data = new Mongo.Collection("Data");

/*
 * Important, do not change DATA_ID or else all apps will lose their data :-X
 */
const DATA_ID = 'default_id';

/**
 * Check if user has sandstorm permissions to edit the document
 * @param {String} userId
 */
var hasPermission = function (userId) {
  var result;
  try {
    var user = Meteor.users.findOne(userId);
    var p = user.services.sandstorm.permissions;
    result = p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
  } catch (err) {
    result = false;
  }
  return result;
}

if (Meteor.isClient) {
  Template.texteditor.helpers({
    doc: function () {
      return Data.findOne(DATA_ID);
    },
    disabled: function() {
      return ! hasPermission(Meteor.userId());
    }
  });

  Template.texteditor.events({
    "input textarea": function(event, template) {
      Data.update(DATA_ID, {$set: { value: event.target.value }});
    },
  });

  // Register these exported collections
  Meteor.subscribe("yourself");
  Meteor.subscribe("thedocument");
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var doc = Data.findOne(DATA_ID);
    if ( ! doc) {
      var id = Data.insert({_id: DATA_ID, value: ""});
    }
  });

  // Include the extra fields, or else they won't be on the client.
  Meteor.publish("yourself", function () {
    if ( ! this.userId) {
      return [];
    } else {
      return Meteor.users.find(this.userId, {fields: {"services.sandstorm": 1}});
    }
  });

  // Publish the document
  Meteor.publish("thedocument", function () {
    return Data.find(DATA_ID);
  });

  // Restrict direct client updating of models
  Meteor.users.allow({
    insert: function (userId, doc) { return false; },
    update: function (userId, doc) { return false; },
    remove: function (userId, doc) { return false; }
  });
  Data.allow({
    insert: function (userId, doc) {
      return hasPermission(userId);
    },
    update: function (userId, doc) {
      return hasPermission(userId);
    },
    remove: function(userId, doc) { return false; }
  });
}
