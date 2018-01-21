'use strict'
/* global angular */
/**
 * @class trick.coach
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.coach', ['ngRoute'])

  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/coach', {
        templateUrl: '/coach/coach.html',
        controller: 'CoachCtrl',
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
   * @class trick.coach.CoachCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('CoachCtrl', function ($scope, $firebaseArray, $firebaseObject, $location,
    Auth, Db) {
    Auth.$onAuthStateChanged(function () {
      $scope.Subpage('Coach')
      if ($scope.user && !$scope.user.isAnonymous) {
        var ref = Db.child('tricks')
        $scope.data = $firebaseArray(ref)
        var ref1 = Db.child('users/' + $scope.user.uid + '/students')
        $scope.students = $firebaseArray(ref1)
        var profileRef = Db.child('users/' + $scope.user.uid + '/profile/username')
        $scope.uname = $firebaseObject(profileRef)

        $scope.checklists = {}
        var refs = []

        $scope.students.$loaded()
          .then(function () {
            for (var student = 0; student < $scope.students.length; student++) {
              refs[student] = Db.child('checklist/' + $scope.students[student].$id)
              $scope.checklists[$scope.students[student].$id] =
                $firebaseArray(refs[student])
            }
          })

        $scope.uid = $scope.user.uid
      } else {
        $location.path('/')
      }
    })
  })
