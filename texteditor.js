var Data = new Mongo.Collection("Data");
var DATA_ID = 'default_id'

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
    user: function () {
      window.$U = Meteor.user();
      return Meteor.user()
    },
    permissions: function () {
      if (Meteor.user()) {
        return JSON.stringify(Meteor.user());
        return Meteor.user().services.sandstorm.permissions.join();
      } else {
        return "";
      }
    }
  });

  Template.texteditor.events({
    /** Handle input */
    "input textarea": function(event, template) {
      if (Meteor.user()) {
        console.log(Meteor.user().services.sandstorm.permissions);
        Meteor.call("updateText", event.target.value);
      }
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {});
}

Meteor.methods({
  updateText: function (text) {
    if ( ! Meteor.user()) {
      throw new Meteor.Error("not-authorized");
    }
    Data.upsert(DATA_ID, {$set: {
      value: text
    }});
  }
});
