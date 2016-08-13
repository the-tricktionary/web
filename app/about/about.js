'use strict';
/**
 * @class trick.about
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.about', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/about', {
        templateUrl: '/about/about.html',
        controller: 'AboutCtrl'
      });
    }
  ])

  /**
   * @class trick.about.AboutCtrl
   * @param {service} $scope
   * @param {service} $location
   * @param {service} $anchorScroll
   *
   */
  .controller('AboutCtrl', function($scope, $location, $anchorScroll) {
    /**
     * @name $scope.anchor
     * @function
     * @memberOf trick.about.AboutCtrl
     * @description Store URL's anchor value (`#disclaimer` for example) in the scope
     */
    $scope.anchor = $location.hash();
    /** Configure $anchorScroll to take the navbar into consideration*/
    $anchorScroll.yOffset = 40;
    /** Scroll To anchor */
    $anchorScroll();
  });
