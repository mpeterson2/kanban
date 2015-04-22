angular.module('boards', ['ui.bootstrap'])

.controller('BoardCtrl', function($scope, $state, $stateParams, $modal, $q, boards){
  $scope.board = boards.board;
  $scope.sprint = boards.sprint;

  if($stateParams.boardId) {
    boards.get($stateParams.boardId)
      .error(function(error, status) {
        $state.go('error/' + status);
      });
  }

  $scope.sortableOptions = {
    connectWith: '.sortable',
    placeholder: 'story-card-placeholder',
    scroll: true,
    beforeStop: function(e, ui) {
      var story = ui.item.scope().story;
      var fromList = ui.item.scope().$parent.list.title;
      var toList = ui.item.parent().scope().list.title;
      var index = ui.item.index();

      return boards.moveStory($scope.board._id, $scope.sprint._id, fromList, toList, index, story._id);
    }
  };

  $scope.createBoard = function() {
    boards.create($scope.board).success(function(data) {
      $state.go('dashboard');
    });
  };

  $scope.showAddSprint = function() {
    $modal.open({
      templateUrl: '/html/sprint/new.html',
      controller: 'SprintModalCtrl',
      resolve: {
        board: function() { return $scope.board }
      }
    });
  };

  $scope.decrementSprint = function() {
    var prevIndex = $scope.sprint.index - 1;
    var prevSprint = $scope.board.sprints[prevIndex];

    if(prevSprint) {
      var prevSprintId = prevSprint._id;
      boards.getSprint($scope.board._id, prevSprintId);
    }
  };

  $scope.incrementSprint = function() {
    var nextIndex = $scope.sprint.index + 1;
    var nextSprint = $scope.board.sprints[nextIndex];

    if(nextSprint) {
      var nextSprintId = nextSprint._id;
      boards.getSprint($scope.board._id, nextSprintId);
    }
  };

  $scope.showAddStory = function() {
    $modal.open({
      templateUrl: '/html/story/new.html',
      controller: 'StoryModalCtrl',
      resolve: {
        sprint: function() { return $scope.sprint; },
        story: function() { return undefined; }
      }
    });
  };

  $scope.showStory = function(story) {
    $modal.open({
      templateUrl: '/html/story/view.html',
      controller: 'StoryModalCtrl',
      resolve: {
        sprint: function() { return $scope.sprint; },
        story: function() { return story; }
      }
    });
  };

  $scope.doneCount = function(story) {
    return story.tasks.filter(function(t) {return t.done}).length;
  };

})

.controller('StoryModalCtrl', function($scope, $modalInstance, boards, story, sprint) {
  $scope.story = story;

  $scope.addTask = function() {
    if(!$scope.newTask || !$scope.newTask.description)
      return;

    boards.addTask(story, $scope.newTask).success(function() {
      $scope.newTask = {};
    });
  };

  $scope.toggleDone = function(task) {
    boards.updateTask(story, task);
  };

  $scope.addStory = function() {
    if(!$scope.story || !$scope.story.description)
      return;

    boards.addStory(sprint._id, $scope.story).success(function() {
      $modalInstance.close();
    });
  }
})

.factory('boards', function($http, $stateParams) {
  var o = {
    board: {},
    boards: [],
    sprint: {},

    get: function(id) {
      return $http.get('/boards/' + id).success(function(board) {
        angular.copy(board, o.board);
        angular.copy(board.currentSprint, o.sprint);

        var todo = o.sprint.todo;
        var develop = o.sprint.develop;
        var test = o.sprint.test;
        var done = o.sprint.done;
        todo.title = "ToDo";
        develop.title = "Develop";
        test.title = "Test";
        done.title = "Done";
        o.sprint.lists = [todo, develop, test, done];
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

    getSprint: function(boardId, sprintId) {
      return $http.get('/boards/' + boardId + '/sprint/' + sprintId).success(function(data) {
        angular.copy(data, o.sprint);

        var todo = o.sprint.todo;
        var develop = o.sprint.develop;
        var test = o.sprint.test;
        var done = o.sprint.done;
        todo.title = "ToDo";
        develop.title = "Develop";
        test.title = "Test";
        done.title = "Done";
        o.sprint.lists = [todo, develop, test, done];
      });
    },

    addStory: function(sprintId, story) {
      return $http.put('/boards/' + $stateParams.boardId + '/sprint/' + sprintId + '/story', story)
        .success(function(data) {
          o.sprint.lists[0].push(data);
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
    },

    moveStory: function(boardId, sprintId, from, to, index, storyId) {
      return $http.post('/boards/' + boardId + '/sprint/' + sprintId + '/story/' + storyId + '/move', {from: from, to: to, index: index});
    }
  };

  return o;
});