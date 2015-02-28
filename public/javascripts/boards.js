angular.module('boards', [])

.factory('boards', ['$http', function($http) {
  var o = {

    get: function(id) {
      return o.all()[id];
    },

    all: function(user) {
      return [
              {
                title: 'Name',
                members: [{username: 'user', _id: '123'}, {username: 'user2', _id: '123'}],
                tasks: [{title: 'Title', description: 'This is a long description'}],
                date: 123
              }
              ];
    }

  };

  return o;
}]);