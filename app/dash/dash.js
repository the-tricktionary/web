'use strict';
/**
 * @class trick.dash
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.dash', ['ngRoute'])

  .config([
    '$routeProvider',
  function($routeProvider) {
      $routeProvider.when('/', {
        templateUrl: '/dash/dash.html',
        controller: 'DashCtrl'
      });
    }
  ])

  /**
   * @class trick.dash.DashCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} $firebaseObject
   * @param {service} $anchorScroll
   * @param {service} $location
   * @param {service} Db
   * @param {service} Auth
   */
  .controller('DashCtrl', function($scope, $firebaseArray, $firebaseObject,
    $anchorScroll, $location, Db, Auth) {
    $scope.Subpage(undefined);
    /** Create reference to database path */
    var trickRef = Db.child("tricks");
    /**
     * @name $scope.data
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.data = $firebaseArray(trickRef);
    /** Create reference to database path */
    var globRef = Db.child("globalnotice");
    /**
     * @name $scope.globalnotice
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a synchronized object stored in scope
     */
    $scope.globalnotice = $firebaseObject(globRef);
    /** Create reference to database path */
    var bookletRef = Db.child("booklets/latest")
    /**
     * @name $scope.booklets
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a syncronised object stored in scope
     */
    $scope.booklets = $firebaseObject(bookletRef);
    /** Create reference to database path */
    var typeRef = Db.child("tricktypes");
    /**
     * @name $scope.types
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a syncronised object stored in scope
     */
    $scope.types = $firebaseObject(typeRef);
    $scope.typeifs = {};
    var langsRef = Db.child("langs");
    /**
     * @name $scope.langs
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a syncronised object stored in scope
     */
    $scope.langs = $firebaseObject(langsRef);

    $scope.until = function(date) {
      var comp = new Date(date);
      var now = new Date();
      if (comp < now) {
        return false
      } else {
        return true
      }
    };
    Auth.$onAuthStateChanged(function() {
      if ($scope.user) {
        /** Create reference to database path */
        var checkRef = Db.child("checklist/" + $scope.user.uid);
        /**
         * @name $scope.done
         * @function
         * @memberOf trick.dash.DashCtrl
         * @description create a synchronized array stored in scope
         */
        $scope.done = $firebaseObject(checkRef);
        /** Create reference to database path */
        var compRef = Db.child("users/" + $scope.user.uid +
          "/hideCompleted");
        /**
         * @name $scope.hideDone
         * @function
         * @memberOf trick.dash.DashCtrl
         * @description create a synchronized Object stored in scope
         */
        $scope.hideDone = $firebaseObject(compRef);
      }
    });
    /**
     * @name $scope.anchor
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description Store URL's anchor value (`#disclaimer` for example) in the scope
     */
    var anchor = $location.hash();
    /** Configure $anchorScroll to take the navbar into consideration*/
    $anchorScroll.yOffset = 200;
    /** Scroll To anchor */
    setTimeout(function() {
      $anchorScroll()
    }, 100);
    /**
     * return a list of classes to apply
     * @param  {int} id0
     * @param  {int} id1
     * @return {string}
     */
    $scope.class = function(id0, id1) {
      var x = "";
      x += (id0 + '' + id1 == anchor ? 'pop ' : '');
      if ($scope.user && $scope.done && $scope.done[id0]) {
        x += ($scope.done[id0][id1] == true ? 'done' : '');
      }
      return x;
    }

    if ($location.search()
      .utm_source == "oldjrj") {
      $scope.Error(
        'You are using an outdated url to reach the tricktionary, we highly reccomend updating your bookmarks to <a href="https://the-tricktionary.com">https://the-tricktionary.com</a>'
      );
    }
  });
