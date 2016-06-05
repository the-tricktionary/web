'use strict';

angular.module('trick.details', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/details/:id/:id2', {
    templateUrl: 'details/details.html',
    controller: 'DetailsCtrl'
  });
}])

.controller('DetailsCtrl', function($scope, $firebaseArray, $routeParams, $filter, $sce) {
    var ref = firebase.database().ref().child("tricks");
    // create a synchronized array
    $scope.data = $firebaseArray(ref)
    $scope.id = $routeParams.id
    $scope.id2 = Number($routeParams.id2)
    
    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
    $scope.videosce = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.data.video);
});
