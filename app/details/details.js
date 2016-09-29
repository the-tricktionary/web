'use strict';
/**
 * @class trick.details
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.details', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/details/:id0/:id1', {
        templateUrl: '/details/details.html',
        controller: 'DetailsCtrl'
      });
    }
  ])

  /**
   * @class trick.details.DetailsCtrl
   * @param {service} $scope
   * @param {service} $firebaseObject
   * @param {service} $routeParams
   * @param {service} $sce
   * @param {service} Db
   */
  .controller('DetailsCtrl', function($scope, $firebaseObject, $routeParams, $sce, Db) {
    /**
     * @name $scope.id0
     * @type {string}
     * @memberOf trick.details.DetailsCtrl
     */
    $scope.id0 = $routeParams.id0;
    /**
     * @name $scope.id1
     * @type {string}
     * @memberOf trick.details.DetailsCtrl
     */
    $scope.id1 = Number($routeParams.id1);
    /** Create reference to database path */
    var ref = Db.child("tricks/" + $scope.id0 + "/subs/" + $scope.id1);
    /**
     * @name $scope.trick
     * @function
     * @memberOf trick.details.DetailsCtrl
     * @description create a synchronized *object* stored in scope
     */
    $scope.trick = $firebaseObject(ref);
    /**
     * @name $scope.trustAsResourceUrl
     * @function
     * @description Trust url constructed on page for video as usable
     */
    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
  });
