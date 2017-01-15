'use strict';
/**
 * @class trick.ahare
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.share', ['ngRoute'])

  .config([
    '$routeProvider',
  function($routeProvider) {
      $routeProvider.when('/share', {
        templateUrl: '/share/share.html',
        controller: 'ShareCtrl',
        resolve: {
          "currentAuth": [
            "Auth",
            function(Auth) {
              return Auth.$requireSignIn();
            }
          ]
        }
      });
    }
  ])

  /**
   * @class trick.share.ShareCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('ShareCtrl', function($scope, $firebaseArray, $firebaseObject,
    $location, Auth, Db) {
    Auth.$onAuthStateChanged(function() {
      if ($scope.user && !$scope.user.isAnonymous) {
        var ref = Db.child('users/' + $scope.user.uid + '/coaches')
        $scope.coaches = $firebaseArray(ref);

        $scope.addCoach = function() {
          var ref1 = Db.child('users/' + $scope.uid + "/students/" +
            $scope.user
            .uid);
          ref1.set($scope.user.displayName, function(err) {
            if (err) {
              $scope.Error(err);
            } else {
              ref.child($scope.uid)
                .set(true, function(err) {
                  if (err) {
                    $scope.Error(err);
                  } else {
                    $scope.coach = "";
                  }
                })
            }
          })
        }

        $scope.delCoach = function(uid) {
          var ref1 = Db.child('users/' + uid + "/students/" + $scope.user
            .uid);
          ref1.set(null, function(err) {
            if (err) {
              $scope.Error(err);
            } else {
              ref.child(uid)
                .set(null, function(err) {
                  $scope.Error(err);
                })
            }
          })
        }

        $scope.fastcoach = $location.search()
          .coach;
        if ($scope.fastcoach && $scope.fastcoach !== "") {
          $scope.addCoach($scope.fastcoach);
        }
      } else {
        $loaction.path('/');
      }
    })
  })
