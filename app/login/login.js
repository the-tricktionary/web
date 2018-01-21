'use strict'
/* global angular, firebase */
/**
 * @class trick.login
 * @memberOf trick
 * @requires ngRoute
 * @requires ngSanitize
 */
angular.module('trick.login', ['ngRoute', 'ngSanitize'])

  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/login', {
        templateUrl: '/login/login.html',
        controller: 'LoginCtrl'
      })
    }
  ])

  /**
   * @class trick.news.loginCtrl
   * @param {service} $scope
   * @param {service} Auth
   * @param {service} Db
   */
  .controller('LoginCtrl', function ($scope, Auth, Db) {
    $scope.Subpage('Login')

    /**
     * Formatter for error objects
     * @param  {String} what  email | phone | social
     * @param  {Object} error {code<String>, message<String>}
     * @return {String}
     */
    $scope.Err = function (what, error) {
      $scope.err[what] = error.code + ' - ' + error.message
      return $scope.err[what]
    }

    /** Stores the result for the captcha and phone verification until the code has been sent */
    $scope.confirmationResult = undefined
    /** Weather or not do display certain elements */
    $scope.display = {
      'password': true,
      'phone': true,
      'google.com': true,
      'twitter.com': false,
      'facebook.com': false,
      'github.com': false,
      phoneCode: false
    }
    /** Providers for linking additional sign in methods */
    $scope.providers = {
      google: new firebase.auth.GoogleAuthProvider(),
      facebook: new firebase.auth.FacebookAuthProvider(),
      twitter: new firebase.auth.TwitterAuthProvider(),
      github: new firebase.auth.GithubAuthProvider()
    }
    /** object containing formatted error messages */
    $scope.err = {
      social: '',
      email: '',
      phone: ''
    }
    /** values of the input fields */
    $scope.auth = {
      email: '',
      password: '',
      phone: '',
      phoneCode: ''
    }
    /** the recaptcha */
    $scope.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('phone-sign-in', {
      'size': 'invisible',
      'callback': function (response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        $scope.test = true
      }
    })

    /**
     * Takes $scope.auth.phone and sends a verification code if $scope.RecaptchaVerifier
     * has passed
     * @return {Undefined} Does not return
     */
    $scope.phoneSendCode = function () {
      if ($scope.user) {
        $scope.user
          .linkWithPhoneNumber($scope.auth.phone, $scope.recaptchaVerifier)
          .then(function (confirmationResult) {
            // SMS sent
            $scope.confirmationResult = confirmationResult
            $scope.display.phoneCode = true
            $scope.$apply()
          })
          .catch(function (err) {
            // Error; SMS not sent
            $scope.recaptchaVerifier.render()
              .then(function (widgetId) {
                $scope.recaptchaVerifier.reset(widgetId)
              })
            $scope.Err('phone', err)
          })
      } else {
        firebase.auth()
          .signInWithPhoneNumber($scope.auth.phone, $scope.recaptchaVerifier)
          .then(function (confirmationResult) {
            // SMS sent
            $scope.confirmationResult = confirmationResult
            $scope.display.phoneCode = true
            $scope.$apply()
          })
          .catch(function (err) {
            // Error; SMS not sent
            $scope.recaptchaVerifier.render()
              .then(function (widgetId) {
                $scope.recaptchaVerifier.reset(widgetId)
              })
            $scope.Err('phone', err)
          })
      }
    }

    /**
     * Checks if the code sent by $scope.phoneSendCode is valid and signs the user in
     * @return {Undefined}
     */
    $scope.phoneSignIn = function () {
      $scope.confirmationResult.confirm($scope.auth.phoneCode)
      .then(function (user) {
        $scope.confirmationResult = undefined
        $scope.display.phoneCode = false
        $scope.$apply()
      })
      .catch(function (err) {
        // User couldn't sign in (bad verification code?)
        $scope.Err('phone', err)
      })
    }

    /**
     * Opens a popup to sign in with a social auth provider
     * @param  {String}    what google | facebook | twitter | GitHub
     * @return {Undefined}
     */
    $scope.socialSignIn = function (what) {
      if ($scope.user) {
        $scope.user.linkWithPopup($scope.providers[what])
        .then(function () {
          $scope.display[what + '.com'] = false
          $scope.$apply()
        })
        .catch(function (err) {
          $scope.Err('social', err)
        })
      } else {
        Auth.$signInWithPopup(what)
          .catch(function (err) {
            $scope.Err('social', err)
          })
      }
    }

    /**
     * takes $scope.auth.email, $scope.auth.password and signs the user in
     * @return {Undefined}
     */
    $scope.emailSignIn = function () {
      Auth.$signInWithEmailAndPassword($scope.auth.email, $scope.auth.password)
        .catch(function (err) {
          $scope.Err('email', err)
        })
    }

    /**
     * takes $scope.auth.email, $scope.auth.password and signs the user up
     * @return {Undefined}
     */
    $scope.emailSignUp = function () {
      var email = $scope.auth.email
      var password = $scope.auth.password
      Auth.$createUserWithEmailAndPassword(email, password)
      .then(function (user) {
        user.sendEmailVerification()
        $scope.auth.email = email
        $scope.auth.password = password
        $scope.signIn('email')
        $scope.apply()
      })
      .catch(function (err) {
        $scope.Err('email', err)
      })
    }

    /**
     * Wrapper function to call the correct signIn function
     * @param  {String} what email | phone | google | facebook | twitter | github
     * @return {Undefined}
     */
    $scope.signIn = function (what) {
      if (what === 'google' || what === 'facebook' || what === 'twitter' || what === 'github') {
        $scope.socialSignIn(what)
      } else if (what === 'email') {
        $scope.emailSignIn()
      } else if (what === 'phone') {
        if ($scope.confirmationResult) {
          $scope.phoneSignIn()
        } else {
          $scope.phoneSendCode()
        }
      }
    }

    /**
     * Change rhe users email or password (potentially even phone number)
     * @param  {String} what email | password
     * @return {Undefined}
     */
    $scope.change = function (what) {
      if (what === 'email') {
        $scope.user.updateEmail($scope.auth.email)
        .then(function () {
          $scope.user.sendEmailVerification()
        })
        .catch(function (err) {
          $scope.Err('email', err)
        })
      } else if (what === 'password') {
        if (!$scope.display.password) {
          $scope.user.updatePassword($scope.auth.password)
          .catch(function (err) {
            $scope.Error('email', err)
          })
        } else {
          var credential = new firebase.auth.EmailAuthProvider.credential($scope.auth.email, $scope.auth.password) // eslint-disable-line
          $scope.user.linkWithCredential(credential)
          .then(function () {
            $scope.display.password = false
            $scope.$apply()
          })
          .catch(function (err) {
            $scope.Err('email', err)
          })
        }
      } else if (what === 'phone') {
        $scope.Err('phone', {code: 'auth/not-implemented', message: 'Unfortunately this is not yet possible'})
      }
    }

    Auth.$onAuthStateChanged(function (user) {
      var k = Object.keys($scope.display)
      var i

      for (i = 0; i < k.length; i++) {
        if ($scope.display[k[i]] === false && k[i] !== 'phoneCode') {
          $scope.display[k[i]] = true
        }
        if ($scope.display[k[i]] === true && k[i] === 'phoneCode') {
          $scope.display[k[i]] = false
        }
      }
      $scope.user = undefined
      $scope.auth = {
        email: '',
        password: '',
        phone: '',
        phoneCode: ''
      }
      $scope.success = ''

      if (user) {
        $scope.user = user
        var p = user.providerData

        $scope.success = 'You are signed in! you can connect multiple ways to sign in below or change what you already have set'

        for (i = 0; i < p.length; i++) {
          if ($scope.display[p[i].providerId] === true) {
            $scope.display[p[i].providerId] = false
          }
        }

        $scope.auth.email = user.email || ''
        $scope.auth.phone = user.phoneNumber || ''

        Db.child('users/' + $scope.user.uid + '/profile')
          .update({
            'name': $scope.user.displayName.split(' '),
            'image': $scope.user.providerData[0].photoURL
          })
      }
    })
  })
