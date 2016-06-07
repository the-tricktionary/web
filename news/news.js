'use strict';

angular.module('trick.news', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/news', {
    templateUrl: '/news/news.html',
    controller: 'NewsCtrl'
  });
}])

.controller('NewsCtrl', function($scope, $firebaseArray, $routeParams, $sce) {
  var ref = firebase.database().ref().child("news");
  // create a synchronized array
  $scope.news = $firebaseArray(ref);
});
