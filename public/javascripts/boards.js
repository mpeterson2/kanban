angular.module('boards', ['ui.bootstrap'])

.controller('BoardCtrl', function($scope, $state, $stateParams, $modal, boards){
  $scope.board = boards.board;
  if($stateParams.boardId) {
    boards.get($stateParams.boardId)
      .error(function(error, status) {
        $state.go('error/' + status);
      });
  }

  $scope.createBoard = function() {
    boards.create($scope.board).success(function(data) {
      $state.go('dashboard');
    });
  };

  $scope.showAddStory = function() {
    $modal.open({
      templateUrl: '/html/board/story-new.html',
      controller: 'StoryModalCtrl',
      resolve: {
        story: function() { return null; }
      }
    });
  };

  $scope.showStory = function(story) {
    $modal.open({
      templateUrl: '/html/board/story-view.html',
      controller: 'StoryModalCtrl',
      resolve: {
        story: function() { return story; }
      }
    });
  };

  $scope.doneCount = function(story) {
    return story.tasks.filter(function(t) {return t.done}).length;
  };

})

.controller('StoryModalCtrl', function($scope, $modalInstance, boards, story) {
  $scope.story = story;

  $scope.addTask = function() {
    boards.addTask(story, $scope.newTask).success(function() {
      $scope.newTask = {};
    });
  };

  $scope.toggleDone = function(task) {
    boards.updateTask(story, task);
  };

})

.factory('boards', function($http, $stateParams) {
  var o = {
    board: {},
    boards: [],

    get: function(id) {
      return $http.get('/boards/' + id).success(function(board) {
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