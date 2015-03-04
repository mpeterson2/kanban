angular.module('boards', [])

.controller('BoardCtrl', ['$scope', '$state', '$stateParams', 'boards', function($scope, $state, $stateParams, boards){
  $scope.board = boards.board;
  if($stateParams.boardId) {
    boards.get($stateParams.boardId).error(function(error, status) {
      $state.go('error/' + status);
    });
  }

  $scope.createBoard = function() {
    boards.create($scope.board).success(function(data) {
      $state.go('dashboard');
    });
  };

}])

.factory('boards', ['$http', function($http) {
  var o = {
    board: {},
    boards: [],

    get: function(id) {
      return $http.get('/boards/' + id).success(function(data) {
        console.log(data);
        angular.copy(data, o.board);
      });
    },

    all: function(user) {
      return $http.get('/boards').success(function(data) {
        angular.copy(data, o.boards);
      });
    },

    create: function(board) {
      return $http.post('/boards', board);
    }
  };

  return o;
}]);