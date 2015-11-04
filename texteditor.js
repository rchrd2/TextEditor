/* Define a collection, but will only use one document. */
Data = new Mongo.Collection("Data");

/* Important, do not change DATA_ID or else all apps will lose their data */
DATA_ID = 'default_id';

function initClient () {
  var _hasPermissionCache = false;

  Meteor.startup(function () {
    // Asynchronously check permission on startup
    Meteor.call('hasPermission', (error, result) => {
      _hasPermissionCache = result;
    });

    Session.set({
      "isCssOpened": false,
      "fontSize": "16px",
      "fontFamily": "monospace",
    });
  });

  Template.texteditor.rendered = function () {
    //  document.createElement('textarea');
    var ta = document.getElementById('textarea');
    Session.set({
      "fontSize": ta.style.fontSize,
      "fontFamily": ta.style.fontFamily,
    })
  };

  Template.texteditor.helpers({
    doc: () => Data.findOne(DATA_ID),
    disabled: () => _hasPermissionCache !== true,
    fontSize: () => Session.get("fontSize"),
    fontFamily: () => Session.get("fontFamily"),
    isCssOpened: () => Session.get("isCssOpened"),
    isConnected: () => Meteor.status().connected,
  });

  Template.texteditor.events({
    "input #textarea": function (event, template) {
      Data.update(DATA_ID, {$set: { value: event.target.value }});
    },

    "input #css-textarea": function (event, template) {
      Data.update(DATA_ID, {$set: { css: event.target.value }});
    },

    "click #collapse-button": function (event, template) {
      Session.set("isCssOpened", ! Session.get("isCssOpened"));
      event.preventDefault();
      return false;
    },

    "click #toggle-light-button": function (event, template) {
      var ta = document.getElementById('textarea');
      var color = ta.style.color || "#000000";
      var bgColor = ta.style.backgroundColor || "#FFFFFF";
      ta.style.backgroundColor = color;
      ta.style.color = bgColor;
      Data.update(DATA_ID, {$set: { css: ta.style.cssText }});
      event.preventDefault();
      return false;
    },

    "change select[name=font-family]": function (e, template) {
      var ta = document.getElementById('textarea');
      var value = e.currentTarget.options[e.currentTarget.selectedIndex].value;
      ta.style.fontFamily = value;
      Session.set({
        "fontSize": ta.style.fontSize,
        "fontFamily": ta.style.fontFamily,
      });
      Data.update(DATA_ID, {$set: { css: ta.style.cssText }});
      event.preventDefault();
      return false;
    },

    "change select[name=font-size]": function (e, template) {
      var ta = document.getElementById('textarea');
      ta.style.fontSize = e.currentTarget.options[e.currentTarget.selectedIndex].value;
      Session.set({
        "fontSize": ta.style.fontSize,
        "fontFamily": ta.style.fontFamily,
      });
      Data.update(DATA_ID, {$set: { css: ta.style.cssText }});
      event.preventDefault();
      return false;
    }
  });

  // Register these exported collections
  Meteor.subscribe("thedocument");
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
        css: `font-family: Menlo, monospace;
font-size: 16px;
background-color: #FFFFFF;
color: #000000;
`,
      });
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
    /**
     * Note it's important to use an old-school function() {}, so `this` gets
     * bound correctly
     */
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
