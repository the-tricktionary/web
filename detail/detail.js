'use strict';

angular.module('trick.detail', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/edit/:id/:id2', {
    templateUrl: 'detail/detail.html',
    controller: 'EditCtrl'
  });
}])

.controller('EditCtrl', function($scope, $firebaseArray, $routeParams, $location) {
    var ref      = firebase.database().ref().child("todos");
    // create a synchronized array
    $scope.todos = $firebaseArray(ref);
    $scope.id    = $routeParams.id
    $scope.id2   = $routeParams.id2
});
