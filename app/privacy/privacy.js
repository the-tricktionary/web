'use strict';

angular.module('trick.privacy', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/privacy', {
        templateUrl: '/privacy/privacy.html',
        controller: 'PrivacyCtrl'
      });
    }
  ])
  
  .controller('PrivacyCtrl', function($scope, $location, $anchorScroll) {
    $scope.anchor = $location.hash();
    $anchorScroll.yOffset = 40;
    $anchorScroll();
  });
