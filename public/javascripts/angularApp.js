angular.module('app', [
  'ui.router',
  'md5',
  'authentication',
  'dashboard',
  'boards'
])

.controller('main', ['$scope', '$state', 'md5', 'auth', function($scope, $state, md5, auth) {
  $scope.user = auth.user;
  auth.getUser()
    .success(function(user) {
      $scope.user.gravatar = md5(user.email);

      if($state.$current.name == 'home') {
        $location.path('/dashboard');
      }
    })
    .error(function(message) {
      $state.go('home');
    });

    $scope.logout = function() {
      auth.logout().success(function() {
        $location.path('/');
      });
    };
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('index', {
      url: '/'
    })

    .state('home', {
      url: '/home',
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
    })

    .state('dashboard', {
      url: '/dashboard',
      controller: 'DashboardCtrl',
      templateUrl: '/html/dashboard.html',
    });

    $urlRouterProvider.otherwise('/');
}]);