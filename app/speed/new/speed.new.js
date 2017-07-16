/* global angular, performance */
'use strict'
/**
 * @class trick.speed
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.speed.new', ['ngRoute'])

  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/speed/new', {
        templateUrl: '/speed/new/speed.new.html',
        controller: 'SpeedNewCtrl',
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
  .controller('SpeedNewCtrl', function ($scope, $firebaseObject, $location,
    $interval, Auth,
    Db) {
    Auth.$onAuthStateChanged(function () {
      $scope.Subpage('New Speed Event')
      if ($scope.user && !$scope.user.isAnonymous) {
        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate ||
          navigator.mozVibrate || navigator.msVibrate

        var highscoreRef = Db.child('/speed/highscores/' + $scope.user.uid)
        var highscores = $firebaseObject(highscoreRef)

        $scope.started = false
        var first = false
        var jumps = []
        var highTimes = [0, 30, 60, 120, 180]
        var ticker
        $scope.duration = 0
        $scope.score = 0
        $scope.toGo = 0

        $scope.add = function () {
          if (!first) {
            first = true
            $scope.start($scope.duration)
          }
          if ($scope.started) {
            $scope.score++
            jumps.push(performance.now())
            navigator.vibrate(75)
          }
        }

        $scope.start = function () {
          if ($scope.duration === -1) {
            $scope.duration = $scope.cdur
          }
          $scope.started = true
          $scope.toGo = $scope.duration * 1000
          $scope.score = 0
          jumps = [
            performance.now()
          ]
          if ($scope.duration !== 0) {
            setTimeout($scope.stop, ($scope.duration * 1000), jumps)
          }
          $scope.timer(performance.now(), true)
          navigator.vibrate(75)
        }

        $scope.timer = function (start, s) {
          if (s) {
            if ($scope.duration === 0) {
              ticker = $interval(function () {
                ++$scope.toGo
              }, 1000)
            } else {
              ticker = $interval(function () {
                --$scope.toGo
              }, 1000)
            }
          } else {
            $interval.cancel(ticker)
          }
        }

        $scope.templStop = function () {
          $scope.stop(jumps)
        }

        $scope.stop = function (jumps) {
          $scope.started = false
          $scope.timer(0, false)
          navigator.vibrate(500)
          for (var i = jumps.length - 1; i >= 0; i--) {
            jumps[i] = (jumps[i] - jumps[0]) / 10
          }
          jumps.shift()
          var data = {
            score: $scope.score,
            time: (Number($scope.duration) || Math.round(Number(
              $scope.toGo) / 1000)),
            name: '',
            'event': ($scope.event || ''),

            avgJumps: avgJumps(jumps),
            maxJumps: maxJumps(jumps),
            graphData: scrubTimes(jumps)
          }
          data.misses = misses(jumps, data.avgJumps)

          if (data.misses === 0) {
            data.noMissScore = data.score
            data.jumpsLost = 0
          } else {
            data.noMissScore = Math.round((data.score + (data.avgJumps *
                data.misses)) +
              1)
            data.jumpsLost = data.noMissScore - data.score
          }
          var now = Math.round(new Date()
            .getTime() / 1000)
          var eventRef = Db.child('/speed/scores/' + $scope.user.uid +
            '/' +
            now)
          var duration = Number($scope.duration)
          eventRef.set(data)
            .then(function () {
              if (highTimes.indexOf(duration) !== -1 &&
                data.event !== '' &&
                (!highscores[duration] ||
                  !highscores[duration][data.event] ||
                  data.score > highscores[duration][data.name].score)
              ) {
                if (!highscores[duration]) {
                  highscores[duration] = {}
                }
                highscores[duration][data.event] = data
                highscores.$save()
                  .then(function () {
                    $location.path('/speed/details/' + now)
                  })
              } else {
                $location.path('/speed/details/' + now)
              }
            })
        }

        function avgJumps (arr) {
          var avg = 0
          for (var i = 1; i < arr.length; i++) {
            avg += 100 * (1 / (arr[i] - arr[i - 1]))
          }
          avg = avg / arr.length
          avg = Math.round(avg * 100) / 100
          return avg
        }

        function maxJumps (arr) {
          var max = 0
          var jps = 0
          for (var i = 1; i < arr.length; i++) {
            jps = 100 * (1 / (arr[i] - arr[i - 1]))
            if (jps >= max) {
              max = jps
            }
          }
          max = Math.round(max * 100)
          max = max / 100
          return max
        }

        function misses (arr, avgjps) {
          var misses = 0
          var curjps = 0
          for (var i = 1; i < arr.length; i++) {
            curjps = 100 * (1 / (arr[i] - arr[i - 1]))
            if ((avgjps / curjps) > 1.5) {
              misses++
            }
          }
          return misses
        }

        function scrubTimes (arr) {
          var scrubbed = []
          for (var i = 1; i < arr.length; i += 2) {
            scrubbed.push(Math.round((arr[i] + arr[i - 1]) / 2))
          }
          return scrubbed
        }
      } else {
        $location.path('/')
      }
    })
  })
