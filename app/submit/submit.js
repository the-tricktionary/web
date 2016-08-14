'use strict';
/**
 * @class trick.submit
 * @memberOf trick
 * @requires ngRoute
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
  
  /**
   * @class trick.submit.SubmitCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} $location
   * @param {service} Auth
   */
  .controller('SubmitCtrl', function($scope, $firebaseArray, $location, Auth) {
    Auth.$onAuthStateChanged(function() {
      if($scope.user) {
        /** Create reference to database path */
        var ref = firebase.database().ref().child("submissions/" + $scope.user.uid);
        /**
         * @name $scope.submissions
         * @function
         * @memberOf trick.submit.SubmitCtrl
         * @description create a synchronized array stored in scope
         */
        $scope.submissions = $firebaseArray(ref);
        
        /**
         * @name $scope.submit
         * @function
         * @memberOf trick.submit.SubmitCtrl
         * @description function to submit a general question
         */
        $scope.submit = function() {
          /** if newName and newDesc and newType and newVideo isn't empty, save to db and redirect to frontpage, if not make error */
          if($scope.newName && $scope.newDesc && $scope.newType && $scope.newVideo) {
            /**
             * @name $scope.error
             * @type {undefined}
             * @description reset error
             */
            $scope.error = undefined;
            /**
             * @description generate random number as string - used to determinate savepath and video location
             * @type {string}
             */
            var random = (Math.random() * 1000000 ).toFixed(0);
            $scope.submissions.$add({
              name: $scope.newName,
              desc: $scope.newDesc,
              type: $scope.newType,
              video: $scope.newVideo
            });
            $location.path('/');
          }
          else {
            /**
             * @name $scope.error
             * @type {string}
             * @description error text
             */
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
