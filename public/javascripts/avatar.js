angular.module('avatar', ['md5', 'authentication'])

.directive('avatar', function(md5) {
  function link(scope, element, attrs) {
    scope.user = {};
    if(!scope.size) {
      scope.size = 20;
    }

    scope.$watch('user', function(newVal, old) {
      var user = scope.$eval(newVal);
      if(user && user.email) {
        scope.user = user;
        scope.user.gravatar = 'https://gravatar.com/avatar/' + md5(user.email);
      }
    });
  };

  return {
    link: link,
    scope: {
      user: '@user',
      size: '@size'
    },
    templateUrl: '/html/avatar.html'
  };
});