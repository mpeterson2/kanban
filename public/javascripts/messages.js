angular.module('messages', ['btford.socket-io'])

.factory('messages', function(socketFactory) {
  return socketFactory();
});