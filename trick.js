'use strict';

angular.module('trick', [
  'ngRoute',
  'trick.dash',
  'trick.details',
  'firebase'
])

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/dash'});
}]);