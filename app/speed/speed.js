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
        var ref = firebase.database().ref().child("speed/events/" + $scope.user.uid);
        $scope.events = $firebaseArray(ref);
        
        $scope.newSpeed = function() {
          // Generate random nuber that'll serve as event id
          var min = 1000;
          var max = 1000000;
          var id = Math.floor(Math.random() * (max - min)) + min;

          var refNew = firebase.database().ref().child("speed/events/" + $scope.user.uid + "/" + id);
          // create a synchronized array
          var speed = $firebaseObject(refNew);
          speed.pools = 0;
          speed.heats = 1;
          speed.$save().then(function() {
            $location.path('/speed/' + id)
          })
        };
      }
      else {
        $location.path('/');
      }
    })
  });
