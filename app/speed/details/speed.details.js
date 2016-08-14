'use strict';
/**
 * @class trick.speed.details
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.speed.details', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/speed/:id', {
        templateUrl: '/speed/details/speed.details.html',
        controller: 'SpeedDetailsCtrl',
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
  
  /**
   * @class trick.speed.details.SpeedDetailsCtrl
   * @param {service} $scope
   * @param {service} $firebaseObject
   * @param {service} $routeParams
   * @param {service} $location
   * @param {service} Auth
   */
  .controller('SpeedDetailsCtrl', function($scope, $firebaseObject, $routeParams, $location, Auth) {
    Auth.$onAuthStateChanged(function() {
      if($scope.user) {
        /**
         * @name $scope.id0
         * @type {string}
         * @memberOf trick.speed.details.SpeedDetailsCtrl
         */
        $scope.id = $routeParams.id;
        /** Create reference to database path */
        var ref = firebase.database().ref().child("speed/scores/" + $scope.user.uid + "/" + $scope.user.displayName + "/" + $scope.id);
        /**
         * @name $scope.event
         * @function
         * @memberOf trick.speed.details.SpeedDetailsCtrl
         * @description create a synchronized *object* stored in scope
         */
        $scope.event = $firebaseObject(ref);
        /**
         * @name $scope.$location
         * @function
         * @description get the service $location into scope for us in template
         */
        $scope.$location = $location;
      }
      else {
        $location.path('/');
      }
    })
  });
