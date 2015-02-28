angular.module('dashboard', ['boards', 'authentication'])

.controller('DashboardCtrl', ['$scope', 'auth', 'boards', function($scope, auth, boards, userBoards) {
  $scope.hi = "hi";
  console.log(boards.get(0));
}]);