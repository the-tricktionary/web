'use strict';

angular.module('trick.about', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/about', {
        templateUrl: '/about/about.html',
        controller: 'AboutCtrl'
      });
    }
  ])
  
  .controller('AboutCtrl', function($scope, $location, $anchorScroll) {
    $scope.anchor = $location.hash();
    $anchorScroll.yOffset = 40;
    $anchorScroll();
  });
