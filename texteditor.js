/* Define a collection, but will only use one document. */
Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
DATA_ID = 'default_id';

/* The default CSS for new documents */
DEFAULT_CSS_FONT_SIZE = "16px";
DEFAULT_CSS_FONT_FAMILY = "Menlo, monospace";
DEFAULT_CSS = `font-family: ${DEFAULT_CSS_FONT_FAMILY};
font-size: ${DEFAULT_CSS_FONT_SIZE};
background-color: #FFFFFF;
color: #000000;
`;

function initClient () {
  var _hasPermissionCache = false;

  Meteor.startup(function () {
    /* Asynchronously check permission on startup */
    Meteor.call('hasPermission', (error, result) => {
      _hasPermissionCache = result;
    });

    Session.set({
      "isCssOpened": false,
      "fontSize": DEFAULT_CSS_FONT_SIZE,
      "fontFamily": DEFAULT_CSS_FONT_FAMILY
    });
  });

  Template.texteditor.helpers({
    doc: () => Data.findOne(DATA_ID),
    disabled: () => _hasPermissionCache !== true,
    fontSize: () => Session.get("fontSize"),
    fontFamily: () => Session.get("fontFamily"),
    isCssOpened: () => Session.get("isCssOpened"),
    isConnected: () => Meteor.status().connected,
  });

  Template.texteditor.events({
    "input #textarea": function (e, template) {
      Data.update(DATA_ID, {$set: { value: e.target.value }});
    },

    "click #collapse-button": function (e, template) {
      Session.set("isCssOpened", ! Session.get("isCssOpened"));
      e.preventDefault();
      return false;
    },

    /* Handle raw css editing */
    "input #css-textarea": function (e, template) {
      var ta = document.getElementById('textarea');
      ta.style.cssText = e.target.value;
      Data.update(DATA_ID, {$set: { css: e.target.value }});
    },

    /* Swap color and background-color */
    "click #toggle-light-button": function (e, template) {
      e.preventDefault();
      var ta = document.getElementById("textarea");
      var color = ta.style.color || "#000000";
      var bgColor = ta.style.backgroundColor || "#FFFFFF";
      ta.style.backgroundColor = color;
      ta.style.color = bgColor;
      Data.update(DATA_ID, {$set: { css: ta.style.cssText }});
    },

    /* Update font-family from selection */
    "change select[name=font-family]": function (e, template) {
      e.preventDefault();
      var ta = document.getElementById("textarea");
      var value = e.currentTarget.options[e.currentTarget.selectedIndex].value;
      ta.style.fontFamily = value;
      Data.update(DATA_ID, {$set: { css: ta.style.cssText }});
    },

    /* Update font-size from selection */
    "change select[name=font-size]": function (e, template) {
      e.preventDefault();
      var ta = document.getElementById("textarea");
      ta.style.fontSize = e.currentTarget.options[e.currentTarget.selectedIndex].value;
      Data.update(DATA_ID, {$set: { css: ta.style.cssText }});
    }
  });

  /* Session needs to be updated for the form. Also update body bg-color */
  var updateSessionFromStyleChange = function (el) {
    Session.set({
      "fontSize": el.style.fontSize || DEFAULT_CSS_FONT_SIZE,
      "fontFamily": el.style.fontFamily || DEFAULT_CSS_FONT_FAMILY,
    });
    document.body.style.backgroundColor = el.style.backgroundColor || null;
  }

  /* Register these exported collections */
  Meteor.subscribe("thedocument", function() {
    /* Init style from doc css */
    var doc = Data.findOne(DATA_ID);
    var el = document.getElementById("textarea");
    el.style.cssText = doc.css;
    updateSessionFromStyleChange(el);
  });

  /* Listen to changes to the document */
  Data.find(DATA_ID).observeChanges({
    changed: function(_id, changes) {
      if ("css" in changes) {
        var el = document.getElementById("textarea");
        el.style.cssText = changes.css;
        updateSessionFromStyleChange(el);
      }
    },
  });

}

function initServer () {
  /* Clean headers, because undefined values break the headers lib */
  WebApp.rawConnectHandlers.use(function (req, res, next) {
    for (var key in req.headers) {
      if (req.headers[key] === undefined) {
        delete req.headers[key];
      }
    }
    return next();
  });

  Meteor.startup(function () {
    var doc = Data.findOne(DATA_ID);
    if ( ! doc) {
      var id = Data.insert({
        _id: DATA_ID,
        value: "",
        css: DEFAULT_CSS,
      });
    }
    /* Init css for upgraded documents */
    if ( ! doc.hasOwnProperty('css')) {
      Data.update(DATA_ID, {$set: { css: DEFAULT_CSS }});
    }
  });

  /* Publish the document */
  Meteor.publish("thedocument", () => Data.find(DATA_ID));

  /* Permissions */
  Data.allow({
    insert: (userId, doc) => Meteor.call('hasPermission'),
    update: (userId, doc) => Meteor.call('hasPermission'),
    remove: (userId, doc) => false,
  });

  Meteor.methods({
    /* Note function() {}, so `this` gets bound correctly */
    hasPermission: function () {
      var h = headers.get(this);
      var p = h['x-sandstorm-permissions'] || "";
      return p.indexOf('modify') !== -1 || p.indexOf('owner') !== -1;
    },
  });
}

UI.registerHelper('selected', function(key, value){
  return key == value? {selected:'selected'}: '';
});


if (Meteor.isClient) {
  initClient();
}

if (Meteor.isServer) {
  initServer();
}
