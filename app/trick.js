'use strict';
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
 * @namespace trick
 * @requires ngRoute
 * @requires trick.dash
 * @requires trick.details
 * @requires trick.news
 * @requires trick.contact
 * @requires trick.about
 * @requires trick.about.rafiki
 * @requires trick.speed
 * @requires trick.speed.details
 * @requires firebase
 */
angular.module('trick', [
  'ngRoute',
  'trick.dash',
  'trick.details',
  'trick.coach',
  'trick.share',
  'trick.news',
  'trick.contact',
  'trick.about',
  'trick.about.rafiki',
  'trick.speed',
  'trick.speed.details',
  'trick.speed.compare',
  'firebase',
  'hc.marked'
])

  .config([
    '$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {
      /**
       * @description ngRoute with html5 mode (no hashbang, but with fallback)
       * @memberOf trick.trick
       */
      $locationProvider.html5Mode(true)
        .hashPrefix('!');

      $routeProvider.otherwise({
        redirectTo: '/'
      });
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

  .factory("Db",
    /**
     * @function Db
     * @memberOf trick.trick
     * @return {object} Return database
     * @require firebase
     */
    function() {
      return firebase.database()
        .ref();
    })

  .run(function($location, $rootScope, Auth) {
    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
      if (error === "AUTH_REQUIRED") {
        $location.path('/');
        $rootScope.Error(
          'You need to be signed in to access this page, please Sign In and try again.'
        );
      }
    });

    /**
     * @name $rootScope.signIn
     * @function
     * @memberOf trick
     * @description function to sign In with google
     */
    $rootScope.signIn = function() {
      $rootScope.user = null;
      $rootScope.Error("", false);
      Auth.$signInWithPopup("google")
        .then(function(firebaseUser) {
          $rootScope.user = firebaseUser;
        })
        .catch(function(error) {
          $rootScope.Error(error);
        });
    };

    /**
     * @name $rootScope.signOut
     * @function
     * @memberOf trick
     * @description function to sign Out
     */
    $rootScope.signOut = function() {
      Auth.$signOut();
    };

    /**
     * @name $rootScope.goHome
     * @function
     * @memberOf trick
     * @description function to go to /
     */
    $rootScope.goHome = function() {
      $location.path('/');
    };

    $rootScope.Error = function(e, bool) {
      $rootScope.error = {
        text: e,
        show: (bool == undefined ? true : bool)
      }
    }

    /**
     * any time auth status updates, add the user data to scope
     * @memberOf trick.trick
     */
    Auth.$onAuthStateChanged(function(firebaseUser) {
      $rootScope.user = firebaseUser;
    });

    if ($location.path()
      .indexOf('speed/details') > -1 || $location.path()
      .indexOf('speed/compare') > -1) {
      var page = $location.path()
        .replace(/speed\/(details|compare)\/.*/g, function(x) {
          "speed/" + x.split("/")[1]
        });
    } else {
      var page = $location.path();
    }
    ga('send', 'pageview', page);
    /**
     * Add to homescreen
     */
    addToHomescreen({
      appID: 'com.the-tricktionary',
      startDelay: 5,
      skipFirstVisit: true,
      maxDisplayCount: 1,
      displayPace: 525948
    });
  })

  .directive('ngConfirmClick', [
        function() {
      return {
        link: function(scope, element, attr) {
          var msg = attr.ngConfirmClick || "Are you sure?";
          var clickAction = attr.confirmedClick;
          element.bind('click', function(event) {
            if (window.confirm(msg)) {
              scope.$eval(clickAction)
            }
          });
        }
      }
      }
    ])
