Meteor.startup(function () {
  Meteor.methods({
    /**
     * "this.connection.sandstormUser()" is from "accounts-sandstorm" package
     * @param {Array} types. Check if user has ANY of these permissions
     * @return {Boolean}
     */
    checkSandstormUserPermissions: function (types) {
      check(types, Array);
      var sandstormUser = this.connection.sandstormUser();
      if (!sandstormUser) {
        console.log('no sandstormUser');
        return;
      }
      var p = sandstormUser.permissions || "";
      for (var i = 0; i < types.length; i++) {
        if (p.indexOf(types[i]) !== -1) {
          return true;
        }
      }
      return false
    }
  });
});
