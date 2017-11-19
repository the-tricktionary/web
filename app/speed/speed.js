'use strict'
/* global angular */
/**
 * @class trick.speed
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.speed', ['ngRoute'])

  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/speed', {
        templateUrl: '/speed/speed.html',
        controller: 'SpeedCtrl',
        resolve: {
          'currentAuth': [
            'Auth',
            function (Auth) {
              return Auth.$requireSignIn()
            }
          ]
        }
      })
    }
  ])

  /**
   * @class trick.speed.SpeedCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} $location
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('SpeedCtrl', function ($scope, $firebaseArray, $location, Auth, Db) {
    Auth.$onAuthStateChanged(function () {
      $scope.Subpage('Speed')
      if ($scope.user && !$scope.user.isAnonymous) {
        /** Create reference to databae path */
        var ref = Db.child('speed/scores/' + $scope.user.uid)
        /**
         * @name $scope.events
         * @function
         * @memberOf trick.speed.SpeedCtrl
         * @description create a synchronized array stored in scope
         */
        $scope.events = $firebaseArray(ref)
      } else {
        $location.path('/')
      }
    })
  })
