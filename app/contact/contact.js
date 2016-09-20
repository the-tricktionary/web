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
  .controller('ContactCtrl', function($scope, $firebaseArray, $location, $sce, Auth) {
    Auth.$onAuthStateChanged(function() {
	  /**
	   * Sign in as anon if signed out
	   */
	  if(!$scope.user) {
		Auth.$signInAnonymously()
		  .then(function(firebaseUser) {
          })
          .catch(function(error) {
            $scope.error = error;
          });
	  }
	  /**
	   * Set user's name if not anon
	   */
	  if($scope.user && !$scope.user.isAnonymous) {
		/**
		 * @name $scope.newName
		 * @type {string}
		 * @description contains user's Display name
		 */
	    $scope.newName = $scope.user.displayName;
	  }
	  /**
       * Check if Admin
       */
      if($scope.user && ($scope.user.uid == "g0G3A7FxieN333lZ2RKclkmv9Uw1" || $scope.user.uid == 'Kpz3afszjBR0qwZYUrKURRJx2cm2')) {
        /**
         * @name $scope.admin
         * @type {boolean}
         * @description true if the authenticated user is an administrator, only for display purposes - access is managed in db
         */
        $scope.admin = true;
      }
      else {
        $scope.admin = false;
      }
	
	/** Create reference to database path */
	if($scope.admin) {
      var ref = firebase.database().ref().child("contact");
      var users = $firebaseArray(ref);
      /**
       * I hereby excuse for the following, horrible solution. it's not my desidcion.
       */
      users.$watch(function() {
          var refs = [];   
          $scope.users = [];          
          for(var i = 0; i < users.length; i++) {
            refs[i] = firebase.database().ref().child("contact/" + users[i].$id);
            $scope.users[i] = $firebaseArray(refs[i]);
          }
      })
    } else {
	  var ref = firebase.database().ref().child("contact/" + $scope.user.uid);
      /**
       * @name $scope.contact
       * @function
       * @memberOf trick.contact.ContactCtrl
       * @description create a synchronized array stored in scope
       */
      $scope.users = $firebaseArray(ref);
	}
	
    });
	
	/** Get querystring params */
	/**
	 * @name $scope.newType
	 * @type {?string}
	 * @description contains type 
	 */
	$scope.newType = $location.search().t;
	/**
	 * @name $scope.newId0
	 * @type {?number}
	 * @description contains id0
	 */
	$scope.newId0 = Number($location.search().id0);
	/**
	 * @name $scope.newId1
	 * @type {?number}
	 * @description contains id1
	 */
	$scope.newId1 = Number($location.search().id1);
	
    /**
     * @name $scope.submitGen
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a general question
     */
    $scope.submitGen = function() {
      /** get User Input */
      var issue = document.getElementById('desc').value;
      var newType = document.getElementById('type').value;
      
      /** if name and issue isn't empty, save to db and redirect to frontpage, if not make error */
      if($scope.newName && issue !== "") {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        $scope.users.$add({
          name: $scope.newName,
          desc: issue,
          type: newType
        });
      }
      else {
        /**
         * @name $scope.error
         * @type {string}
         * @description error text
         */
        $scope.error = "You need to enter a value into all fields";
      }
    };
    
    /**
     * @name $scope.submitLev
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a report of an incorrect level
     */
    $scope.submitLev = function() {
      /** get User Input */
	  var newId0 = document.getElementById('id0').value;
	  var newId1 = document.getElementById('id1').value;
      var newOrg = document.getElementById('org').value;
      var newLvl = document.getElementById('level').value;
      var newType = document.getElementById('type').value;
      
      /** if name and id0 and id1 and suggestedLvl and what organization is filled save to db and redirect to frontpage, if not make error */
      if($scope.newName && newId0 && newId1 && newLvl && newOrg) {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        $scope.users.$add({
          name: $scope.newName,
          id0: newId0,
          id1: newId1,
          level: newLvl,
          org: newOrg,
          type: newType
        });
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
     * @name $scope.submitTrick
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a new Trick
     */
	$scope.submitTrick = function() {
	  /** get User Input */
	  var newTrickName = document.getElementById('newTrickName').value;
      var newDesc = document.getElementById('newDesc').value;
      var newLink = document.getElementById('newLink').value;
      var newTrickType = document.getElementById('newTrickType').value;
	  var newType = document.getElementById('type').value;
		
      /** if newTrickName and newDesc and newTrickType and newLink isn't empty, save to db */
      if($scope.newName && newTrickName && newDesc && newTrickType && newLink) {
            /**
             * @name $scope.error
             * @type {undefined}
             * @description reset error
             */
            $scope.error = undefined;
            /**
             * @description generate random number as string - used to determinate savepath and video location
             * @type {string}
             */
            //var random = (Math.random() * 1000000 ).toFixed(0);
            $scope.users.$add({
			  name: $scope.newName,
              trickName: newTrickName,
              desc: newDesc,
              trickType: newTrickType,
              video: newLink,
			  type: newType
            });
          }
          else {
            /**
             * @name $scope.error
             * @type {string}
             * @description error text
             */
            $scope.error = "You need to enter a value into all fields"
          }
        }
	
	/**
     * @name $scope.newReply
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description reply to an issue
	 * @param {object} issue
	 * @param {string} newReplyText
     */
	$scope.newReply = function(issue, newReplyText) {
	  /**
	   * If user is anonymous, refuse reply spam preventation
	   */
	  if($scope.user.isAnonymous) {
	    $scope.error = "You need to be signed in to reply to an issue";
		return;
	  }
	  /**
	   * @name len
	   * @type {number}
	   * @description get length of $scope.users[$scope.users.$indexFor(issue.$id)].replies array or return 0 if nonexistent
	   */ 
	  var len = ($scope.users[$scope.users.$indexFor(issue.$id)].replies ? $scope.users[$scope.users.$indexFor(issue.$id)].replies.length : 0);
	  /**
	   * @name $scope.users[$scope.users.$indexFor(issue.$id)].replies
	   * @type {object}
	   * @description return object replies if existing, else init empty object
	   */
	  $scope.users[$scope.users.$indexFor(issue.$id)].replies = ($scope.users[$scope.users.$indexFor(issue.$id)].replies ? $scope.users[$scope.users.$indexFor(issue.$id)].replies : {});
	  /**
	   * @name $scope.users[$scope.users.$indexFor(issue.$id)].replies[0 + len]
	   * @type {object}
	   * @description assign user's name and reply to a new child in object's array
	   */
	  $scope.users[$scope.users.$indexFor(issue.$id)].replies[0 + len] = {
	    name: $scope.newName,
	    reply: newReplyText
	  };
	  $scope.users.$save(issue);
	}
    
    /**
     * @name $scope.newAdminReply
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description reply to an issue
	 * @param {object} issue
	 * @param {string} newReplyText
     */
	$scope.newAdminReply = function(issue, user, newReplyText) {
	  /**
	   * If user is anonymous or not admin, refuse reply spam preventation
	   */
	  if($scope.user.isAnonymous || !$scope.admin) {
	    $scope.error = "You need to be signed in to reply to an issue";
		return;
	  }
	  /**
	   * @name len
	   * @type {number}
	   * @description get length of issue.replies array or return 0 if nonexistent
	   */ 
   	  var len = (issue.replies ? issue.replies.length : 0);
	  /**
	   * @name $scope.users[$scope.users.$indexFor(issue.$id)].replies
	   * @type {object}
	   * @description return object replies if existing, else init empty object
	   */
	  issue.replies = (issue.replies ? issue.replies : {})
	  /**
	   * @name $scope.users[$scope.users.$indexFor(issue.$id)].replies[0 + len]
	   * @type {object}
	   * @description assign user's name and reply to a new child in object's array
	   */
	  issue.replies[0 + len] = {
	    name: $scope.newName,
	    reply: newReplyText
	  };
	  $scope.users[user].$save(user);
	}
	
	/**
     * @name $scope.trustAsResourceUrl
     * @function
     * @description Trust url constructed on page for video as usable
     */
    $scope.trustAsResourceUrl = $sce.trustAsResourceUrl;
  });
