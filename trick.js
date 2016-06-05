'use strict';

angular.module('trick', [
  'ngRoute',
  'trick.dash',
  'trick.detail',
  'firebase'
])

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/dash'});
}]);