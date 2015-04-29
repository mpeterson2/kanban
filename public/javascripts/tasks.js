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

    remove: function(boardId, story, taskId) {
      return $http.delete('/boards/' + boardId + '/story/' + story._id + '/task/' + taskId)
        .success(function() {
          var newTasks = story.tasks.filter(function(t) {return t._id != taskId});
          angular.copy(newTasks, story.tasks);
        });
    }
  }

  return o;
});