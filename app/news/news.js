'use strict';
/**
 * @class trick.news
 * @memberOf trick
 * @requires ngRoute
 * @requires ngSanitize
 */
angular.module('trick.news', ['ngRoute', 'ngSanitize'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/news', {
        templateUrl: '/news/news.html',
        controller: 'NewsCtrl'
      });
    }
  ])

  /**
   * @class trick.news.newsCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   */
  .controller('NewsCtrl', function($scope, $firebaseArray, Db) {
    /** Create reference to database path */
    var ref = Db.child("news");
    /**
     * @name $scope.news
     * @function
     * @memberOf trick.news.newsCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.news = $firebaseArray(ref);
  });
