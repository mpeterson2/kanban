angular.module('sprints', [])

.controller('SprintModalCtrl', function($scope, $modalInstance, $state, sprints, board) {
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

    sprints.create(board._id, sprint).success(function(sprint) {
      $modalInstance.close();
    });
  };
})

.factory('sprints', function($http, socket) {
  var o = {
    sprint: {},

    create: function(boardId, sprint) {
      return $http.put('/boards/' + boardId + '/sprint', sprint);
    },

    get: function(boardId, sprintId) {
      return $http.get('/boards/' + boardId + '/sprint/' + sprintId).success(function(data) {
        o.setSprint(boardId, data);
      });
    },

    getCurrent: function(boardId) {
      return $http.get('/boards/' + boardId + '/sprint/current').success(function(data) {
        o.setSprint(boardId, data);
      });
    },

    getByIndex: function(boardId, index) {
      return $http.get('/boards/' + boardId + '/sprint/index/' + index).success(function(data) {
        o.setSprint(boardId, data);
      });
    },

    setSprint: function(boardId, data) {
        angular.copy(data, o.sprint);
        socket.emit('connect-to', {boardId: boardId, sprintId: data._id});

        var todo = o.sprint.todo;
        var develop = o.sprint.develop;
        var test = o.sprint.test;
        var done = o.sprint.done;
        todo.title = "ToDo";
        develop.title = "Develop";
        test.title = "Test";
        done.title = "Done";
        o.sprint.lists = [todo, develop, test, done];
    }
  };

  return o;
});