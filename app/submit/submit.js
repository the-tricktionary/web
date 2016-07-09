'use strict';

angular.module('trick.submit', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/submit', {
        templateUrl: '/submit/submit.html',
        controller: 'SubmitCtrl',
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
  
  .controller('SubmitCtrl', function($scope, $firebaseArray, Auth, $location) {
    Auth.$onAuthStateChanged(function() {
      if($scope.user) {
        var ref = firebase.database().ref().child("submissions/" + $scope.user.uid);
        // create a synchronized array
        $scope.submissions = $firebaseArray(ref);

        // connect to storage
        //var storageRef = firebase.storage().ref();

        $scope.submit = function() {
          if($scope.newName && $scope.newDesc && $scope.newType && $scope.newVideo) {
            $scope.error = undefined;
            $scope.submissions.$add({
              name: $scope.newName,
              desc: $scope.newDesc,
              type: $scope.newType,
              video: $scope.newVideo
            });
            $location.path('/');
            //var folder = storageRef.child('submissions/' + $scope.user.uid + "/" + filename);
          }
          else {
            $scope.error = "You need to enter a value into all fields"
          }
        }
      }
      else {
        $location.path('/');
      }
    })
  })
;
