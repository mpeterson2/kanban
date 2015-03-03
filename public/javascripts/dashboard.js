angular.module('dashboard', ['boards', 'authentication', 'users'])

.controller('DashboardCtrl', ['$scope', 'auth', 'boards', 'users', function($scope, auth, boards, users) {
  $scope.boards = boards.boards;

  boards.all();

  for(var i=0; i<$scope.boards.length; i++) {
    for(var j=0; j<$scope.boards[i].members.length; j++) {
      member = $scope.boards[i].members[j];
      if(member.email)
        member.gravatar = users.getGravatar(member.email);
    }
  }
}]);