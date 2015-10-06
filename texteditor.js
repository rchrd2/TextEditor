/*
 * Define a collection, but will only use one document.
 */
var Data = new Mongo.Collection("Data");

/*
 * Important, do not change DATA_ID or else all apps will lose their data :-X
 */
var DATA_ID = 'default_id';

/**
 * Find a user who has the permission properties
 * @param {String} userId
 */
var hasPermission = function(userId) {
  //return true; // TODO
  var result;
  try {
    // Try to access deeply nested property
    var user = Meteor.users.findOne(userId);
    result = user.services.sandstorm.permissions.indexOf('modify') != -1;
  } catch (err) {
    result = false;
  }
  return result;
}


if (Meteor.isClient) {

  Template.texteditor.helpers({
    value: function () {
      var doc = Data.findOne(DATA_ID);
      if (doc) {
        return doc.value;
      } else {
        return "";
      }
    },
    disabled: function() {
      return ! hasPermission(Meteor.userId());
    }
  });

  Template.texteditor.events({
    "input textarea": function(event, template) {
      if ( ! hasPermission(Meteor.userId())) {
        throw new Meteor.Error("not-authorized");
      }
      Meteor.call("updateText", event.target.value);
    },
  });

  // Register these exported collections
  Meteor.subscribe("yourself");
  Meteor.subscribe("thedocument");
}

if (Meteor.isServer) {
  Meteor.startup(function () {});

  // Publish the user with special Sandstorm permissions
  Meteor.publish("yourself", function () {
    if ( ! this.userId) {
      return [];
    } else {
      // Include the extra fields, or else they won't be on the client.
      return Meteor.users.find(this.userId, {fields: {"services.sandstorm": 1}});
    }
  });

  // Publish the document
  Meteor.publish("thedocument", function () {
    return Data.find(DATA_ID);
  });
}

/**
 * @note Defines functions that can be invoked over the network by clients.
 */
Meteor.methods({
  updateText: function (text) {
    if ( ! hasPermission(Meteor.userId())) {
      throw new Meteor.Error("not-authorized");
    }
    Data.upsert(DATA_ID, {$set: { value: text }});
  }
});
