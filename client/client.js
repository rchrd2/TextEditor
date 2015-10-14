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
  "input textarea": function(event, template) {
    Data.update(DATA_ID, {$set: { value: event.target.value }});
  },
});

// Register these exported collections
Meteor.subscribe("thedocument");
