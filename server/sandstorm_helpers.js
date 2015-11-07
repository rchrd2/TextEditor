/**
 * Note meteor-headers is unreliable.
 * Headers get lost when server disconnects and a new DDP connection
 * is established. User loses write access to document.
 * So those initial headers need to be stored.
 *
 * @author Richard Caceres, @rchrd2
 */

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

Meteor.startup(function () {

  Meteor.methods({

    /**
     * Since meteor-headers value dissapear we have to store them in the db
     * It relies on the global variable Meteor.user()
     */
    updateUserHeaderPermissions: function () {
      // console.log("server.updatePermissions", Meteor.user());
      var h = headers.get(this);
      var p = h["x-sandstorm-permissions"] || null;
      if (p !== null && Meteor.user()) {
        Meteor.users.update({_id: Meteor.user()._id}, {$set:{"permissions": String(p)}});
      }
    },

    /**
     * @param {Array} types. Check if user has ANY of these permissions
     * @return {Boolean}
     */
    checkUserPermissions: function (userId, types) {
      // console.log("checkUserPermissions", userId);
      check(userId, String);
      check(types, Array);
      var user = Meteor.users.findOne(userId);
      var p = user.permissions || "";
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
