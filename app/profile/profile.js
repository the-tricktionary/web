'use strict'
/* global angular */
/**
 * @class trick.profile
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.profile', ['ngRoute'])

  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/profile', {
        templateUrl: '/profile/profile.html',
        controller: 'ProfileCtrl',
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
   * @class trick.profile.ProfileCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('ProfileCtrl', function ($scope, $firebaseArray,
    $firebaseObject, $location, Auth, Db) {
    $scope.Subpage('Profile')
    Auth.$onAuthStateChanged(function () {
      if ($scope.user && !$scope.user.isAnonymous) {
        var profileRef = Db.child('users/' + $scope.user.uid + '/profile')
        $scope.profileSettings = $firebaseObject(profileRef)

        var coachesRef = Db.child('users/' + $scope.user.uid + '/coaches')
        $scope.coaches = $firebaseArray(coachesRef)

        $scope.addCoach = function (uid) {
          if (uid) {
            $scope.uid = uid
          }
          var studentsRef = Db.child('users/' + $scope.uid +
            '/students/' +
            $scope.user
            .uid)
          studentsRef.set($scope.user.displayName, function (err) {
            if (err) {
              $scope.Error(err)
            } else {
              coachesRef.child($scope.uid)
                .set(true, function (err) {
                  if (err) {
                    $scope.Error(err)
                  } else {
                    $scope.coach = ''
                  }
                })
            }
          })
        }

        $scope.setUsername = function (uname) {
          console.log(uname)
          $scope.error = ''
          if (RegExp('[^A-Za-z0-9]').test(uname)) {
            $scope.error = 'Your username can only contain alphanumerical characters (A-Z, a-z, 0-9)'
            return
          }
          $scope.checking = true
          Db.child('/usernames').child(uname).once('value', function (snapshot) {
            var data = snapshot.val()
            console.log(data)
            if (data === null || data === $scope.user.uid) {
              $scope.profileSettings.username = uname
              $scope.profileSettings.$save()
            } else {
              $scope.error = 'Username does alredy exist, please choose another one'
              $scope.checking = false
              $scope.$apply()
            }
          })
        }

        $scope.delCoach = function (uid) {
          var studentsRef = Db.child('users/' + uid + '/students/' +
            $scope.user
            .uid)
          studentsRef.set(null, function (err) {
            if (err) {
              $scope.Error(err)
            } else {
              coachesRef.child(uid)
                .set(null, function (err) {
                  $scope.Error(err)
                })
            }
          })
        }

        $scope.fastcoach = $location.search()
          .coach
        if ($scope.fastcoach && $scope.fastcoach !== '') {
          $scope.addCoach($scope.fastcoach)
        }
      } else {
        $location.path('/')
      }
    })
  })
