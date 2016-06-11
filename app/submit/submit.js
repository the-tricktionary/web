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
        $scope.user.submissions = $firebaseArray(ref);

        // connect to storage
        //var storageRef = firebase.storage().ref();

        $scope.submit = function() {
          $scope.submissions.$add({
            name: $scope.newName,
            desc: $scope.newDesc,
            type: $scope.newType,
            video: $scope.newVideo
          });
          //var folder = storageRef.child('submissions/' + $scope.user.uid + "/" + filename);
        }
      }
      else {
        $location.path('/');
      }
    })
  });
