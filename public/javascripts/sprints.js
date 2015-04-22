angular.module('sprints', [])

.controller('SprintModalCtrl', function($scope, sprints, board) {
  $scope.sprint = {
    startDate: new Date(),
    endDate: new Date(),
    transferStories: true
  };

  $scope.addSprint = function() {
    delete $scope.formError;
    var sprint = $scope.sprint;

    if(!sprint || !sprint.startDate || !sprint.endDate) {
      $scope.formError = "Please fill out all of the fields";
      return;
    }

    if(sprint.startDate.getTime() > sprint.endDate.getTime()) {
      $scope.formError = "The start date must be before the end date";
      return;
    }

    sprints.addSprint(board._id, sprint);
  };
})

.factory('sprints', function($http) {
  var o = {
    addSprint: function(boardId, sprint) {
      console.log(boardId);
      console.log(sprint);

      return $http.put('/boards/' + boardId + '/sprint', sprint)
        .success(function(data) {
          console.log(data);
        });
    }
  };

  return o;
});