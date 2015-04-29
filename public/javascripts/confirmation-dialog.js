angular.module('confirmation.dialog', [])

.controller('ConfirmationDiaglogCtrl', function($scope, $modalInstance, callback, question, title, confirm, cancel) {
  $scope.title = title || 'Confirm Action';
  $scope.yes = confirm || 'Yes';
  $scope.cancel = cancel || 'No';
  $scope.question = question;

  $scope.confirm = function() {
    callback();
    $modalInstance.close();
  };
})

.factory('confirmationDialog', function($modal) {
  var o = {
    create: function(callback, question, title, confirm, cancel) {
      return $modal.open({
        templateUrl: '/html/confirmation-dialog.html',
        controller: 'ConfirmationDiaglogCtrl',
        resolve: {
          callback: function() { return callback; },
          question: function() { return question; },
          title: function() { return title; },
          confirm: function() { return confirm; },
          cancel: function() { return cancel; }
        }
    });
    }
  }
  return o;
});