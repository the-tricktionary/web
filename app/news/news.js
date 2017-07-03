'use strict';
/**
 * @class trick.news
 * @memberOf trick
 * @requires ngRoute
 * @requires ngSanitize
 */
angular.module('trick.news', ['ngRoute', 'ngSanitize'])

  .config([
    '$routeProvider',
  function($routeProvider) {
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
   * @param {service} $filter
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('NewsCtrl', function($scope, $firebaseArray, $filter, Auth, Db) {
    $scope.Subpage("News");
    /** Create reference to database path */
    var ref = Db.child("news");
    /**
     * @name $scope.news
     * @function
     * @memberOf trick.news.newsCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.news = $firebaseArray(ref);

    Auth.$onAuthStateChanged(function() {
      /**
       * Check if Admin
       * Also regulated by db security rules
       */
      if ($scope.user && ($scope.user.uid ==
          "g0G3A7FxieN333lZ2RKclkmv9Uw1" || $scope.user.uid ==
          'Kpz3afszjBR0qwZYUrKURRJx2cm2')) {
        /**
         * @name $scope.admin
         * @type {boolean}
         * @description true if the authenticated user is an administrator, only for display purposes - access is managed in db
         */
        $scope.admin = true;

        $scope.newArticle = function() {
          $scope.news.$add({
              author: $scope.user.displayName.split(" ")[0],
              date: $filter('date')(new Date(), 'yyyy-MM-dd'),
              title: document.getElementById("title")
                .value,
              content: document.getElementById("content")
                .value
            })
            .then(function() {
              $scope.edit = false;
            })
        }
      } else {
        $scope.admin = false;
      }
    })
  });
