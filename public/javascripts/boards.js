angular.module('boards', [])

.controller('BoardCtrl', ['$scope', function($scope){
  $scope.createBoard = function() {
    console.log($scope.board);
  };

}])

.factory('boards', ['$http', function($http) {
  var o = {
    boards: [],

    get: function(id) {
      return o.all()[id];
    },

    all: function(user) {
      return $http.get('/boards').success(function(data) {
        angular.copy(data, o.boards);
      })
    },

/*
    boards: [
              {
                title: 'Name',
                _id: 123,
                members: [{username: 'user', _id: '123', email: 'mpeterson4@carthage.edu', firstName: 'Michael', _id: 1},
                          {username: 'user2', _id: '123', email: 'don@kuntz.co', firstName: 'Don', "_id": 2}],
                tasks: [{title: 'Title', description: 'This is a long description'}],
                date: 123,
                description: 'Lorem ipsum dolor sit amet, aeque eruditi ei est, hinc sententiae ea mel. In nec tota dicta omnes, saepe appareat quo in, autem tacimates et usu. Id sea vidit eruditi intellegat. Harum alienum referrentur sit et, at latine euripidis mel.'
              },
              {
                title: 'Name 2',
                _id: 124,
                members: [{username: 'user', _id: '123', email: 'mpeterson4@carthage.edu', firstName: 'Michael'},
                          {username: 'user2', _id: '123', email: 'don@kuntz.co', firstName: 'Don'}],
                tasks: [{title: 'Title', description: 'This is a long description'}],
                date: 123,
                description: 'Esse atomorum honestatis et qui, te probo illum iusto quo. Vix ut prompta verterem, probatus scriptorem in vel, sed te option periculis definitiones. Agam ubique commodo ad duo, et dolorum dolores definitiones nec. Duo cibo nonumy dolores no, sea ne illum affert eirmod, dicta nominavi est ea. Pri no aeque adversarium, mei ut melius neglegentur. At mel ridens regione, ea ius iracundia interesset. Stet tota legimus nam ut.'
              },
              {
                title: 'Name 3',
                _id: 125,
                members: [{username: 'user', _id: '123', email: 'mpeterson4@carthage.edu', firstName: 'Michael'},
                          {username: 'user2', _id: '123', email: 'don@kuntz.co', firstName: 'Don'}],
                tasks: [{title: 'Title', description: 'This is a long description'}],
                date: 123,
                description: 'Et usu detraxit sapientem similique, pri cu zril utinam expetenda, per rebum appetere ocurreret cu. Alii deterruisset cu est.'
              },
              {
                title: 'Name 4',
                _id: 126,
                members: [{username: 'user', _id: '123', email: 'mpeterson4@carthage.edu', firstName: 'Michael'},
                          {username: 'user2', _id: '123', email: 'don@kuntz.co', firstName: 'Don'}],
                tasks: [{title: 'Title', description: 'This is a long description'}],
                date: 123,
                description: 'This is a long description'
              },
              {
                title: 'Name 5',
                _id: 127,
                members: [{username: 'user', _id: '123', email: 'mpeterson4@carthage.edu', firstName: 'Michael'},
                          {username: 'user2', _id: '123', email: 'don@kuntz.co', firstName: 'Don'}],
                tasks: [{title: 'Title', description: 'This is a long description'}],
                date: 123,
                description: 'This is a long description'
              }
            ]
*/
  };

  return o;
}]);