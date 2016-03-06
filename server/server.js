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
  Meteor.publish("thedocument", () => Data.find(DATA_ID, {fields: {value:1, css:1}}));

  /* Client Permissions */
  Data.allow({
    insert: (userId, doc) => false,
    update: (userId, doc) => {
      return Meteor.call("checkSandstormUserPermissions", ["owner", "modify"])
    },
    remove: (userId, doc) => false,
  });
});
