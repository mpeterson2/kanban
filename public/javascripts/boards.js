angular.module('boards', ['ui.bootstrap', 'users', 'sprints', 'stories', 'confirmation.dialog'])

.controller('BoardCtrl', function($scope, $state, $stateParams, $modal, boards, sprints, stories, confirmationDialog) {
  angular.copy({}, boards.board);
  $scope.board = boards.board;
  $scope.sprint = sprints.sprint;

  if($stateParams.boardId) {
    boards.get($stateParams.boardId)
      .error(function(error, status) {
        $state.go('error/' + status);
      });

    // If we have the current sprintIndex, get a sprint
    if($stateParams.sprintIndex) {
      sprints.getByIndex($stateParams.boardId, $stateParams.sprintIndex)
    }

    // Otherwise, get the currently dated sprint
    else {
      sprints.getCurrent($stateParams.boardId);
    }
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

      return stories.move($scope.board._id, $scope.sprint._id, fromList, toList, index, story._id);
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

  $scope.canDecrementSprint = function() {
    if(!$scope.sprint.index)
      return false;

    return $scope.sprint.index > 0;
  };

  $scope.canIncrementSprint = function() {
    if($scope.sprint.index == undefined || $scope.board.sprints == undefined)
      return false;

    var nextIndex = $scope.sprint.index + 1;
    var nextSprint = $scope.board.sprints[nextIndex];
    return nextSprint != undefined;
  };

  $scope.showAddStory = function() {
    $modal.open({
      templateUrl: '/html/story/new.html',
      controller: 'StoryCreateCtrl',
      resolve: {
        board: function() { return $scope.board; },
        sprint: function() { return $scope.sprint; }
      }
    });
  };

  $scope.showStory = function(story) {
    $modal.open({
      templateUrl: '/html/story/view.html',
      controller: 'StoryViewController',
      resolve: {
        board: function() { return $scope.board; },
        story: function() { return story; }
      }
    });
  };

  $scope.doneCount = function(story) {
    return story.tasks.filter(function(t) {return t.done}).length;
  };

  $scope.showMemberManagement = function() {
    $modal.open({
      templateUrl: '/html/board/manage-members.html',
      controller: 'MemberManageCtrl',
      resolve: {
        board: function() { return $scope.board; }
      }
    });
  };

  $scope.removeStory = function(story) {
    confirmationDialog.create(
      function() {
        stories.remove($scope.board._id, $scope.sprint._id, story);
      },
      'Are you sure you want to remove this story?'
    );
  };

})

.controller('MemberManageCtrl', function($scope, $modalInstance, boards, board, confirmationDialog) {
  $scope.members = board.members;

  $scope.addMember = function(username) {
    if(username == undefined || username == '')
      return;

    boards.addMember(board._id, username).success(function() {
      $scope.newUser.username = '';
    });
  };

  $scope.removeMember = function(username) {
    confirmationDialog.create(function() {
      boards.removeMember(board._id, username)
    }, 'Are you sure you want to remove ' + username + ' from this board?');
  };
})

.factory('boards', function($http, $stateParams, sprints) {
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

    addMember: function(boardId, username) {
      return $http.post('/boards/' + boardId + '/member/' + username).success(function(member) {
        o.board.members.push(member);
      });
    },

    removeMember: function(boardId, username) {
      return $http.delete('/boards/' + boardId + '/member/' + username).success(function(member) {
        var members = o.board.members;
        var newMembers = members.filter(function(m) {return m._id != member._id});
        angular.copy(newMembers, members);

        function removeUser(story) {
          var newStoryMembers = story.members.filter(function(m) {return m._id != member._id});
          story.members = newStoryMembers;
        }

        sprints.sprint.todo.forEach(removeUser);
        sprints.sprint.develop.forEach(removeUser);
        sprints.sprint.test.forEach(removeUser);
        sprints.sprint.done.forEach(removeUser);
      });
    }
  };


  return o;
});