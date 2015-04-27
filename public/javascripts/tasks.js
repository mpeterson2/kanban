angular.module('tasks', [])

.factory('tasks', function($http) {
  var o = {
    create: function(boardId, story, task) {
      return $http.put('/boards/' + boardId + '/story/' + story._id + '/task', task)
        .success(function(data) {
          story.tasks.push(data);
        });
    },

    update: function(boardId, story, task) {
      return $http.post('/boards/' + boardId + '/story/' + story._id + '/task/' + task._id, task);
    },
  }

  return o;
});