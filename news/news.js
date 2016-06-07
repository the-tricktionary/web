'use strict';

angular.module('trick.news', ['ngRoute', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/news', {
    templateUrl: '/news/news.html',
    controller: 'NewsCtrl'
  });
}])

.controller('NewsCtrl', function($scope, $firebaseArray) {
  var ref = firebase.database().ref().child("news");
  // create a synchronized array
  $scope.news = $firebaseArray(ref);
});
