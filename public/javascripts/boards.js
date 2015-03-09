angular.module('boards', ['ui.bootstrap'])

.controller('BoardCtrl', function($scope, $state, $stateParams, $modal, boards){
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
  }

})

.controller('StoryModalCtrl', function($scope, $modalInstance, boards) {
  $scope.addStory = function() {
    boards.addStory($scope.story).success(function() {
      $scope.story.description = '';
      $modalInstance.close();
    });
  };
})

.controller('TaskModalCtrl', function($scope, $modalInstance, story, boards) {
  console.log(story);
  $scope.addTask = function() {
    console.log($scope.task);
  };
})

.factory('boards', function($http, $stateParams) {
  var o = {
    board: {},
    boards: [],

    get: function(id) {
      return $http.get('/boards/' + id).success(function(data) {
        angular.copy(data, o.board);
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
    }
  };

  return o;
});