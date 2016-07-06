'use strict';

angular.module('trick.dash', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/', {
        templateUrl: '/dash/dash.html',
        controller: 'DashCtrl'
      });
    }
  ])
  
  .controller('DashCtrl', function($scope, $firebaseArray, $anchorScroll, $location) {
    var ref = firebase.database().ref().child("tricks");
    // create a synchronized array
    $scope.data = $firebaseArray(ref);
    $scope.anchor = $location.hash();
    $anchorScroll.yOffset = 90;
    $anchorScroll();
  });
