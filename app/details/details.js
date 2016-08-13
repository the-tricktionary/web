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
   */
  .controller('DetailsCtrl', function($scope, $firebaseObject, $routeParams, $sce) {
    $scope.id0 = $routeParams.id0;
    $scope.id1 = Number($routeParams.id1);
    var ref = firebase.database().ref().child("tricks/" + $scope.id0 + "/subs/" + $scope.id1);
    // create a synchronized array
    $scope.trick = $firebaseObject(ref);
    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
  });
