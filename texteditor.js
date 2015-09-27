Data = new Mongo.Collection("Data");

DATA_ID = 'default_id'

if (Meteor.isClient) {

  Template.texteditor.helpers({
    value: function () {
      // Read value from the collection.
      var doc = Data.findOne(DATA_ID);
      if (doc) {
        return doc.value;
      }
    }
  });

  Template.texteditor.events({
    "input textarea": function(event, template) {
      Data.upsert(DATA_ID, {$set: {
        value: event.target.value
      }});
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
