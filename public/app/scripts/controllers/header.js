'use strict';

angular.module('myApp')
  .controller('HeaderCtrl', function ($rootScope, $scope) {
    $scope.showFavourites = function () {
      $rootScope.$broadcast('showFavourites', {
        someProp: 'Sending you an Object!' // send whatever you want
      });
    };
  });
