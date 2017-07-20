'use strict'
/* global angular */
/**
 * @class trick.details
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.details', ['ngRoute'])

  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/details/:id0/:id1', {
        templateUrl: '/details/details.html',
        controller: 'DetailsCtrl'
      })
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
  .controller('DetailsCtrl', function ($scope, $firebaseObject, $firebaseArray,
    $routeParams, $sce, $location, Db, Auth) {
    /**
     * @name $scope.id0
     * @type {string}
     * @memberOf trick.details.DetailsCtrl
     */
    $scope.id0 = Number($routeParams.id0)
    /**
     * @name $scope.id1
     * @type {string}
     * @memberOf trick.details.DetailsCtrl
     */
    $scope.id1 = Number($routeParams.id1)
    /** Create reference to database path */
    var ref = Db.child('tricks')
    /**
     * @name $scope.tricks
     * @function
     * @memberOf trick.details.DetailsCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.tricks = $firebaseArray(ref)
    /**
     * @name $scope.trick
     * @function
     * @memberOf trick.details.DetailsCtrl
     * @description create a synchronized *object* stored in scope
     */
    $scope.trick = $firebaseObject(ref.child($scope.id0).child('subs').child($scope.id1))

    var typeRef = Db.child('tricktypes')
    var tricktypes = $firebaseObject(typeRef)

    $scope.trick.$loaded()
      .then(function () {
        $scope.Subpage(($scope.lang.$value && $scope.trick.i18n[$scope.lang.$value].name
          ? $scope.trick.i18n[$scope.lang.$value].name
          : $scope.trick.name))
      })

    tricktypes.$loaded()
      .then(function () {
        for (var i = 0; i < tricktypes.en.length; i++) {
          if (tricktypes.en[i] === $scope.trick.type) {
            $scope.type = tricktypes[$scope.lang.$value || 'en'][i] ||
              tricktypes.en[i]
          }
        }
      })

    Auth.$onAuthStateChanged(function () {
      if ($scope.user) {
        var ref2 = Db.child('checklist/' + $scope.user.uid + '/' +
          $scope.id0 + '/' + $scope.id1)
        $scope.done = $firebaseObject(ref2)
        var langRef = Db.child('users/' + $scope.user.uid + '/lang')
        $scope.lang = $firebaseObject(langRef)
      }
    })

    $scope.prev = {}
    $scope.next = {}

    if ($scope.id1 === 0 && $scope.id0 !== 0) {
      $scope.prev.id0 = $scope.id0 - 1
      Db.child('tricks').child($scope.prev.id0).child('/subs').limitToLast(1)
        .on('value', function (snapshot) {
          $scope.prev.id1 = Object.keys(snapshot.val())[0]
        })
    } else if ($scope.id1 === 0 && $scope.id0 === 0) {
      $scope.prev.hide = true
    } else {
      $scope.prev.id0 = $scope.id0
      $scope.prev.id1 = $scope.id1 - 1
    }

    Db.child('tricks').child($scope.id0).child('/subs').limitToLast(1)
      .on('value', function (snapshot) {
        var lastId1 = Number(Object.keys(snapshot.val())[0])
        if ($scope.id1 === lastId1) {
          Db.child('tricks').limitToLast(1).on('value', function (snapshot) {
            var lastId0 = Number(Object.keys(snapshot.val())[0])
            if ($scope.id0 === lastId0) {
              $scope.next.hide = true
            } else {
              $scope.next.id0 = $scope.id0 + 1
              $scope.next.id1 = 0
            }
          })
        } else {
          $scope.next.id0 = $scope.id0
          $scope.next.id1 = $scope.id1 + 1
        }
      })

    $scope.trick.$loaded()
      .then(function (data) {
        if (!data.name) {
          $scope.Error('404 - Trick Not Found')
          $location.path('/')
        }
      })
    /**
     * @name $scope.trustAsResourceUrl
     * @function
     * @description Trust url constructed on page for video as usable
     */
    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl
  })
