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
    $firebaseObject, $location, $routeParams, $filter, Auth, Db) {
    $scope.Subpage("Profile")
    $scope.profile = $routeParams.uid;
    var checklistRef = Db.child('checklist/' + $scope.profile);
    $scope.checklist = $firebaseObject(checklistRef);
    var trickRef = Db.child('tricks');
    $scope.tricks = $firebaseArray(trickRef);
    var speedRef = Db.child('speed/highscores/' + $scope.profile);
    $scope.highscores = $firebaseArray(speedRef);
    var userInfo = Db.child('users/' + $scope.profile + '/profile');
    $scope.info = $firebaseObject(userInfo);

    var abbrs = {
      pt1: {
        sr: "Single Rope",
        dd: "Double Dutch",
      },
      pt2: {
        s: "", // Single (One person)
        p: "Pair",
        t: "Three people",
        f: "Team",
      },
      pt3: {
        s: "Speed",
        p: "Power",
        t: "Tripple Unders"
      }
    }

    $scope.info.$loaded()
      .then(function() {
        $scope.Subpage($scope.info.name[0] + "'s Profile")
      })

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

    $scope.abbr = function(abbr) {
      var pt1 = abbr.substring(0, 2)
      var pt2 = abbr.substring(2, 3)
      var pt3 = abbr.substring(3, 4)
      var hr = abbrs.pt1[pt1] + ' ' + abbrs.pt2[pt2] + ' ' + abbrs.pt3[pt3]
      return hr;
    }

    /**
     * @name parse
     * @memberOf trick.speed.details.SpeedDetailsCtrl
     * @function
     * @param parseData
     * @param duration
     * @returns {{labels: Array, series: *[]}}
     */
    var parse = function(parseData, duration) {
      var outData = {
        labels: [],
        series: [
          {
            name: 'a',
            data: []
          }
        ]
      };
      var parseDataLength = parseData.length;
      for (var i = 0; i < parseDataLength; i++) {
        outData.series[0].data[i] = {
          x: (duration / parseDataLength * i * 1000),
          y: 100 * (1 / (parseData[i] - parseData[i - 1]))
        }
      }
      for (var i = 0; i <= duration; i++) {
        outData.labels[i] = $filter('date')(i * 1000, 'mm:ss')
      }
      outData.series[0].data.shift();
      return outData;
    };

    /**
     * @name arrayMax
     * @function
     * @memberOf trick.speed.details.SpeedDetailsCtrl
     * @param array
     * @returns {*}
     */
    var arrayMax = function(array) {
      return array.map(function(el) {
          return el.y
        })
        .reduce(function(a, b) {
          return Math.max(a, b);
        });
    };

    $scope.buildChart = function(data, dur, el) {
      /**
       * @name chartData
       * @memberOf trick.speed.details.SpeedDetailsCtrl
       * @type {{labels: Array, series: *[]}}
       */
      var chartData = parse(data, dur);
      /**
       * @name chartOptions
       * @memberOf trick.speed.details.SpeedDetailsCtrl
       * @type {{chartPadding: {top: number, right: number, bottom: number, left: number}, showArea: boolean, showLine: boolean, showPoint: boolean, high: *, axisX: {labelInterpolationFnc: chartOptions.axisX.labelInterpolationFnc}, onlyInteger: boolean, plugins: *[]}}
       */
      var chartOptions = {
        chartPadding: {
          top: 20,
          right: 0,
          bottom: 30,
          left: 0
        },
        showArea: true,
        showLine: true,
        showPoint: false,
        high: arrayMax(chartData.series[0].data) + 2,
        axisX: {
          type: Chartist.FixedScaleAxis,
          divisor: 5,
          labelInterpolationFnc: function(value, index) {
            return $filter('date')(value, 'mm:ss');
          }
        },
        onlyInteger: true,
        plugins: [
          Chartist.plugins.ctAxisTitle({
            axisX: {
              axisTitle: 'Time',
              axisClass: 'ct-axis-title',
              offset: {
                x: 0,
                y: 50
              },
              textAnchor: 'middle'
            },
            axisY: {
              axisTitle: 'Jumps',
              axisClass: 'ct-axis-title',
              offset: {
                x: 0,
                y: 0
              },
              textAnchor: 'middle',
              flipTitle: false
            }
          })
        ]
      };

      /**
       * @name chartOptionsResponsive
       * @memberOf trick.speed.details.SpeedDetailsCtrl
       * @type {*[]}
       */
      var chartOptionsResponsive = [
        [
          'screen and (max-width: 800px)', {
            axisX: {
              divisor: 5
            }
        }
        ]
      ];
      /**
       * @description Create chart, update function not currently needed as chartData shouldn't change.
       */
      new Chartist.Line('#' + el, chartData, chartOptions,
        chartOptionsResponsive);
    }

    $scope.Number = Number;
  })
