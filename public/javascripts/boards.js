angular.module('boards', ['ui.bootstrap', 'users'])

.controller('BoardCtrl', function($scope, $state, $stateParams, $modal, boards, users){
  $scope.board = boards.board;
  if($stateParams.boardId) {
    boards.get($stateParams.boardId)
      .success(function(data) {
        var members = $scope.board.members;

        $scope.board.members.forEach(function(member) {
          member.gravatar = users.getGravatar(member);
        });
      })
      .error(function(error, status) {
        $state.go('error/' + status);
      });
  }

  $scope.createBoard = function() {
    boards.create($scope.board).success(function(data) {
      $state.go('dashboard');
    });
  };

  $scope.addStory = function() {
    boards.addStory($scope.story).success(function() {
      $scope.story.description = '';
    });
  };

  $scope.showAddStory = function() {
    $modal.open({
      templateUrl: '/html/board/new-story.html',
      controller: 'StoryModalCtrl'
    });
  };

  $scope.showAddTask = function(story) {
    $modal.open({
      templateUrl: '/html/board/new-task.html',
      controller: 'TaskModalCtrl',
      resolve: {
        story: function() {return story;}
      }
    });
  };

  $scope.toggleActive = function(story, task) {
    boards.updateTask(story, task);
  };

})

.controller('StoryModalCtrl', function($scope, $modalInstance, boards) {
  $scope.addStory = function() {
    boards.addStory($scope.story).success(function() {
      $modalInstance.close();
    });
  };
})

.controller('TaskModalCtrl', function($scope, $modalInstance, story, boards) {
  $scope.addTask = function() {
    boards.addTask(story, $scope.task).success(function(data) {
      $modalInstance.close();
    })
  };
})

.factory('boards', function($http, $stateParams) {
  var o = {
    board: {},
    boards: [],

    get: function(id) {
      return $http.get('/boards/' + id).success(function(board) {
        board.tasks = board.stories
          .map(function(story) {return story.tasks})
          .reduce(function(a, b) {return a.concat(b)});

        angular.copy(board, o.board);
      });
    },

    all: function(user) {
      return $http.get('/boards').success(function(data) {
        angular.copy(data, o.boards);
      });
    },

    create: function(board) {
      return $http.put('/boards', board);
    },

    addStory: function(story) {
      return $http.put('/boards/' + $stateParams.boardId + '/story', story)
        .success(function(data) {
          o.board.stories.push(data);
        });
    },

    addTask: function(story, task) {
      return $http.put('/boards/' + $stateParams.boardId + '/story/' + story._id + '/task', task)
        .success(function(data) {
          story.tasks.push(data);
        });
    },

    updateTask: function(story, task) {
      return $http.post('/boards/' + $stateParams.boardId + '/story/' + story._id + '/task/' + task._id, task);
    }
  };

  return o;
});