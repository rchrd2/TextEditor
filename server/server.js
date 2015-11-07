Meteor.startup(function () {
  /* Document initialization */
  var doc = Data.findOne(DATA_ID);
  if ( ! doc) {
    var id = Data.insert({
      _id: DATA_ID,
      value: "",
      css: DEFAULT_CSS,
    });
  } else {
    /* Init css for upgraded documents */
    if ( ! doc.hasOwnProperty("css")) {
      Data.update(DATA_ID, {$set: { css: DEFAULT_CSS }});
    }
  }

  /* Publish the document */
  Meteor.publish("thedocument", () => Data.find(DATA_ID));

  /* Client Permissions */
  Data.allow({
    insert: (userId, doc) => false,
    update: (userId, doc) => false,
    remove: (userId, doc) => false,
  });

  Meteor.methods({
    updateText: function (sessionId, value) {
      check(value, String);
      check(Meteor.call("checkSessionPermissions", sessionId, ["owner", "modify"]), true);
      Data.update(DATA_ID, {$set: { value: value }});
    },
    updateCss: function (sessionId, value) {
      check(value, String);
      check(Meteor.call("checkSessionPermissions", sessionId, ["owner", "modify"]), true);
      Data.update(DATA_ID, {$set: { css: value }});
    },
  });
});
