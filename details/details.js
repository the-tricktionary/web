'use strict';

angular.module('trick.details', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/details/:id0/:id1', {
    templateUrl: '/details/details.html',
    controller: 'DetailsCtrl'
  });
}])

.controller('DetailsCtrl', function($scope, $firebaseObject, $routeParams, $sce) {
  var id0 = $routeParams.id0;
  var id1 = Number($routeParams.id1);
  var ref = firebase.database().ref().child("tricks/" + id0 + "/subs/" + id1);
  // create a synchronized array
  $scope.trick = $firebaseObject(ref);

  $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
});
