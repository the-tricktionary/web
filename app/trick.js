'use strict';
/**
 * @namespace trick
 */

/**
 * Initialize firebase
 * @function initializeApp
 * @param {object} config firebase configuration values.
 * @return {object} service
 * @require firebase
 */
var config = {
  apiKey: "AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM",
  authDomain: "project-5641153190345267944.firebaseapp.com",
  databaseURL: "https://project-5641153190345267944.firebaseio.com",
  storageBucket: "project-5641153190345267944.appspot.com"
};
firebase.initializeApp(config);


/**
 * Hide/Show nav on mobile
 * @function toggleNav
 */
function toggleNav() {
  document.getElementsByClassName("topnav")[0].classList.toggle("responsive");
  document.getElementsByTagName("nav")[0].classList.toggle("responsive");
}

/**
 * @class trick.trick
 * @memberOf trick
 */
angular.module('trick', [
  'ngRoute',
  'trick.dash',
  'trick.details',
  'trick.news',
  'trick.submit',
  'trick.contact',
  'trick.about',
  'trick.speed',
  'firebase'
])
  
  .config([
    '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      /**
       * @description ngRoute with html5 mode (no hashbang, but with fallback)
       * @memberOf trick.trick
       */
      $locationProvider.html5Mode(true).hashPrefix('!');
      
      $routeProvider.otherwise({redirectTo: '/'});
    }
  ])
  
  .factory("Auth", [
    "$firebaseAuth",
    /**
     * @function Auth
     * @memberOf trick.trick
     * @param {service} $firebaseAuth feed with auth state
     * @return {object} Return auth state
     * @require firebase
     */
      function($firebaseAuth) {
      return $firebaseAuth();
    }
  ])
  
  .run(function($location, $rootScope, Auth) {
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
      
      /**
       * any time auth status updates, add the user data to scope
       * @memberOf trick.trick
       */
      Auth.$onAuthStateChanged(function(firebaseUser) {
        $rootScope.user = firebaseUser;
      });
      
      ga('send', 'pageview');
    }
  );