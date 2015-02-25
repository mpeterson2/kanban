angular.module('users', ['ui.gravatar', 'auth'])

.factory('users', ['auth', function(login) {
  var o = {
    currUser = login.user
  };

  return o;
}])