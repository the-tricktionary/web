'use strict';

angular.module('trick', [
  'ngRoute',
  'trick.dash',
  'trick.details',
  'trick.news',
  'trick.submit',
  'trick.about',
  'firebase'
])
  
  .config([
    '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      $locationProvider.html5Mode(true).hashPrefix('!');
      
      $routeProvider.otherwise({redirectTo: '/'});
    }
  ])
  
  .factory("Auth", [
    "$firebaseAuth",
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ])

  .run([
    '$location', '$rootScope', 'Auth', function($location, $rootScope, Auth) {
      $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        if(error === "AUTH_REQUIRED") {
          $location.path("/dash");
        }
      });

      $rootScope.signIn = function() {
        $rootScope.user = null;
        $rootScope.error = null;
        Auth.$signInWithPopup("google")
          .then(function(firebaseUser) {
            $rootScope.user = firebaseUser;
          })
          .catch(function(error) {
            $rootScope.error = error;
          });
      };

      $rootScope.signOut = function() {
        Auth.$signOut();
      };

      // any time auth status updates, add the user data to scope
      Auth.$onAuthStateChanged(function(firebaseUser) {
        $rootScope.user = firebaseUser;
      });
    }
  ]);