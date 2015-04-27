angular.module('users', [])

.factory('users', function($http){
  var o = {
    getUser: function(username) {
      return $http.get('/users/' + username);
    }
  };

  return o;
})