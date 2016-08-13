'use strict';

angular.module('trick.speed', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/speed', {
        templateUrl: '/speed/speed.html',
        controller: 'SpeedCtrl',
        resolve: {
          "currentAuth": [
            "Auth", function(Auth) {
              return Auth.$requireSignIn();
            }
          ]
        }
      });
    }
  ])
  
  .controller('SpeedCtrl', function($scope, $firebaseObject, $firebaseArray, $location, Auth) {
    Auth.$onAuthStateChanged(function() {
      if($scope.user) {
        var ref = firebase.database().ref().child("speed/" + $scope.user.uid);
        $scope.events = $firebaseArray(ref);
      }
      else {
        $location.path('/');
      }
    })
  });
