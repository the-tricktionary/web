'use strict';

/*
 * Initialize Firebase
 */
var config = {
  apiKey: "AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM",
  authDomain: "project-5641153190345267944.firebaseapp.com",
  databaseURL: "https://project-5641153190345267944.firebaseio.com",
  storageBucket: "project-5641153190345267944.appspot.com"
};
firebase.initializeApp(config);

// Hide/Show nav on mobile
function toggleNav() {
  document.getElementsByClassName("topnav")[0].classList.toggle("responsive");
  document.getElementsByTagName("nav")[0].classList.toggle("responsive");
}
/*
 * @namespace trick
 */
angular.module('trick', [
  'ngRoute',
  'trick.dash',
  'trick.details',
  'trick.news',
  'trick.submit',
  'trick.about',
  'trick.speed',
  'trick.speed.event',
  'trick.speed.live',
  'firebase'
])
  
  .config([
    '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      /*
       * Configure ngRoute with html5 mode (no hashbang, but with fallback)
       * @memberOf trick
       * @ngdoc config
       * @name config
       * @param {service} $locationProvider Watches $location and provides interface to default state
       */
      $locationProvider.html5Mode(true).hashPrefix('!');
      
      $routeProvider.otherwise({redirectTo: '/'});
    }
  ])
  
  .factory("Auth", [
    "$firebaseAuth",
    /*
     * @param {service} $firebaseAuth feed with auth state
     * @return {object} Return auth state
     */
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ])

  .run([
    '$location', '$rootScope', 'Auth', function($location, $rootScope, Auth) {
      $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        if(error === "AUTH_REQUIRED") {
          $location.path("/dash");
          $rootScope.error = 'You need to be signed in to access this page, please Sign In and try again.';
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
      ga('send', 'pageview');
    }
  ]);