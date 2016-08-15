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
  .controller('SpeedDetailsCtrl', function($scope, $firebaseObject, $routeParams, $location, $filter, Auth) {
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
        
        // TODO: Parse data in event.chartData to output labels
        var parse = function(parseData, duration) {
          var outData = {
            labels: [],
            series: [
              []
            ]
          };
          var parseDataLength = parseData.length;
          for(var i = 0; i < parseDataLength; i++) {
            outData.series[0].push(100 * (1 / (parseData[i] - parseData[i - 1])));
            outData.labels.push($filter('date')((duration / parseDataLength * i * 1000), 'mm:ss'));
          }
          outData.labels.shift();
          outData.series[0].shift();
          return outData;
        };
        
        var arrayMax = function(array) {
          return array.reduce(function(a, b) {
            return Math.max(a, b);
          });
        };
        
        $scope.event.$watch(function() {
          var chartData = parse($scope.event.graphData, $scope.event.time);
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
            high: arrayMax(chartData.series[0]) + 2,
            axisX: {
              labelInterpolationFnc: function(value, index) {
                return index % 10 === 0 ? value : null;
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
          new Chartist.Line('.ct-chart', chartData, chartOptions, chartOptionsResponsive);
        })
      }
      else {
        $location.path('/');
      }
    })
  });
