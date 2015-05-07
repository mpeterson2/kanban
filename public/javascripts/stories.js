angular.module('stories', ['users', 'sprints', 'tasks'])

.controller('StoryCreateCtrl', function($scope, $modalInstance, users, stories, board, sprint) {
  $scope.story = {members: [], description: '', points: 1};

  $scope.createStory = function() {
    if(!$scope.story.description)
      return;

    stories.create(board._id, sprint._id, $scope.story).success(function() {
      $modalInstance.close();
    });
  };

  $scope.addMember = function(username) {
    var members = $scope.story.members.filter(function(m) {return m.username == username});

    if(members.length == 0) {
      users.getUser(username).success(function(member) {
        $scope.story.members.push(member);
        $scope.newMember.username = '';
      });
    }
  };

  $scope.removeMember = function(username) {
    var members = $scope.story.members;
    var newMembers = members.filter(function(m) {return m.username != username});
    angular.copy(newMembers, members);
  }
})

.controller('StoryViewController', function($scope, $modalInstance, stories, board, story, tasks) {
  $scope.story = story;

  $scope.editStory = function() {
    $scope.story.newDescription = $scope.story.description;
    $scope.story.newPoints = $scope.story.points;
    $scope.story.isEditing = true;
  }

  $scope.saveStoryEdits = function() {
    $scope.story.description = $scope.story.newDescription;
    $scope.story.points = $scope.story.newPoints;
    stories.updateInfo(board._id, $scope.story).success(function() {
      $scope.story.isEditing = false;
    });
  }

  $scope.stopEditingStory = function() {
    $scope.story.isEditing = false;
  }

  $scope.addTask = function() {
    if(!$scope.newTask || !$scope.newTask.description)
      return;

    tasks.create(board._id, story, $scope.newTask).success(function() {
      $scope.newTask = {};
    });
  };

  $scope.removeTask = function(task) {
    tasks.remove(board._id, story, task._id);
  }

  $scope.toggleDone = function(task) {
    tasks.update(board._id, story, task);
  };

  $scope.editTask = function(task) {
    task.newDescription = task.description;
    task.isEditing = true;
  };

  $scope.saveTaskEdits = function(task) {
    task.description = task.newDescription;
    tasks.update(board._id, story, task).success(function() {
      task.isEditing = false;
    });
  }

  $scope.stopEditingTask = function(task) {
    task.isEditing = false;
  };

  $scope.addMember = function(username) {
    if(username == undefined || username == '')
      return;

    stories.addMember(board._id, story, username).success(function() {
      $scope.newUser.username = '';
    });
  };

  $scope.removeMember = function(username) {
    stories.removeMember(board._id, story, username);
  };
})

.factory('stories', function($http, sprints) {
  var o = {
    create: function(boardId, sprintId, story) {
      return $http.put('/boards/' + boardId + '/sprint/' + sprintId + '/story', story);
    },

    remove: function(boardId, sprintId, story) {
      return $http.delete('/boards/' + boardId + '/sprint/' + sprintId + '/story/' + story._id);
    },

    updateInfo: function(boardId, story) {
      return $http.post('/boards/' + boardId + '/story/' + story._id, {description: story.description, points: story.points});
    },

    move: function(boardId, sprintId, from, to, index, storyId) {
      return $http.post('/boards/' + boardId + '/sprint/' + sprintId + '/story/' + storyId + '/move',
        {from: from, to: to, index: index});
    },

    addMember: function(boardId, story, username) {
      return $http.post('/boards/' + boardId + '/story/' + story._id + '/member/' + username)
        .success(function(member) {
          story.members.push(member);
        });
    },

    removeMember: function(boardId, story, username) {
      return $http.delete('/boards/' + boardId + '/story/' + story._id + '/member/' + username)
        .success(function(member) {
          var members = story.members;
          var newMembers = members.filter(function(m) {return m._id != member._id});
          angular.copy(newMembers, members);
        });
    }
  };

  return o;
})