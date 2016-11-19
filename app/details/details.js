'use strict';
/**
 * @class trick.details
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.details', ['ngRoute'])

.config([
    '$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/details/:id0/:id1', {
      templateUrl: '/details/details.html',
      controller: 'DetailsCtrl'
    });
    }
  ])

/**
 * @class trick.details.DetailsCtrl
 * @param {service} $scope
 * @param {service} $firebaseObject
 * @param {service} $routeParams
 * @param {service} $sce
 * @param {service} Db
 * @param {service} Auth
 */
.controller('DetailsCtrl', function($scope, $firebaseObject, $firebaseArray,
  $routeParams, $sce, $location, Db, Auth) {
  /**
   * @name $scope.id0
   * @type {string}
   * @memberOf trick.details.DetailsCtrl
   */
  $scope.id0 = Number($routeParams.id0);
  /**
   * @name $scope.id1
   * @type {string}
   * @memberOf trick.details.DetailsCtrl
   */
  $scope.id1 = Number($routeParams.id1);
  /** Create reference to database path */
  var ref = Db.child("tricks/" + $scope.id0 + "/subs");
  /**
   * @name $scope.trick
   * @function
   * @memberOf trick.details.DetailsCtrl
   * @description create a synchronized *object* stored in scope
   */
  $scope.trick = $firebaseObject(ref.child($scope.id1));

  Auth.$onAuthStateChanged(function() {
    if ($scope.user) {
      var ref2 = Db.child("checklist/" + $scope.user.uid + "/" +
        $scope.id0 + "/" + $scope.id1);
      $scope.done = $firebaseObject(ref2);
    }
  });

  if ($scope.id1 == 0 && $scope.id0 != 0) {
    /** Create reference to database path */
    var refPrev = Db.child("tricks/" + ($scope.id0 - 1) + "/subs");
    /**
     * @name prevArr
     * @function
     * @memberOf trick.details.DetailsCtrl
     * @description create a synchronized *array*
     */
    var prevArr = $firebaseArray(refPrev);
    prevArr.$loaded()
      .then(function(data) {
        $scope.prevMax = data.length - 1;
      });
  }

  /**
   * @name maxArr
   * @function
   * @memberOf trick.details.DetailsCtrl
   * @description create a synchronized *array*
   */
  var maxArr = $firebaseArray(ref);
  maxArr.$loaded()
    .then(function(data) {
      $scope.thisMax = data.length - 1;
    })

  var maxRef = Db.child("tricks")
  var maxPar = $firebaseArray(maxRef);
  maxPar.$loaded()
    .then(function(data) {
      $scope.levMax = data.length - 1;
    })

  $scope.trick.$loaded()
    .then(function(data) {
      if (!data.name) {
        $scope.Error("404 - Trick Not Found");
        $location.path("/");
      }
    });
  /**
   * @name $scope.trustAsResourceUrl
   * @function
   * @description Trust url constructed on page for video as usable
   */
  $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
});
