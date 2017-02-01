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
    /** Create reference to database path */
    var ref = Db.child("tricks");
    /**
     * @name $scope.data
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.data = $firebaseArray(ref);
    /** Create reference to database path */
    var ref2 = Db.child("globalnotice");
    /**
     * @name $scope.globalnotice
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a synchronized object stored in scope
     */
    $scope.globalnotice = $firebaseObject(ref2);
    /** Create reference to database path */
    var ref3 = Db.child("booklets/latest")
    /**
     * @name latest
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a syncronised object stored in a variable
     */
    var booklets = $firebaseObject(ref3);
    $scope.bookletDl = {}

    var storage = firebase.storage()
    var storageRef = storage.ref("booklets/");

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
        var ref3 = Db.child("checklist/" + $scope.user.uid);
        /**
         * @name $scope.done
         * @function
         * @memberOf trick.dash.DashCtrl
         * @description create a synchronized array stored in scope
         */
        $scope.done = $firebaseObject(ref3);
        /** Create reference to database path */
        var ref4 = Db.child("users/" + $scope.user.uid +
          "/hideCompleted");
        /**
         * @name $scope.hideDone
         * @function
         * @memberOf trick.dash.DashCtrl
         * @description create a synchronized Object stored in scope
         */
        $scope.hideDone = $firebaseObject(ref4);
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
    $anchorScroll();
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

    booklets.$watch(function() {
      storageRef.child(booklets.a4)
        .getDownloadURL()
        .then(function(url) {
          document.getElementById("a4booklet")
            .href = url;
        });
      storageRef.child(booklets.letter)
        .getDownloadURL()
        .then(function(url) {
          document.getElementById("letterbooklet")
            .href = url;
        });
      storageRef.child(booklets.a4detailed)
        .getDownloadURL()
        .then(function(url) {
          document.getElementById("a4detailedbooklet")
            .href = url;
        });
      storageRef.child(booklets.letterdetailed)
        .getDownloadURL()
        .then(function(url) {
          document.getElementById("letterdetailedbooklet")
            .href = url;
        });
    })
  });
