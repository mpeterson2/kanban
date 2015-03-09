angular.module('users', ['md5', 'authentication'])

.factory('users', function(md5, auth) {
  var o = {
    currUser: auth.user,

    getGravatar: function(email) {
      if(email)
        return "https://gravatar.com/avatar/" + md5(email)
    }
  };

  return o;
});