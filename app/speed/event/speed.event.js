'use strict';

angular.module('trick.speed.event', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/event/:id', {
        templateUrl: '/speed/event/speed.event.html',
        controller: 'SpeedEventCtrl',
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
  
  .controller('SpeedEventCtrl', function($scope, $firebaseObject, $firebaseArray, $routeParams, $location, Auth) {
    Auth.$onAuthStateChanged(function() {
      if($scope.user) {
        var ref = firebase.database().ref().child("speed/events/" + $scope.user.uid + "/" + $routeParams.id);
        var ref2 = firebase.database().ref().child("speed/scores");
        // create a synchronized array
        $scope.event = $firebaseObject(ref);
        $scope.scores = $firebaseArray(ref2);
        
        $scope.delEvent = function() {
          $scope.event.$remove();
          $location.path('/speed');
        };
        
        $scope.seeLive = function() {
          $location.path('/live/' + $scope.event.$id)
        };
        
        $scope.updateCounters = function() {
          if($scope.event.judges && $scope.event.judges[$scope.event.pools]) {
            $scope.event.judges[$scope.event.pools] = null;
          }
          $scope.event.$save();
        };
        
        $scope.getNumber = function(num) {
          return new Array(num);
        };
        
        $scope.updateTrack = function() {
          $scope.event.$save();
          
        }
      }
      else {
        $location.path('/');
      }
    });
  });
