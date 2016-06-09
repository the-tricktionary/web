'use strict';

angular.module('trick.submit', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/submit', {
        templateUrl: '/submit/submit.html',
        controller: 'SubmitCtrl'
      });
    }
  ])
  
  .controller('SubmitCtrl', function($scope, $firebaseArray, $firebaseAuth, Auth) {
    $scope.signIn = function() {
      $scope.user = null;
      $scope.error = null;
      Auth.$signInWithPopup("google")
        .then(function(firebaseUser) {
          $scope.user = firebaseUser;
        })
        .catch(function(error) {
          $scope.error = error;
        });
    };

    $scope.signOut = function() {
      Auth.$signOut();
    };

    // any time auth status updates, add the user data to scope
    Auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.user = firebaseUser;
    });

    //var ref = firebase.database().ref().child("submissions/" + $scope.user.uid);
    // create a synchronized array
    //$scope.user.submissions = $firebaseArray(ref);

    if ($scope.newFile) {
      var startIndex = ($scope.newFile.indexOf('\\') >= 0 ? $scope.newFile.lastIndexOf('\\') : $scope.newFile.lastIndexOf('/'));
      var filename = $scope.newFile.substring(startIndex);
      if(filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
      }
      return filename;
    }

    // connect to storage
    var storageRef = firebase.storage().ref();

    $scope.submit = function() {
      $scope.submissions.$add({
        name: $scope.newName,
        desc: $scope.newDesc,
        type: $scope.newType
      });
      var folder = storageRef.child('submissions/' + $scope.user.uid + "/" + filename);

    };
  });
