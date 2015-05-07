angular.module('tasks', [])

.factory('tasks', function($http) {
  var o = {
    create: function(boardId, story, task) {
      return $http.put('/boards/' + boardId + '/story/' + story._id + '/task', task);
    },

    update: function(boardId, story, task) {
      return $http.post('/boards/' + boardId + '/story/' + story._id + '/task/' + task._id, task);
    },

    remove: function(boardId, story, taskId) {
      return $http.delete('/boards/' + boardId + '/story/' + story._id + '/task/' + taskId);
    }
  }

  return o;
});