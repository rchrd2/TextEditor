/**
 * Note meteor-headers is unreliable.
 * Headers get lost when server disconnects and a new DDP connection
 * is established. User loses write access to document.
 * So those initial headers need to be stored.
 *
 * @author Richard Caceres, @rchrd2
 */

SessionPermissions = new Mongo.Collection("SessionPermissions");

SessionPermissions.allow({
  insert: function (userId, doc) { return false },
  update: function (userId, doc) { return false },
  remove: function (userId, doc) { return false },
});


/**
 * Clean headers, because undefined values break meteor-headers
 */
function cleanHeaders () {
  WebApp.rawConnectHandlers.use(function (req, res, next) {
    for (var key in req.headers) {
      if (req.headers[key] === undefined) {
        delete req.headers[key];
      }
    }
    return next();
  });
}

function garbageCollectSessions(days) {
  var today = new Date();
	var targetDate = new Date();
	targetDate.setDate(today.getDate() - days);
  SessionPermissions.remove({createdAt: {$lt: targetDate}});
}

Meteor.startup(function () {

  /* Garbage collect old sessions */
  garbageCollectSessions(30);

  Meteor.methods({
    /**
     * Since meteor-headers value dissapear we have to store them in the db
     * @return {String|null}
     */
    initSession: function () {
      var h = headers.get(this);
      var p = h["x-sandstorm-permissions"] || null;
      var id = null;
      if (p !== null) {
        id = SessionPermissions.insert({
          _id: Meteor.uuid(),
          x_sandstorm_permissions: String(p),
          createdAt: new Date(),
        });
        id = String(id);
      }
      return id;
    },

    /**
     * Get the list of permissions
     * @param {String} sessionId
     */
    getSessionPermissions: function (sessionId) {
      check(sessionId, String);
      var doc = SessionPermissions.findOne(sessionId);
      if (doc) {
        return doc.x_sandstorm_permissions;
      } else {
        return "";
      }
    },

    /**
     * @param {sessionid} string
     * @param {Array} types. Check if user has ANY of these permissions
     * @return {Boolean}
     */
    checkSessionPermissions: function (sessionId, types) {
      check(sessionId, String);
      check(types, Array);
      // return false;
      var p = Meteor.call("getSessionPermissions", sessionId);
      for (var i = 0; i < types.length; i++) {
        if (p.indexOf(types[i]) !== -1) {
          return true;
        }
      }
      return false
    }

  });

  cleanHeaders();
});
