'use strict';

angular.module('trick.speed.live', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/live/:id', {
        templateUrl: '/speed/live/speed.live.html',
        controller: 'SpeedLiveCtrl'
      });
    }
  ])
  

  .controller('SpeedLiveCtrl', function($scope, $firebaseArray, $firebaseObject, $routeParams, $location, Auth) {
    // TODO: Allow users that aren't signed in
    Auth.$onAuthStateChanged(function() {
      if($scope.user) {
        $scope.id = $routeParams.id;
        var ref = firebase.database().ref().child("speed/events/" + $scope.user.uid + "/" + $scope.id);
        var refJ = ref.child("/judges");
        // create a synchronized array
        $scope.event = $firebaseObject(ref);
        $scope.judges = $firebaseArray(refJ);

        $scope.getNumber = function(num) {
          return new Array(num);
        };

        $scope.judges.$watch(
          function() {
            var len = $scope.judges.length;
            $scope.judge = [];
            var jRef = [];
            $scope.jData = [];
            for(var i = 0; i < len; i++) {
              $scope.judge[i] = $scope.judges[i].$value.split(" ");
              $scope.judge[i] = $scope.judge[i][$scope.judge[i].length - 1];
              jRef[i] = firebase.database().ref().child("speed/scores/" + $scope.judge[i] + "/" + $scope.id); //.orderByChild("event").equalTo($scope.id);
              $scope.jData[i] = $firebaseArray(jRef[i]);
            }
          })
      }
      else {
        $location.path('/')
      }
    })
  });
