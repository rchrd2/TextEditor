/* Define a collection, but will only use one document. */
Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
DATA_ID = "default_id";

/* The default CSS for new documents */
DEFAULT_CSS_FONT_SIZE = "16px";
DEFAULT_CSS_FONT_FAMILY = "Menlo, monospace";
DEFAULT_CSS = `font-family: ${DEFAULT_CSS_FONT_FAMILY};
font-size: ${DEFAULT_CSS_FONT_SIZE};
background-color: #FFFFFF;
color: #000000;
`;


Meteor.startup(function () {
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

  /* Permissions */
  Data.allow({
    insert: (userId, doc) => Meteor.call("hasPermission"),
    update: (userId, doc) => Meteor.call("hasPermission"),
    remove: (userId, doc) => false,
  });

  Meteor.methods({
    /* Note function() {}, so `this` gets bound correctly */
    // TODO make headers work again.
    hasPermission: function () {
      return true;
      var h = headers.get(this);
      var p = h["x-sandstorm-permissions"] || "";
      return p.indexOf("modify") !== -1 || p.indexOf("owner") !== -1;
    },
  });

});
