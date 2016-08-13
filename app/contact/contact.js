'use strict';
/**
 * @class trick.contact
 * @memberOf trick
 * @requires ngRoute
 */
angular.module('trick.contact', ['ngRoute'])
  
  .config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/contact', {
        templateUrl: '/contact/contact.html',
        controller: 'ContactCtrl'
      });
    }
  ])
  
  /**
   * @class trick.contact.ContactCtrl
   * @param {service} $scope
   * @param {service} $firebaseArray
   * @param {service} $location
   * @param {service} Auth
   */
  .controller('ContactCtrl', function($scope, $firebaseArray, $location, Auth) {
    /** Create reference to databae path */
    var ref = firebase.database().ref().child("contact");
    /**
     * @name $scope.contact
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description create a synchronized array stored in scope
     */
    $scope.contact = $firebaseArray(ref);
    
    /**
     * @name $scope.submitGen
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a general question
     */
    $scope.submitGen = function() {
      /** Use user input as displayName if not  authenticated */
      if($scope.user.uid == undefined) {
        $scope.user.displayName = document.getElementById('name').value;
      }
      /** get User Input */
      var issue = document.getElementById('desc').value;
      var newType = document.getElementById('type').value;
      
      /** if name and issue isn't empty, save to db and redirect to frontpage, if not make error */
      if($scope.user.displayName && issue !== "") {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        $scope.contact.$add({
          name: $scope.user.displayName,
          desc: issue,
          type: newType
        });
        $location.path('/');
      }
      else {
        /**
         * @name $scope.error
         * @type {string}
         * @description error text
         */
        $scope.error = "You need to enter a value into all fields"
      }
    };
    
    /**
     * @name $scope.submitLev
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a report of an incorrect level
     */
    $scope.submitLev = function() {
      /** Use user input as displayName if not  authenticated */
      if($scope.user.uid == undefined) {
        $scope.user.displayName = document.getElementById('name').value;
      }
      /** get User Input */
      var newOrg = document.getElementById('org').value;
      var newId0 = document.getElementById('id0').value;
      var newId1 = document.getElementById('id1').value;
      var newLvl = document.getElementById('level').value;
      var newType = document.getElementById('type').value;
      
      /** if name and id0 and id1 and suggestedLvl and what organization is filled save to db and redirect to frontpage, if not make error */
      if($scope.user.displayName && newId0 && newId1 && newLvl && newOrg) {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        $scope.contact.$add({
          name: $scope.user.displayName,
          id0: newId0,
          id1: newId1,
          level: newLvl,
          org: newOrg,
          type: newType
        });
        $location.path('/');
      }
      else {
        /**
         * @name $scope.error
         * @type {string}
         * @description error text
         */
        $scope.error = "You need to enter a value into all fields"
      }
    };
  
    /**
     *
     */
    Auth.$onAuthStateChanged(function() {
      if($scope.user && ($scope.user.uid == "g0G3A7FxieN333lZ2RKclkmv9Uw1" || $scope.user.uid == 'Kpz3afszjBR0qwZYUrKURRJx2cm2')) {
        /**
         * @name $scope.admin
         * @type {boolean}
         * @description true if the authenticated user is an administrator, only for display purposes - access is managed in db
         */
        $scope.admin = true;
      }
    });
  });
