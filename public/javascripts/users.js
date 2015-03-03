angular.module('users', ['md5', 'authentication'])

.factory('users', ['md5', 'auth', function(md5, login) {
  var o = {
    currUser: login.user,

    getGravatar: function(email) {
      if(email)
        return "https://gravatar.com/avatar/" + md5(email)
    }
  };

  return o;
}])