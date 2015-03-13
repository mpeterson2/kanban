angular.module('users', ['md5', 'authentication'])

.factory('users', function(md5, auth) {
  var o = {
    currUser: auth.user,

    getGravatar: function(email) {
      if(typeof email == 'string')
        return "https://gravatar.com/avatar/" + md5(email);

      // Assume it's a user object
      else
        return "https://gravatar.com/avatar/" + md5(email.email);
    }
  };

  return o;
});