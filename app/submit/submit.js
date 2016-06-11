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
  
  .controller('SubmitCtrl', function($scope, $rootScope, $firebaseArray, $firebaseAuth, Auth) {
    if($rootScope.user) {
      var ref = firebase.database().ref().child("submissions/" + $scope.user.uid);
      // create a synchronized array
      $rootScope.user.submissions = $firebaseArray(ref);
    }

    // connect to storage
    //var storageRef = firebase.storage().ref();

    $scope.submit = function() {
      $scope.submissions.$add({
        name: $scope.newName,
        desc: $scope.newDesc,
        type: $scope.newType,
        video: $scope.newVideo
      });
      var folder = storageRef.child('submissions/' + $scope.user.uid + "/" + filename);

    };
  });
