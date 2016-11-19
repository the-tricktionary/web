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
 * @param {service} $anchorScroll
 * @param {service} $location
 * @param {service} Db
 */
.controller('DashCtrl', function($scope, $firebaseArray, $firebaseObject,
  $anchorScroll,
  $location, Db, Auth) {
  /** Create reference to database path */
  var ref = Db.child("tricks");
  /**
   * @name $scope.data
   * @function
   * @memberOf trick.dash.DashCtrl
   * @description create a synchronized array stored in scope
   */
  $scope.data = $firebaseArray(ref);
  Auth.$onAuthStateChanged(function(user) {
    if (user) {
      var ref2 = Db.child("checklist/" + user.uid);
      $scope.done = $firebaseObject(ref2);
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
   * @param  {int} id0 [description]
   * @param  {int} id1 [description]
   * @return {string}     [description]
   */
  $scope.class = function(id0, id1) {
    var x = "";
    x += (id0 + '' + id1 == anchor ? 'pop ' : '');
    if ($scope.user && $scope.done && $scope.done[id0]) {
      x += ($scope.done[id0][id1] == true ? 'done' : '');
    }
    return x;
  }
});
