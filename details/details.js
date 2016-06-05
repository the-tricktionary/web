'use strict';

angular.module('trick.details', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/details/:id/:id2', {
    templateUrl: 'details/details.html',
    controller: 'DetailsCtrl'
  });
}])

.controller('DetailsCtrl', function($scope, $firebaseArray, $routeParams, $location) {
    var ref      = firebase.database().ref().child("todos");
    // create a synchronized array
    $scope.todos = $firebaseArray(ref);
    $scope.id    = $routeParams.id
    $scope.id2   = $routeParams.id2
});
