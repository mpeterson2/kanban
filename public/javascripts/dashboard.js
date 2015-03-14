angular.module('dashboard', ['boards', 'authentication'])

.controller('DashboardCtrl', function($scope, $state, auth, boards) {
  $scope.boards = boards.boards;

  boards.all().error(function() {
    $state.go('login');
  });

});