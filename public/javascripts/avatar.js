angular.module('avatar', ['angular-md5', 'authentication'])

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
        scope.user.gravatar = 'https://gravatar.com/avatar/' + md5.createHash(user.email);

        if(attrs.tooltip === undefined) {
          scope.tooltip = user.firstName + ' ' + user.lastName;
        }
        if(attrs.href === undefined) {
          scope.href = '/#/users/' + user._id;
        }
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