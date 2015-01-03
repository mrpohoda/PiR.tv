'use strict';

angular.module('myApp')
  .controller('HeaderCtrl', function ($rootScope, $scope, youtube) {
    youtube.getFavouriteCategories().then(function (data) {
      data.unshift('All favourites');
      $scope.favouriteCategories = data;
    });

    $scope.showFavourites = function (category) {
      $rootScope.$broadcast('showFavourites', {
        category: category
      });
    };
  });
