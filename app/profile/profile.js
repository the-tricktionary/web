'use strict';
/**
 * @class trick.profile
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.profile', ['ngRoute'])

  .config([
    '$routeProvider',
  function($routeProvider) {
      $routeProvider.when('/profile', {
        templateUrl: '/profile/profile.html',
        controller: 'ProfileCtrl',
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
   * @class trick.profile.ProfileCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('ProfileCtrl', function($scope, $firebaseArray,
    $firebaseObject, $location, Auth, Db) {
    Auth.$onAuthStateChanged(function() {
      if ($scope.user && !$scope.user.isAnonymous) {
        var profileRef = Db.child('users/' + $scope.user.uid + '/profile');
        $scope.profileSettings = $firebaseObject(profileRef);

        var coachesRef = Db.child('users/' + $scope.user.uid + '/coaches')
        $scope.coaches = $firebaseArray(coachesRef);

        $scope.addCoach = function(uid) {
          if (uid) {
            $scope.uid = uid;
          }
          var studentsRef = Db.child('users/' + $scope.uid +
            "/students/" +
            $scope.user
            .uid);
          studentsRef.set($scope.user.displayName, function(err) {
            if (err) {
              $scope.Error(err);
            } else {
              coachesRef.child($scope.uid)
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
          var studentsRef = Db.child('users/' + uid + "/students/" +
            $scope.user
            .uid);
          studentsRef.set(null, function(err) {
            if (err) {
              $scope.Error(err);
            } else {
              coachesRef.child(uid)
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
        $location.path('/');
      }
    })
  })
