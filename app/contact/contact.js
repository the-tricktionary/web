'use strict';

angular.module('trick.contact', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/contact', {
        templateUrl: '/contact/contact.html',
        controller: 'ContactCtrl',
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
        var ref = firebase.database().ref().child("contact");
        // create a synchronized array
        $scope.contact = $firebaseArray(ref);

        // connect to storage
        //var storageRef = firebase.storage().ref();

        $scope.submit = function() {
          if(true) {
            $scope.error = undefined;
            $scope.contact.$add({
              name: $scope.newName,
              desc: $scope.newDesc,
              type: $scope.newType
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
