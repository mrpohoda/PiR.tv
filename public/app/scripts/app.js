'use strict';

angular
  .module('myApp', [
    'ngRoute',
    'config',
    'myApp.youtube.service'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
