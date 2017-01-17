'use strict';
/**
 * @class trick.profile.details
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.profile.details', ['ngRoute'])

  .config([
    '$routeProvider',
  function($routeProvider) {
      $routeProvider.when('/profile/:uid', {
        templateUrl: '/profile/details/profile.details.html',
        controller: 'ProfileDetailsCtrl'
      });
    }
  ])

  /**
   * @class trick.profile.details.ProfileDetailsCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('ProfileDetailsCtrl', function($scope, $firebaseArray,
    $firebaseObject, $location, $routeParams, Auth, Db) {
    $scope.profile = $routeParams.uid;
    var checklistRef = Db.child('checklist/' + $scope.profile);
    $scope.checklist = $firebaseObject(checklistRef);
    var trickRef = Db.child('tricks');
    $scope.tricks = $firebaseArray(trickRef);
    //var speedRef = Db.child('speed/scores/' + $scope.profile);
    //$scope.speed = $firebaseArray(speedRef);
    var userInfo = Db.child('users/' + $scope.profile + '/profile');
    $scope.info = $firebaseObject(userInfo);

    $scope.keys = function(obj) {
      var length = Object.keys(obj)
        .length;
      return length;
    }

    $scope.total = function(obj) {
      var total = 0;
      var keys = Object.keys(obj)
      keys.pop()
      keys.pop()
      keys.pop()
      keys.forEach(function(key) {
        total += (Object.keys(obj[key])
          .length)
      })
      return total;
    }

    $scope.Number = Number;
  })
