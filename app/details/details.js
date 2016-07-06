'use strict';

angular.module('trick.details', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/details/:id0/:id1', {
        templateUrl: '/details/details.html',
        controller: 'DetailsCtrl'
      });
    }
  ])
  
  .controller('DetailsCtrl', function($scope, $firebaseObject, $routeParams, $sce, $location) {
    $scope.id0 = $routeParams.id0;
    $scope.id1 = Number($routeParams.id1);
    var ref = firebase.database().ref().child("tricks/" + $scope.id0 + "/subs/" + $scope.id1);
    // create a synchronized array
    $scope.trick = $firebaseObject(ref);
    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
  });
