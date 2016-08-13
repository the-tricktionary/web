'use strict';
/**
 * @class trick.submit
 * @memberOf trick
 */
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
            var random = (Math.random() * 1000000 ).toFixed(0);
            var storageRef = firebase.storage.ref("submisions/" + random);
            var fileUpload = document.getElementById("fileUpload");
            fileUpload.on('change', function(evt) {
              var firstFile = evt.target.file[0]; // get the first file uploaded
              var uploadTask = storageRef.put(firstFile);
            });
            $scope.submissions.$add({
              name: $scope.newName,
              desc: $scope.newDesc,
              type: $scope.newType,
              video: random
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
