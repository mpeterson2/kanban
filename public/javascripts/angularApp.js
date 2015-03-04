angular.module('app', [
  'ui.router',
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
        $state.go('dashboard');
    })
    .error(function(message) {
      if($state.$current.name == 'index')
        $state.go('home');
    });

    $scope.logout = function() {
      auth.logout().success(function() {
        $state.go('home');
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

    .state('404', {
      url: '/error/404',
      templateUrl: '/html/404.html'
    });

    $urlRouterProvider.otherwise('/');

    // Global error handler
    $httpProvider.interceptors.push(function() {
      return {
        'responseError': function(response) {
          if(response.status === 404)
            window.location = '/#/error/404';
          else if(response.status === 401)
            window.location = '/#/login';

          return response;
        }
      };
  });
}]);