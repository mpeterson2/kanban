angular.module('loading', [])

.directive('loading', function($rootScope) {
  return {
      template: "<div ng-show='isRouteLoading' class='loader'>",
      link: function(scope, elem, attrs) {
        $rootScope.$on('$locationChangeStart', function() {
          scope.isRouteLoading = true;
        });
        $rootScope.$on('$locationChangeSuccess', function() {
          scope.isRouteLoading = false;
        });
      }
    };
});