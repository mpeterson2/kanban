angular.module('authentication', [])

.controller('AuthCtrl', ['$scope', '$location', 'auth', function($scope, $location, auth) {
  $scope.formError = auth.error;
  $scope.user = auth.user;

  $scope.login = function() {
    auth.login($scope.credentials).success(function() {
      $location.path('/#/');
    });
  };

  $scope.register = function() {
    angular.copy({}, $scope.formError);
    var u = $scope.newUser;
    var err = $scope.formError;

    if(emptyForm(u, err))
      return;

    if(u.password != u.passwordMatch) {
      err.password = true;
      err.message = "Please enter matching passwords.";
      return;
    }

    if(!validateEmail(u.email)) {
      err.email = true;
      err.message = "Please enter a valid email";
      return;
    }

    auth.register(u)
      .success(function(data) {
        $location.path('/#/');
      })
      .error(function(error) {
        err[error.field] = true;
        err.message = error.message
      });

  };

  function emptyForm(u, err) {
    var errors = 0;

    if(u === undefined) {
      u = {};
    }

    if(u.username === undefined || u.username == '') {
      err.username = true;
      err.message = "Please enter a username.";
      errors++;
    }

    if(u.password === undefined || u.password == '') {
      err.password = true;
      err.message = "Please enter a password.";
      errors++;
    }

    if(u.email === undefined || u.email == '') {
      err.email = true;
      err.message = "Please enter an email.";
      errors++;
    }

    if(u.firstName === undefined || u.firstName == '') {
      err.firstName = true;
      err.message = "Please enter a first name.";
      errors++;
    }

    if(u.lastName === undefined || u.lastName == '') {
      err.lastName = true;
      err.message = "Please enter a last name.";
      errors++;
    }

    if(errors > 1) {
      err.message = "Please fill in each field";
    }

    return errors > 0;
  }

  function validateEmail(email) {
    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }

}])


.factory('auth', ['$http', function($http) {
  var o = {
    user: {},
    error: new Boolean(false),

    login: function(credentials) {
      var promise = $http.post('/login', credentials);

      promise.success(function(data) {
        o.error.val = false;
        angular.copy(data, o.user);
        console.log(o.user);
      })
      .error(function(info) {
        o.error.val = true;
      });

      return promise;
    },

    logout: function() {
      var promise = $http.get('/signout');
      promise.success(function(data) {
        angular.copy({}, o.user);
      });
      return promise;
    },

    getUser: function() {
      var promise = $http.get('/me');
      promise.success(function(user) {
        angular.copy(user, o.user);
      });

      return promise;
    },

    register: function(user) {
      return $http.post('/signup', user);
    }

  };

  return o;
}]);