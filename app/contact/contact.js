'use strict';

angular.module('trick.contact', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/contact', {
        templateUrl: '/contact/contact.html',
        controller: 'ContactCtrl'
      });
    }
  ])
  
  .controller('ContactCtrl', function($scope, $firebaseArray, Auth) {
    var ref = firebase.database().ref().child("contact");
    // create a synchronized array
    $scope.contact = $firebaseArray(ref);
    
    
    $scope.submitGen = function() {
      if($scope.user.uid == undefined) {
        $scope.user.displayName = document.getElementById('name').value;
      }
      var issue = document.getElementById('desc').value;
      
      if($scope.user.displayName && issue !== "") {
        $scope.error = undefined;
        $scope.contact.$add({
          name: $scope.user.displayName,
          desc: issue
        });
        $location.path('/');
      }
      else {
        $scope.error = "You need to enter a value into all fields"
      }
    };
    
    $scope.submitLev = function() {
      if($scope.user.uid == undefined) {
        $scope.user.displayName = document.getElementById('name').value;
      }
      var newOrg = document.getElementById('org').value;
      var newId0 = document.getElementById('id0').value;
      var newId1 = document.getElementById('id1').value;
      var newLvl = document.getElementById('level').value;
      
      if($scope.user.displayName && newId0 && newId1 && newLvl && newOrg) {
        $scope.error = undefined;
        $scope.contact.$add({
          name: $scope.user.displayName,
          id0: newId0,
          id1: newId1,
          level: newLvl,
          org: newOrg
        });
        $location.path('/');
      }
      else {
        $scope.error = "You need to enter a value into all fields"
      }
    };
  });
