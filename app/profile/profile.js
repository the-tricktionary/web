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
    $firebaseObject, $location, Auth, Db, Messaging) {
    $scope.Subpage('Profile')
    Auth.$onAuthStateChanged(function () {
      if ($scope.user && !$scope.user.isAnonymous) {
        var profileRef = Db.child('users/' + $scope.user.uid + '/profile')
        $scope.profileSettings = $firebaseObject(profileRef)

        var coachesRef = Db.child('users/' + $scope.user.uid + '/coaches')
        $scope.coaches = $firebaseArray(coachesRef)

        var friendrequestsRef = Db.child('users/' + $scope.user.uid + '/friendrequests')
        $scope.friendrequests = $firebaseArray(friendrequestsRef)

        var friendsRef = Db.child('users/' + $scope.user.uid + '/friends')
        $scope.friends = $firebaseArray(friendsRef)

        $scope.addCoach = function (uid) {
          coachesRef.child(uid).set(true, function (err) {
            if (err) {
              $scope.Error(err)
            } else {
              $scope.coUname = ''
            }
          })
        }

        var setToken = function () {
          Messaging.getToken()
            .then(function (token) {
              if (token) {
                console.log('Got the token.')
                Db.child('users').child($scope.user.uid).child('fcm').child('web').push(token)
              }
            })
            .catch(function (err) {
              console.log('Unable to retrieve token ', err)
            })
        }

        $scope.profileSettings.$loaded().then(function () {
          if ($scope.profileSettings.username) Messaging.requestPermission().then(setToken)
        })

        $scope.removeCoach = function (uid) {
          coachesRef.child(uid).remove()
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
              $scope.profileSettings.username = uname.toLowerCase()
              $scope.profileSettings.$save()
              Messaging.requestPermission().then(setToken)
            } else {
              $scope.error = 'Username does alredy exist, please choose another one'
              $scope.checking = false
              $scope.$apply()
            }
          })
        }

        $scope.addFriend = function (uname, uid) {
          friendsRef.child(uname).set({mutual: false}, function (err) {
            if (err) {
              $scope.Error(err)
            } else {
              $scope.frUname = ''
              if (uid) friendrequestsRef.child(uid).remove()
            }
          })
        }

        $scope.removeFriend = function (uname) {
          friendsRef.child(uname).remove()
        }

        $scope.fastcoach = $location.search().coach
        if ($scope.fastcoach && $scope.fastcoach !== '') {
          $scope.addCoach($scope.fastcoach)
        }

        $scope.errcode = $location.search().err
        if ($scope.errcode === 'cnun') {
          $scope.error = 'You must have a username set to access the Coach function'
        }
      } else {
        $location.path('/')
      }
    })
  })
