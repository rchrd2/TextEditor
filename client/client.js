var _hasPermissionCache = false;

Meteor.startup(function () {
  // Asynchronously check permission on startup
  console.log("client startup");
  console.log(Meteor.call('hasPermission'));
  // Meteor.call('hasPermission', (error, result) => {
  //   console.log('result');
  //   console.log(result);
  //   _hasPermissionCache = result;
  // });
});

Template.texteditor.helpers({
  doc: () => Data.findOne(DATA_ID),
  //disabled: () => Session.get('hasPermission') === false,
  /disabled: () => _hasPermissionCache !== true,
  // disabled: () => {
  //   console.log(Meteor.call('hasPermission'));
  //   return Meteor.call('hasPermission') !== true
  // },
  //disabled: Meteor.call('hasPermission') !== true,
});

Template.texteditor.events({
  "input textarea": function(event, template) {
    Data.update(DATA_ID, {$set: { value: event.target.value }});
  },
});

// Register these exported collections
Meteor.subscribe("thedocument");
