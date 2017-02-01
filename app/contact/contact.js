'use strict';
/**
 * @class trick.contact
 * @memberOf trick
 * @requires ngRoute
 */

angular.module('trick.contact', ['ngRoute'])

  .config([
    '$routeProvider',
  function($routeProvider) {
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
   * @param {service} $anchorScroll
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('ContactCtrl', function($scope, $firebaseArray, $location,
    $anchorScroll,
    Auth, Db) {
    Auth.$onAuthStateChanged(function() {
      $scope.Subpage("Contact")
      /**
       * Sign in as anon if signed out
       */
      if (!$scope.user) {
        Auth.$signInAnonymously()
          .then(function(firebaseUser) {
            $scope.user = firebaseUser;
          })
          .catch(function(error) {
            $scope.Error(error);
          });
      }
      /**
       * Set user's name if not anon
       */
      if ($scope.user && !$scope.user.isAnonymous) {
        /**
         * @name $scope.newName
         * @type {string}
         * @description contains user's Display name
         */
        $scope.newName = $scope.user.displayName;
        /**
         * @name $scope.newEmail
         * @type {string}
         * @description contains user's email
         */
        $scope.newEmail = $scope.user.email;
      }
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
      } else {
        $scope.admin = false;
      }

      /** Configure $anchorScroll to take the navbar into consideration*/
      $anchorScroll.yOffset = 200;

      /** Create reference to database path */
      if ($scope.admin) {
        var u = $location.search()
          .u;
        if (u) {
          var ref = Db.child("contact/" + u);
          $scope.person = $firebaseArray(ref);
          $scope.u = true;
          if ($scope.i) {
            $scope.person.$loaded()
              .then(function() {
                setTimeout(function() {
                  $anchorScroll($scope.i)
                }, 500);
              });
          }
        } else {
          var ref = Db.child("contact");
          $scope.people = $firebaseArray(ref);
          $scope.u = false;
        }
      } else {
        var ref = Db.child("contact/" + $scope.user.uid);
        /**
         * @name $scope.contact
         * @function
         * @memberOf trick.contact.ContactCtrl
         * @description create a synchronized array stored in scope
         */
        $scope.person = $firebaseArray(ref);
        if ($scope.i) {
          $scope.person.$loaded()
            .then(function() {
              setTimeout(function() {
                $anchorScroll($scope.i)
              }, 500);
            });
        }
      }
    });

    /** Get querystring params */
    /**
     * @name $scope.newType
     * @type {?string}
     * @description contains type
     */
    $scope.newType = $location.search()
      .t;
    /**
     * @name $scope.newId0
     * @type {?number}
     * @description contains id0
     */
    $scope.newId0 = Number($location.search()
      .id0);
    /**
     * @name $scope.newId1
     * @type {?number}
     * @description contains id1
     */
    $scope.newId1 = Number($location.search()
      .id1);
    /**
     * @name $scope.i
     * @type {?string}
     * @description contains id of a specific issue to be highlighted
     */
    $scope.i = $location.search()
      .i;
    /**
     * @name $scope.unsub
     * @type {?string}
     * @description contains id of a specific issue to be unsubscribed from updates about
     */
    $scope.unsub = $location.search()
      .unsub;

    if ($scope.unsub && $scope.unsub !== "") {
      ref.child($scope.unsub + "/email")
        .set(null, function(err) {
          if (err) {
            $scope.Error(err)
          } else {
            $scope.Error("Unsubscribed from further updates about issue")
          }
        })
    }

    /**
     * @name $scope.submitGen
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a general question
     */
    $scope.submitGen = function(emailupdates) {
      /** get User Input */
      var issue = document.getElementById('desc')
        .value;
      var email = emailupdates;
      var newType = document.getElementById('type')
        .value;
      $scope.newName = ($scope.newName ? $scope.newName : document.getElementById(
          "name")
        .value);
      $scope.newEmail = ($scope.newEmail ? $scope.newEmail : document.getElementById(
          "email")
        .value)

      /** if name and issue isn't empty, save to db and redirect to frontpage, if not make error */
      if ($scope.newName && $scope.newEmail && issue !== "") {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        $scope.person.$add({
          name: $scope.newName,
          desc: issue,
          type: newType,
          email: (email ? $scope.newEmail : null)
        });
      } else {
        /**
         * @name $scope.error
         * @type {string}
         * @description error text
         */
        $scope.Error("Please describe your issue");
      }
    };

    /**
     * @name $scope.submitLev
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a report of an incorrect level
     */
    $scope.submitLev = function(emailupdates) {
      /** get User Input */
      var newId0 = document.getElementById('id0')
        .value;
      var newId1 = document.getElementById('id1')
        .value;
      var newOrg = document.getElementById('org')
        .value;
      var newLvl = document.getElementById('level')
        .value;
      var email = emailupdates;
      var newType = document.getElementById('type')
        .value;
      $scope.newName = ($scope.newName ? $scope.newName : document.getElementById(
          "name")
        .value);
      $scope.newEmail = ($scope.newEmail ? $scope.newEmail : document.getElementById(
          "email")
        .value)

      /** if name and id0 and id1 and suggestedLvl and what organization is filled save to db and redirect to frontpage, if not make error */
      if ($scope.newName && $scope.newEmail && newId0 && newId1 && newLvl &&
        newOrg) {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        $scope.person.$add({
          name: $scope.newName,
          id0: newId0,
          id1: newId1,
          level: newLvl,
          org: newOrg,
          type: newType,
          email: (email ? $scope.newEmail : null)
        });
      } else {
        /**
         * @name $scope.error
         * @type {string}
         * @description error text
         */
        if (!newId0 || !newId1) {
          $scope.Error("Please Select what trick the error is affecting");
        } else
        if (!newOrg) {
          $scope.Error("Please Select the ruleset the error is in");
        } else
        if (!newLvl) {
          $scope.Error("Please Select what level the trick should be");
        };
      }
    };

    /**
     * @name $scope.submitTrick
     * @function
     * @memberOf trick.contact.ContactCtrl
     * @description function to submit a new Trick
     */
    $scope.submitTrick = function() {
      // if($scope.user.isAnonymous) {
      // $scope.error = "You need to submit a trick";
      // return;
      // }
      /** get User Input */
      var newTrickName = document.getElementById('newTrickName')
        .value;
      var newDesc = document.getElementById('newDesc')
        .value;
      var newTrickType = document.getElementById('newTrickType')
        .value;
      var newVideoPath = document.getElementById('newVideo')
        .value;
      var newVideo = document.getElementById('newVideo')
        .files[0];
      var ext = newVideoPath.split('.')
        .pop();
      var filename = Math.random()
        .toString(36)
        .substring(7);
      var storageRef = firebase.storage()
        .ref("submit/" + filename + "." + ext);
      var probar = document.getElementById("pro-bar");
      var prolab = document.getElementById("pro-lab");
      $scope.newName = ($scope.newName ? $scope.newName : document.getElementById(
          "name")
        .value);
      $scope.newEmail = ($scope.newEmail ? $scope.newEmail : document.getElementById(
          "email")
        .value)

      /** if newTrickName and newDesc and newTrickType and isn't empty, save to db */
      if ($scope.newName && $scope.newEmail && newTrickName && newDesc &&
        newTrickType && (
          newVideo.size < (100 * 1024 * 1024)) && !$scope.user.isAnonymous) {
        /**
         * @name $scope.error
         * @type {undefined}
         * @description reset error
         */
        $scope.error = undefined;
        /**
         * @name newMeta
         * @type {object}
         * @description set metadata
         */
        var newMeta = {
          customMetadata: {
            'name': $scope.newName,
            'trickName': newTrickName,
            'desc': newDesc,
            'trickType': newTrickType,
            'email': $scope.newEmail,
            'uid': $scope.user.uid
          }
        };
        var uploadTask = storageRef.put(newVideo, newMeta);
        probar.style.width = "1%";
        uploadTask.on("state_changed", function progress(snapshot) {
          var progress = snapshot.bytesTransferred / snapshot.totalBytes *
            100 | 0;
          probar.style.width = progress + '%';
          prolab.innerHTML = progress + '%';
        }, function(e) {
          $scope.Error(e)
        }, function() { // success
          prolab.innerHTML = "Thank you!"
        })
      } else {
        /**
         * @name $scope.error
         * @type {string}
         * @description error text
         */
        if (!$scope.newName) {
          $scope.Error("please enter a name");
        } else
        if (!newTrickName) {
          $scope.Error("Please name the trick");
        } else
        if (!newDesc) {
          $scope.Error("Please describe the trick with a few words");
        } else
        if (newVideo.size > (100 * 1024 * 1024)) {
          $scope.Error("The file is too big");
        } else
        if (!newTrickType) {
          $scope.Error(
            "please select what type of trick you are submitting");
        };
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
      if ($scope.user.isAnonymous) {
        $scope.Error("You need to be signed in to reply to an issue");
        return;
      }
      /**
       * @name len
       * @type {number}
       * @description get length of $scope.person[$scope.person.$indexFor(issue.$id)].replies array or return 0 if nonexistent
       */
      var len = ($scope.person[$scope.person.$indexFor(issue.$id)].replies ?
        $scope.person[$scope.person.$indexFor(issue.$id)].replies.length :
        0);
      /**
       * @name $scope.person[$scope.person.$indexFor(issue.$id)].replies
       * @type {object}
       * @description return object replies if existing, else init empty object
       */
      $scope.person[$scope.person.$indexFor(issue.$id)].replies = ($scope.person[
        $scope.person.$indexFor(issue.$id)].replies ? $scope.person[
        $scope.person.$indexFor(issue.$id)].replies : {});
      /**
       * @name $scope.person[$scope.person.$indexFor(issue.$id)].replies[0 + len]
       * @type {object}
       * @description assign user's name and reply to a new child in object's array
       */
      $scope.person[$scope.person.$indexFor(issue.$id)].replies[0 + len] = {
        name: $scope.newName,
        reply: newReplyText
      };
      $scope.person.$save(issue);
    }

    $scope.keys = Object.keys

    $scope.$location = $location;
  });
