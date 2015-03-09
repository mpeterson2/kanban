angular.module('app', [
  'ui.router',
  'ui.bootstrap',
  'md5',
  'authentication',
  'dashboard',
  'boards',
  'users'
])

.controller('main', ['$scope', '$state', 'auth', 'users', function($scope, $state, auth, users) {
  $scope.user = auth.user;

  auth.getUser()
    .success(function(user) {
      $scope.user.gravatar = users.getGravatar(user.email);
      if($state.$current.name == 'index')
        $state.go('dashboard', {}, {'location': 'replace'});
    })
    .error(function(message) {
      if($state.$current.name == 'index')
        $state.go('home', {}, {'location': 'replace'});
    });

    $scope.logout = function() {
      auth.logout().success(function() {
        $state.go('home', {}, {'location': 'replace'});
      });
    };
}])

.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
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
    })

    .state('board/create', {
      url: '/boards/create',
      controller: 'BoardCtrl',
      templateUrl: '/html/board/new.html'
    })

    .state('board/view', {
      url: '/boards/:boardId',
      controller: 'BoardCtrl',
      templateUrl: '/html/board/view.html'
    })

    .state('error/404', {
      url: '/error/404',
      templateUrl: '/html/404.html'
    });

    $urlRouterProvider.otherwise('/');
}]);