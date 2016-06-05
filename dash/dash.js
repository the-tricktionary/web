'use strict';

angular.module('trick.dash', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dash', {
    templateUrl: 'dash/dash.html',
    controller: 'DashCtrl'
  });
}])

.controller('DashCtrl', function($scope, $firebaseArray) {
  var ref = firebase.database().ref().child("tricks");
  // create a synchronized array
  $scope.data = $firebaseArray(ref);
});
