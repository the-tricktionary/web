'use strict';
/**
 * @class trick.dash
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.dash', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
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
   */
  .controller('DashCtrl', function($scope, $firebaseArray, $anchorScroll, $location, Db) {
    /** Create reference to database path */
    var ref = Db.child("tricks");
    /**
     * @name $scope.data
     * @function
     * @memberOf trick.dash.DashCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.data = $firebaseArray(ref);
    /**
     * @name $scope.anchor
     * @function
     * @memberOf trick.about.AboutCtrl
     * @description Store URL's anchor value (`#disclaimer` for example) in the scope
     */
    $scope.anchor = $location.hash();
    /** Configure $anchorScroll to take the navbar into consideration*/
    $anchorScroll.yOffset = 90;
    /** Scroll To anchor */
    $anchorScroll();
  });
