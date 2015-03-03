angular.module('boards', [])

.controller('BoardCtrl', ['$scope', '$state', 'boards', function($scope, $state, boards){
  $scope.createBoard = function() {
    boards.create($scope.board).success(function(data) {
      $state.go('dashboard');
    });
  };

}])

.factory('boards', ['$http', function($http) {
  var o = {
    boards: [],

    get: function(id) {
      return o.all()[id];
    },

    all: function(user) {
      return $http.get('/boards').success(function(data) {
        angular.copy(data, o.boards);
      })
    },

    create: function(board) {
      return $http.post('/boards', board);
    }
  };

  return o;
}]);