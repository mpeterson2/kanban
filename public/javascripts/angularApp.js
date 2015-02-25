angular.module('app', [
  'ui.router',
  'ui.gravatar',
  'authentication'
])

.controller('main', ['$scope', '$location', 'auth', function($scope, $location, auth) {
  $scope.user = auth.user;
  auth.getUser()
    .success(function(user) {
      //$location.path('/#/');
    })
    .error(function(message) {
      //$location.path('/#/login');
    });

    $scope.logout = function() {
      auth.logout().success(function() {
        $location.path('/#/');
      });
    };
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('home', {
      url: '/',
      templateUrl: '/html/home.html'
    })

    .state('login', {
      url: '/login',
      controller: 'AuthCtrl',
      templateUrl: '/html/login.html'
    })

    .state('register', {
      url: '/register',
      controller: 'AuthCtrl',
      templateUrl: '/html/register.html'
    });

    $urlRouterProvider.otherwise('/');
}]);