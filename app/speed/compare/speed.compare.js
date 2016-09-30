'use strict';
/**
 * @class trick.speed.details
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.speed.compare', ['ngRoute'])

.config([
    '$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/speed/compare/:id0?/:id1?', {
      templateUrl: '/speed/compare/speed.compare.html',
      controller: 'SpeedCompareCtrl',
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
 * @class trick.speed.details.SpeedDetailsCtrl
 * @param {service} $scope
 * @param {service} $firebaseObject
 * @param {service} $routeParams
 * @param {service} $location
 * @param {service} Auth
 * @param {service} Db
 */
.controller('SpeedCompareCtrl', function($scope, $firebaseObject,
  $firebaseArray, $routeParams, $location, $filter, Auth, Db) {
  Auth.$onAuthStateChanged(function() {
    if ($scope.user) {
      /**
       * @name $scope.id0
       * @type {string}
       * @memberOf trick.speed.details.SpeedDetailsCtrl
       */
      $scope.id0 = $routeParams.id0;
      /**
       * @name $scope.id1
       * @type {string}
       * @memberOf trick.speed.details.SpeedDetailsCtrl
       */
      $scope.id1 = $routeParams.id1;

      if ($scope.id0 && $scope.id1) {
        $scope.select = false;
        /** Create reference to database path */
        var ref = Db.child("speed/scores/" + $scope.user.uid + "/" +
          $scope.id0);
        /**
         * @name $scope.event
         * @function
         * @memberOf trick.speed.details.SpeedDetailsCtrl
         * @description create a synchronized *object* stored in scope
         */
        $scope.event = $firebaseObject(ref);
        /** Create reference to database path */
        var ref1 = Db.child("speed/scores/" + $scope.user.uid + "/" +
          $scope.id1);
        /**
         * @name $scope.event1
         * @function
         * @memberOf trick.speed.details.SpeedDetailsCtrl
         * @description create a synchronized *object* stored in scope
         */
        $scope.event1 = $firebaseObject(ref1);
        /**
         * @name $scope.$location
         * @function
         * @description get the service $location into scope for use in template
         */
        $scope.$location = $location;

        var outData = {
          labels: [],
          series: [
            {
              name: 'id0',
              data: [
                {}
                ]
              },
            {
              name: 'id1',
              data: [
                {}
                ]
              }
            ]
        };

        /**
         * @name parse
         * @memberOf trick.speed.details.SpeedDetailsCtrl
         * @function
         * @param parseData
         * @param duration
         * @returns {{labels: Array, series: *[]}}
         */
        var parse = function(parseData, n, duration) {
          outData.labels = [];
          outData.series[n].data = [];
          var parseDataLength = parseData.length;
          for (var i = 0; i < parseDataLength; i++) {
            outData.series[n].data[i] = {
              x: (duration / parseDataLength * i * 1000),
              y: 100 * (1 / (parseData[i] - parseData[i - 1]))
            }
          }
          for (var i = 0; i <= duration; i++) {
            outData.labels[i] = $filter('date')(i * 1000, 'mm:ss')
          }
          outData.series[n].data.shift();
          chartOptions.high = arrayMax(outData.series[0].data.concat(
              outData.series[1].data)) + 2,
            chart.update(outData, chartOptions);
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
          axisX: {
            type: Chartist.FixedScaleAxis,
            divisor: 5,
            labelInterpolationFnc: function(value) {
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
                labelInterpolationFnc: function(value, index) {
                  return index % 17 === 0 ? value : null;
                }
              }
            }
            ]
          ];

        /**
         * @description Create chart, update function not currently needed as chartData shouldn't change.
         */
        var chart = new Chartist.Line('.ct-chart', null, chartOptions,
          chartOptionsResponsive);

        /**
         * @name $scope.event.$watch
         * @function
         * @memberOf trick.speed.details.SpeedDetailsCtrl
         */
        $scope.event.$watch(function() {
          /**
           * @name chartData
           * @memberOf trick.speed.details.SpeedDetailsCtrl
           * @type {{labels: Array, series: *[]}}
           */
          parse($scope.event.graphData, 0, $scope.event.time);
        })

        $scope.event1.$watch(function() {
          /**
           * @name chartData
           * @memberOf trick.speed.details.SpeedDetailsCtrl
           * @type {{labels: Array, series: *[]}}
           */
          parse($scope.event1.graphData, 1, $scope.event1.time);
        })

      } else
      if (!$scope.id0) {
        $location.path('/speed');
      } else {
        $scope.select = true;
        /** Create reference to databae path */
        var ref = Db.child("speed/scores/" + $scope.user.uid);
        /**
         * @name $scope.events
         * @function
         * @memberOf trick.speed.SpeedCtrl
         * @description create a synchronized array stored in scope
         */
        $scope.events = $firebaseArray(ref);
        $scope.events.$watch(function() {
          ($scope.events.$indexFor($scope.id0) >= 0 ? $scope.time =
            $scope.events[$scope.events.$indexFor($scope.id0)].time :
            null);
        })
      }
    } else {
      $location.path('/');
    }
  })
});
